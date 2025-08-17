import Show from "../models/show.model.js";
import Movie from "../models/movie.model.js";
import Theater from "../models/theater.model.js";
import Room from "../models/room.model.js";
import responseHandler from "../handlers/response.handler.js";
import mongoose from "mongoose";
import Seat from "../models/seat.model.js";
import Ticket from "../models/ticket.model.js";
import SeatHold from "../models/seatHold.model.js";
import SeatReservation from "../models/seatReservation.model.js";

// Helper: Check quyền sở hữu của theater-manager với rạp
const isTheaterManagerOf = async (userId, theaterId) => {
  const theater = await Theater.findById(theaterId);
  if (!theater || theater.isDeleted) return false;
  return theater.managerId.equals(userId);
};

// ======= NEW: time filter helpers =======
const toDateOrNull = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d) ? null : d;
};

const buildShowTimeFilter = (q) => {
  const filter = {};
  const graceMin = Number(q.graceMin ?? 0);
  const now = new Date(Date.now() - graceMin * 60 * 1000);

  // range by startTime
  const from = toDateOrNull(q.from);
  const to = toDateOrNull(q.to);
  if (from || to) {
    filter.startTime = {};
    if (from) filter.startTime.$gte = from;
    if (to) filter.startTime.$lt = to;
  }

  // mutually exclusive states
  if (q.ongoing === "true") {
    filter.startTime = { ...(filter.startTime || {}), $lte: now };
    filter.endTime = { $gte: now };
  } else if (q.upcoming === "true") {
    // include cả future + đang chiếu
    filter.endTime = { $gt: now };
  } else if (q.past === "true") {
    filter.endTime = { $lte: now };
  }

  return filter;
};

const sortFromQuery = (q) =>
  q.sort === "desc" ? { startTime: -1 } : { startTime: 1 };

// =======================================

// Lấy danh sách phim theo rạp (duy nhất, theo lịch chiếu + filter time)
const getMoviesOfTheater = async (req, res) => {
  try {
    const { theaterId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(theaterId)) {
      return responseHandler.badRequest(res, "ID rạp không hợp lệ.");
    }

    const timeFilter = buildShowTimeFilter(req.query);

    // Lấy shows của rạp theo filter thời gian
    const shows = await Show.find({ theaterId, ...timeFilter })
      .populate({ path: "movieId", select: "-__v" })
      .sort(sortFromQuery(req.query));

    // Lọc unique movie
    const moviesMap = new Map();
    for (const s of shows) {
      if (s.movieId && !moviesMap.has(String(s.movieId._id))) {
        moviesMap.set(String(s.movieId._id), s.movieId);
      }
    }
    const movies = Array.from(moviesMap.values());

    return responseHandler.ok(res, { movies });
  } catch (err) {
    console.error("Lỗi lấy danh sách phim của rạp:", err);
    responseHandler.error(res);
  }
};

// Thêm lịch chiếu (giữ nguyên)
const addShow = async (req, res) => { /* ... như bạn đang có ... */ };

// Cập nhật lịch chiếu (giữ nguyên)
const updateShow = async (req, res) => { /* ... như bạn đang có ... */ };

// Xoá 1 lịch chiếu (giữ nguyên)
const deleteMovieFromTheater = async (req, res) => { /* ... như bạn đang có ... */ };

// Lấy lịch chiếu theo rạp (thêm filter time)
const getShowsByTheater = async (req, res) => {
  try {
    const { theaterId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(theaterId)) {
      return responseHandler.badRequest(res, "ID rạp không hợp lệ.");
    }

    const timeFilter = buildShowTimeFilter(req.query);

    const shows = await Show.find({ theaterId, ...timeFilter })
      .populate("movieId")
      .populate("roomId", "roomNumber")
      .sort(sortFromQuery(req.query));

    return responseHandler.ok(res, { shows });
  } catch (err) {
    console.error("Lỗi lấy lịch chiếu:", err);
    responseHandler.error(res);
  }
};

// Lấy lịch chiếu theo phim (thêm filter time)
const getShowsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return responseHandler.badRequest(res, "ID phim không hợp lệ.");
    }

    const timeFilter = buildShowTimeFilter(req.query);

    const shows = await Show.find({ movieId, ...timeFilter })
      .populate("theaterId", "theaterName location")
      .populate("roomId", "roomNumber")
      .sort(sortFromQuery(req.query));

    return responseHandler.ok(res, { shows });
  } catch (err) {
    console.error("Lỗi lấy lịch chiếu theo phim:", err);
    responseHandler.error(res);
  }
};

