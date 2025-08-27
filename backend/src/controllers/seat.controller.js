import responseHandler from "../handlers/response.handler.js";
import Seat from "../models/seat.model.js";
import Show from "../models/show.model.js";
import Booking from "../models/booking.model.js";
import Ticket from "../models/ticket.model.js";
import SeatHold from "../models/seatHold.model.js";

export const createSeat = async (req, res) => {
    try {
        const { roomId, seatNumber, seatType, row } = req.body;

        // Check if seat already exists in the room
        const existingSeat = await Seat.findOne({ 
            roomId, 
            seatNumber,
            row,
            isDeleted: false 
        });

        if (existingSeat) {
            return responseHandler.badRequest(res, "Ghế đã tồn tại trong phòng này!");
        }

        const seat = new Seat({
            roomId,
            seatNumber,
            seatType,
            row
        });

        await seat.save();

        responseHandler.created(res, {
            message: "Tạo ghế mới thành công!",
            seat
        });
    } catch (err) {
        console.error("Error creating seat:", err);
        responseHandler.error(res);
    }
};

export const updateSeat = async (req, res) => {
    try {
        const { seatType, isDisabled, row, seatNumber } = req.body;
        const seatId = req.params.id;

        const seat = await Seat.findById(seatId);
        if (!seat || seat.isDeleted) {
            return responseHandler.notFound(res, "Không tìm thấy ghế!");
        }

        // Kiểm tra xem ghế mới có trùng với ghế khác không
        if (row !== undefined && seatNumber !== undefined) {
            const existingSeat = await Seat.findOne({
                roomId: seat.roomId,
                row,
                seatNumber,
                _id: { $ne: seatId }, // Không tính ghế hiện tại
                isDeleted: false
            });

            if (existingSeat) {
                return responseHandler.badRequest(res, "Vị trí ghế này đã tồn tại trong phòng!");
            }
        }

        // Cập nhật thông tin ghế
        if (seatType) seat.seatType = seatType;
        if (typeof isDisabled === 'boolean') seat.isDisabled = isDisabled;
        if (row !== undefined) seat.row = row;
        if (seatNumber !== undefined) seat.seatNumber = seatNumber;

        await seat.save();

        responseHandler.ok(res, {
            message: "Cập nhật ghế thành công!",
            seat
        });
    } catch (err) {
        console.error("Error updating seat:", err);
        responseHandler.error(res);
    }
};

export const deleteSeat = async (req, res) => {
    try {
        const seat = await Seat.findById(req.params.id);
        if (!seat || seat.isDeleted) {
            return responseHandler.notFound(res, "Không tìm thấy ghế!");
        }

        seat.isDeleted = true;
        await seat.save();

        responseHandler.ok(res, {
            message: "Xóa ghế thành công!"
        });
    } catch (err) {
        console.error("Error deleting seat:", err);
        responseHandler.error(res);
    }
};

export const getSeatsByRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const seats = await Seat.find({ 
            roomId,
            isDeleted: false 
        }).sort('seatNumber');

        responseHandler.ok(res, {
            message: "Lấy danh sách ghế thành công!",
            seats
        });
    } catch (err) {
        console.error("Error getting seats:", err);
        responseHandler.error(res);
    }
};

export const getSeatById = async (req, res) => {
    try {
        const seat = await Seat.findById(req.params.id);
        if (!seat || seat.isDeleted) {
            return responseHandler.notFound(res, "Không tìm thấy ghế!");
        }

        responseHandler.ok(res, {
            message: "Lấy thông tin ghế thành công!",
            seat
        });
    } catch (err) {
        console.error("Error getting seat:", err);
        responseHandler.error(res);
    }
};

export const getSeatsOfShow = async (req, res) => {
  try {
    const { showId } = req.params;

    const show = await Show.findById(showId).select("roomId");
    if (!show) return responseHandler.notFound(res, "Không tìm thấy suất chiếu");

    // 1) Tất cả ghế của phòng (để render sơ đồ)
    const seats = await Seat.find({
      roomId: show.roomId,
      isDeleted: false,
    }).select("_id row seatNumber seatType isDisabled");

    // 2) Ghế ĐÃ BÁN của suất này (booking đã thanh toán)
    const paidBookings = await Booking.find({
      showId,
      status: { $in: ["paid", "completed"] },
      isDeleted: { $ne: true },
    }).select("_id").lean();

    const paidIds = paidBookings.map((b) => b._id);
    const soldTickets = paidIds.length
      ? await Ticket.find({
          showId,
          bookingId: { $in: paidIds },
          status: { $in: ["active", "used"] },
        }).select("seatId").lean()
      : [];

    const sold = soldTickets.map((t) => String(t.seatId));

    // 3) Ghế ĐANG GIỮ (hold) còn hạn
    const now = new Date();
    const holds = await SeatHold.find({
      showId,
      expiresAt: { $gt: now },
    }).select("seatIds").lean();

    const held = holds.flatMap((h) => (h.seatIds || []).map((id) => String(id)));

    return responseHandler.ok(res, {
      seats,
      sold,
      held,
      serverTime: new Date(),
    });
  } catch (err) {
    console.error("getSeatsOfShow error:", err);
    return responseHandler.error(res);
  }
};

export default {
    createSeat,
    updateSeat,
    deleteSeat,
    getSeatsOfShow,
    getSeatsByRoom,
    getSeatById
};