import responseHandler from "../handlers/response.handler.js";
import Booking from "../models/booking.model.js";
import Ticket from "../models/ticket.model.js";
import Seat from "../models/seat.model.js";
import mongoose from "mongoose";
import { priceByType } from "../helpers/price.js";
import { genTicketCode } from "../helpers/id.js";
import SeatHold from "../models/seatHold.model.js";
import SeatReservation from "../models/seatReservation.model.js";
import Show from "../models/show.model.js";
import Room from "../models/room.model.js";

export const getBookingOfUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    let query = { userId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate({
        path: "showId",
        populate: [
          {
            path: "movieId",
            select: "movieName duration poster", // Thêm thông tin phim
          },
          {
            path: "roomId",
            select: "roomNumber",
            populate: {
              path: "theaterId",
              select: "theaterName", // Thêm thông tin rạp
            },
          },
        ],
        select: "startTime endTime", // Thêm giờ chiếu và kết thúc
      })
      .populate({
        path: "seatIds",
        select: "seatNumber seatType row", // Thêm thông tin ghế
      })
      .populate({
        path: "tickets",
        populate: {
          path: "seatId",
          select: "seatNumber seatType row", // Thêm thông tin ghế cho ticket
        },
      })
      .sort({ createdAt: -1 });

    // Format lại dữ liệu trước khi trả về
    const formattedBookings = bookings.map((booking) => {
      const bookingObj = booking.toObject();
      return {
        ...bookingObj,
        movieInfo: {
          name: booking.showId.movieId.movieName,
          duration: booking.showId.movieId.duration,
          poster: booking.showId.movieId.poster,
        },
        showInfo: {
          startTime: booking.showId.startTime,
          endTime: booking.showId.endTime,
        },
        theaterInfo: {
          theaterName: booking.showId.roomId.theaterId.theaterName,
          roomNumber: booking.showId.roomId.roomNumber,
        },
        seats: booking.seatIds.map((seat) => ({
          seatNumber: seat.seatNumber,
          seatType: seat.seatType,
          row: seat.row,
        })),
      };
    });

    responseHandler.ok(res, {
      message: "Lấy danh sách đặt vé thành công!",
      bookings: formattedBookings,
    });
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    responseHandler.error(res, err.message);
  }
};

export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user._id;
    const { showId, seatIds } = req.body;

    // 1) Validate show
    const show = await Show.findById(showId)
      .select("roomId startTime endTime")
      .session(session);
    if (!show) {
      await session.abortTransaction();
      return responseHandler.notFound(res, "Suất chiếu không tồn tại.");
    }

    // 2) Dedup + lấy ghế
    const dedupSeatIds = [...new Set(seatIds.map(String))];
    const seats = await Seat.find({
      _id: { $in: dedupSeatIds },
      isDeleted: false,
      isDisabled: { $ne: true },
    })
      .select("seatType seatNumber roomId")
      .session(session);

    if (seats.length !== dedupSeatIds.length) {
      await session.abortTransaction();
      return responseHandler.badRequest(
        res,
        "Ghế không hợp lệ hoặc đã bị vô hiệu."
      );
    }

    // 3) Ghế đúng phòng
    if (seats.some((s) => String(s.roomId) !== String(show.roomId))) {
      await session.abortTransaction();
      return responseHandler.badRequest(
        res,
        "Có ghế không thuộc phòng của suất chiếu."
      );
    }

    // 4) Tính giá
    const totalPrice = seats.reduce(
      (sum, s) => sum + priceByType(s.seatType),
      0
    );

    // 5) Tạo booking
    const room = await Room.findById(show.roomId).select("theaterId").lean();
    if (!room?.theaterId)
      return responseHandler.badRequest(res, "Phòng chưa gắn rạp.");

    const [booking] = await Booking.create(
      [
        {
          userId,
          showId,
          seatIds: seats.map((s) => s._id),
          totalPrice,
          status: "pending",
          theaterId: room.theaterId,
        },
      ],
      { session }
    );

    // 6) Phát hành vé ngay (giữ chỗ) – rely on unique (showId, seatId)
    const tickets = await Ticket.insertMany(
      seats.map((s) => ({
        bookingId: booking._id,
        ownerId: userId,
        showId,
        seatId: s._id,
        price: priceByType(s.seatType),
        seatType: s.seatType,
        seatLabel: s.seatNumber,
        code: genTicketCode(s._id),
        status: "active",
      })),
      { session, ordered: true }
    );

    booking.tickets = tickets.map((t) => t._id);
    await booking.save({ session });

    await session.commitTransaction();
    return responseHandler.created(res, {
      message: "Đặt vé thành công! (đang chờ thanh toán)",
      booking,
    });
  } catch (err) {
    await session.abortTransaction();
    if (err?.code === 11000) {
      return responseHandler.conflict(
        res,
        "Một số ghế đã được người khác đặt."
      );
    }
    console.error("Error creating booking:", err);
    return responseHandler.error(res, err.message);
  } finally {
    session.endSession();
  }
};