export const getSeatsOfShow = async (req, res) => {
  try {
    const { showId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(showId)) {
      return responseHandler.badRequest(res, "ID suất chiếu không hợp lệ.");
    }

    const show = await Show.findById(showId).select("roomId");
    if (!show) return responseHandler.notFound(res, "Không tìm thấy suất chiếu.");

    // 1) Tất cả ghế trong phòng
    const seats = await Seat.find({ roomId: show.roomId, isDeleted: false })
      .select("seatNumber seatType")
      .lean();

    // 2) Ghế đã cố định (sold): ưu tiên SeatReservation; bổ sung từ Ticket active/used
    const [reservedIds, ticketIds] = await Promise.all([
      SeatReservation.find({ showId }).distinct("seatId"),
      Ticket.find({
        showId,
        status: { $in: ["active", "used"] },
        isDeleted: { $ne: true },
      }).distinct("seatId"),
    ]);
    const soldSet = new Set([...reservedIds.map(String), ...ticketIds.map(String)]);

    // 3) Ghế đang hold (chưa hết hạn, người khác giữ)
    const now = new Date();
    const holds = await SeatHold.find({
      showId,
      expiresAt: { $gt: now },
    }).select("seatIds userId");
    const heldSet = new Set();
    for (const h of holds) {
      for (const s of h.seatIds) heldSet.add(String(s));
    }

    return responseHandler.ok(res, {
      seats,                               // [{_id, seatNumber, seatType}]
      sold: Array.from(soldSet),           // [seatId]
      held: Array.from(heldSet),           // [seatId] (đang có người giữ tạm)
      serverTime: now,                     // giúp FE đồng bộ countdown
    });
  } catch (e) {
    return responseHandler.error(res, e.message);
  }
};

// Tạo/ghi đè 1 hold cho user hiện tại (giữ đến expiresAt)
export const holdSeats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { showId } = req.params;
    const { seatIds = [], ttlSec = 180 } = req.body; // mặc định hold 3 phút

    if (!mongoose.Types.ObjectId.isValid(showId) || !Array.isArray(seatIds) || seatIds.length === 0) {
      return responseHandler.badRequest(res, "Dữ liệu không hợp lệ.");
    }

    // Ghế đã sold?
    const [reservedIds, ticketIds] = await Promise.all([
      SeatReservation.find({ showId, seatId: { $in: seatIds } }).distinct("seatId"),
      Ticket.find({
        showId,
        seatId: { $in: seatIds },
        status: { $in: ["active", "used"] },
        isDeleted: { $ne: true },
      }).distinct("seatId"),
    ]);
    const sold = new Set([...reservedIds.map(String), ...ticketIds.map(String)]);
    if (sold.size > 0) {
      return responseHandler.conflict(res, "Một số ghế đã được bán.");
    }

    // Ghế đang được người khác hold?
    const now = new Date();
    const conflictHolds = await SeatHold.find({
      showId,
      expiresAt: { $gt: now },
      userId: { $ne: userId },
      seatIds: { $in: seatIds },
    }).countDocuments();

    if (conflictHolds > 0) {
      return responseHandler.conflict(res, "Một số ghế đang được người khác giữ.");
    }

    const expiresAt = new Date(Date.now() + ttlSec * 1000);

    // Gộp: nếu user đã có hold cũ cho show này -> thay thế danh sách ghế + gia hạn
    const hold = await SeatHold.findOneAndUpdate(
      { showId, userId },
      { seatIds, expiresAt },
      { new: true, upsert: true }
    );

    return responseHandler.ok(res, {
      message: "Giữ ghế thành công.",
      hold: { seatIds: hold.seatIds.map(String), expiresAt: hold.expiresAt },
    });
  } catch (e) {
    return responseHandler.error(res, e.message);
  }
};

// Gia hạn hold hiện tại
export const refreshHold = async (req, res) => {
  try {
    const userId = req.user._id;
    const { showId } = req.params;
    const { ttlSec = 180 } = req.body;

    const hold = await SeatHold.findOne({ showId, userId });
    if (!hold) return responseHandler.notFound(res, "Không có hold để gia hạn.");

    hold.expiresAt = new Date(Date.now() + ttlSec * 1000);
    await hold.save();

    return responseHandler.ok(res, {
      message: "Gia hạn giữ ghế thành công.",
      hold: { seatIds: hold.seatIds.map(String), expiresAt: hold.expiresAt },
    });
  } catch (e) {
    return responseHandler.error(res, e.message);
  }
};

// Bỏ hold (toàn bộ hoặc 1 phần)
export const releaseHold = async (req, res) => {
  try {
    const userId = req.user._id;
    const { showId } = req.params;
    const { seatIds } = req.body; // nếu không truyền, xoá toàn bộ hold

    const hold = await SeatHold.findOne({ showId, userId });
    if (!hold) return responseHandler.ok(res, { message: "Đã bỏ giữ ghế." });

    if (Array.isArray(seatIds) && seatIds.length > 0) {
      const keep = hold.seatIds.filter(id => !seatIds.map(String).includes(String(id)));
      if (keep.length === 0) await SeatHold.deleteOne({ _id: hold._id });
      else {
        hold.seatIds = keep;
        await hold.save();
      }
    } else {
      await SeatHold.deleteOne({ _id: hold._id });
    }

    return responseHandler.ok(res, { message: "Đã bỏ giữ ghế." });
  } catch (e) {
    return responseHandler.error(res, e.message);
  }
};

export default {
  addShow,
  updateShow,
  deleteMovieFromTheater,
  getShowsByTheater,
  getShowsByMovie,
  getMoviesOfTheater,
  getSeatsOfShow,
  holdSeats,
  refreshHold,
  releaseHold,
};