export const updateBooking = async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return responseHandler.notFound(res, "Không tìm thấy đơn đặt vé!");
    }

    // Chỉ cho phép update những booking chưa bị cancel/expire
    if (["cancelled", "expired"].includes(booking.status)) {
      return responseHandler.badRequest(
        res,
        "Không thể cập nhật đơn đặt vé đã hủy/hết hạn!"
      );
    }

    booking.status = status;

    // Nếu booking được thanh toán, cập nhật status của các ticket
    if (status === "paid") {
      await Ticket.updateMany(
        { bookingId: booking._id },
        { $set: { status: "active" } }
      );
    }

    // Nếu booking bị hủy, cập nhật status của các ticket
    if (status === "cancelled") {
      await Ticket.updateMany(
        { bookingId: booking._id },
        { $set: { status: "cancelled" } }
      );
    }

    await booking.save();

    responseHandler.ok(res, {
      message: "Cập nhật đơn đặt vé thành công!",
      booking,
    });
  } catch (err) {
    console.error("Error updating booking:", err);
    responseHandler.error(res, err.message);
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return responseHandler.notFound(res, "Không tìm thấy đơn đặt vé!");
    }

    // Chỉ cho phép xóa những booking ở trạng thái pending
    if (booking.status !== "pending") {
      return responseHandler.badRequest(
        res,
        "Chỉ có thể xóa đơn đặt vé đang chờ thanh toán!"
      );
    }

    // Xóa các ticket liên quan
    await Ticket.deleteMany({ bookingId: booking._id });

    // Xóa booking
    await Booking.findByIdAndDelete(bookingId);

    responseHandler.ok(res, {
      message: "Xóa đơn đặt vé thành công!",
    });
  } catch (err) {
    console.error("Error deleting booking:", err);
    responseHandler.error(res, err.message);
  }
};

export const confirmBookingFromHold = async (req, res) => {
  try {
    const userId = req.user._id;
    const { showId } = req.body;

    if (!showId || !mongoose.isValidObjectId(showId)) {
      return responseHandler.badRequest(res, "Thiếu hoặc sai showId.");
    }

    const hold = await SeatHold.findOne({ showId, userId });
    if (!hold) return responseHandler.badRequest(res, "Không tìm thấy hold.");
    if (!hold.seatIds?.length)
      return responseHandler.badRequest(res, "Hold không có ghế.");
    if (hold.expiresAt <= new Date())
      return responseHandler.badRequest(res, "Hold đã hết hạn.");

    // Khoá ghế (idempotent)
    await SeatReservation.bulkWrite(
      hold.seatIds.map((seatId) => ({
        updateOne: {
          filter: { showId, seatId },
          update: { $setOnInsert: { showId, seatId } },
          upsert: true,
        },
      })),
      { ordered: false }
    );

    // Lấy ghế để tính tiền + xuất vé
    const seats = await Seat.find({ _id: { $in: hold.seatIds } }).select(
      "_id seatType seatNumber"
    );
    if (seats.length !== hold.seatIds.length) {
      return responseHandler.badRequest(res, "Một số ghế không còn hợp lệ.");
    }

    const totalPrice = seats.reduce((s, g) => s + priceByType(g.seatType), 0);

    const show = await Show.findById(showId).select("roomId");
    if (!show)
      return responseHandler.notFound(res, "Suất chiếu không tồn tại.");
    const room = await Room.findById(show.roomId).select("theaterId");
    if (!room?.theaterId)
      return responseHandler.badRequest(res, "Phòng chưa gắn rạp.");

    // Tạo booking (paid)
    const booking = await Booking.create({
      userId,
      showId,
      seatIds: seats.map((s) => s._id),
      totalPrice,
      status: "paid",
      theaterId: room.theaterId,
    });

    // Xuất vé
    const codePrefix = `T${Date.now()}`;
    const tickets = await Ticket.insertMany(
      seats.map((g, i) => ({
        bookingId: booking._id,
        ownerId: userId,
        showId,
        seatId: g._id,
        seatLabel: g.seatNumber,
        seatType: g.seatType,
        price: priceByType(g.seatType),
        code: `${codePrefix}${String(i + 1).padStart(2, "0")}`,
        status: "active",
      })),
      { ordered: true }
    );

    booking.tickets = tickets.map((t) => t._id);
    await booking.save();

    // Xoá hold sau khi thành công
    await SeatHold.deleteOne({ _id: hold._id });

    return responseHandler.created(res, {
      message: "Thanh toán thành công, đã xuất vé.",
      booking,
    });
  } catch (err) {
    console.error(
      "confirmBookingFromHold error (no-tx):",
      err?.name,
      err?.message,
      err?.code
    );
    if (err?.code === 11000) {
      return responseHandler.conflict(
        res,
        "Một số ghế vừa bị người khác giữ/bán."
      );
    }
    if (err?.name === "CastError" || err?.name === "ValidationError") {
      return responseHandler.badRequest(res, err.message);
    }
    return responseHandler.error(res, err.message);
  }
};

export const getRevenueStats = async (req, res) => {
  try {
    const { startDate, endDate, viewType = "daily", theaterId } = req.query;

    const unit = ({ daily: "day", weekly: "week", monthly: "month" }[viewType]) || "day";
    const timezone = "Asia/Ho_Chi_Minh";

    // range theo paidAt (ghi nhận doanh thu khi đã thanh toán)
    const start = startDate ? new Date(startDate) : new Date("1970-01-01");
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // base filter
    const q = {
      isDeleted: { $ne: true },
      status: { $in: ["paid", "completed"] },
      paidAt: { $gte: start, $lte: end },
    };

    // phân quyền
    const toId = (v) => (typeof v === "string" ? new mongoose.Types.ObjectId(v) : v);
    const role = req.user?.role;
    if (role === "theater-manager" && req.user?.theaterId) {
      q.theaterId = toId(req.user.theaterId);       // ép theo rạp của manager
    } else if (role === "admin" && theaterId) {
      q.theaterId = toId(theaterId);                // admin có thể filter theo rạp
    }

    // nhóm theo bucket thời gian
    const rows = await Booking.aggregate([
      { $match: q },
      {
        $addFields: {
          bucket: { $dateTrunc: { date: "$paidAt", unit, timezone } },
          seatCount: { $size: { $ifNull: ["$seatIds", []] } },
          net: { $ifNull: ["$totalPrice", 0] },
        },
      },
      {
        $group: {
          _id: "$bucket",
          revenue: { $sum: "$net" },
          ticketCount: { $sum: "$seatCount" },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", revenue: 1, ticketCount: 1 } },
    ]);

    // tổng
    const [totals] = await Booking.aggregate([
      { $match: q },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $ifNull: ["$totalPrice", 0] } },
          totalTickets: { $sum: { $size: { $ifNull: ["$seatIds", []] } } },
        },
      },
    ]);

    let theatersRevenue = [];
    // bảng theo rạp (chỉ admin & không truyền theaterId)
    if (role === "admin" && !theaterId) {
      theatersRevenue = await Booking.aggregate([
        { $match: q },
        {
          $group: {
            _id: "$theaterId",
            totalRevenue: { $sum: { $ifNull: ["$totalPrice", 0] } },
            ticketCount: { $sum: { $size: { $ifNull: ["$seatIds", []] } } },
          },
        },
        {
          $lookup: {
            from: "theaters",
            localField: "_id",
            foreignField: "_id",
            as: "theater",
          },
        },
        {
          $project: {
            _id: 1,
            totalRevenue: 1,
            ticketCount: 1,
            theaterName: {
              $ifNull: [
                { $arrayElemAt: ["$theater.theaterName", 0] },
                { $arrayElemAt: ["$theater.name", 0] }, // tuỳ field trong schema Theater
              ],
            },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]);
    }

    return responseHandler.ok(res, {
      message: "Lấy thống kê doanh thu thành công!",
      data: rows,
      totalRevenue: totals?.totalRevenue || 0,
      totalTickets: totals?.totalTickets || 0,
      ...(theatersRevenue.length ? { theatersRevenue } : {}),
    });
  } catch (err) {
    console.error("getRevenueStats error:", err);
    return responseHandler.error(res, err.message);
  }
};

export default {
  createBooking,
  updateBooking,
  deleteBooking,
  getBookingOfUser,
  confirmBookingFromHold,
  getRevenueStats,
};