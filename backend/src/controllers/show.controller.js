import Show from "../models/show.model.js";
import Movie from "../models/movie.model.js";
import Theater from "../models/theater.model.js";
import Room from "../models/room.model.js";
import responseHandler from "../handlers/response.handler.js";
import mongoose from "mongoose";

// Helper: Check quyền sở hữu của theater-manager với rạp
const isTheaterManagerOf = async (userId, theaterId) => {
  const theater = await Theater.findById(theaterId);
  if (!theater || theater.isDeleted) return false;
  return theater.managerId.equals(userId);
};

// Thêm lịch chiếu
const addShow = async (req, res) => {
  try {
    const { movieId, theaterId, roomId, startTime, endTime } = req.body;
    const userId = req.user.id;

    if (![movieId, theaterId, roomId].every(id => mongoose.Types.ObjectId.isValid(id))) {
      return responseHandler.badRequest(res, "ID không hợp lệ.");
    }

    // Kiểm tra quyền theater-manager
    const isManager = await isTheaterManagerOf(userId, theaterId);
    if (!isManager) {
      return responseHandler.unauthorized(res, "Bạn không có quyền thực hiện thao tác này.");
    }

    const [movie, room] = await Promise.all([
      Movie.findById(movieId),
      Room.findById(roomId)
    ]);

    if (!movie) return responseHandler.notFound(res, "Phim không tồn tại.");
    if (!room) return responseHandler.notFound(res, "Phòng không tồn tại.");

    if (!room.theaterId.equals(theaterId)) {
      return responseHandler.badRequest(res, "Phòng không thuộc rạp này.");
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return responseHandler.badRequest(res, "Thời gian bắt đầu phải trước thời gian kết thúc.");
    }

    const overlappingShow = await Show.findOne({
      roomId,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $lte: endTime, $gt: startTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });

    if (overlappingShow) {
      return responseHandler.badRequest(res, "Phòng này đã có lịch chiếu trong khoảng thời gian đó.");
    }

    const newShow = new Show({
      movieId,
      theaterId,
      roomId,
      startTime,
      endTime,
      status: 'planned'
    });

    await newShow.save();
    return responseHandler.created(res, { message: "Tạo lịch chiếu thành công!", show: newShow });
  } catch (err) {
    console.error("Lỗi tạo lịch chiếu:", err);
    responseHandler.error(res);
  }
};

// Cập nhật lịch chiếu
const updateShow = async (req, res) => {
  try {
    const { showId } = req.params;
    const { startTime, endTime, status } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(showId)) {
      return responseHandler.badRequest(res, "ID lịch chiếu không hợp lệ.");
    }

    const show = await Show.findById(showId);
    if (!show) return responseHandler.notFound(res, "Không tìm thấy lịch chiếu.");

    // Kiểm tra quyền theater-manager
    const isManager = await isTheaterManagerOf(userId, show.theaterId);
    if (!isManager) {
      return responseHandler.unauthorized(res, "Bạn không có quyền cập nhật lịch chiếu này.");
    }

    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      return responseHandler.badRequest(res, "Thời gian bắt đầu phải trước thời gian kết thúc.");
    }

    show.startTime = startTime || show.startTime;
    show.endTime = endTime || show.endTime;
    show.status = status || show.status;

    await show.save();
    return responseHandler.ok(res, { message: "Cập nhật lịch chiếu thành công!", show });
  } catch (err) {
    console.error("Lỗi cập nhật lịch chiếu:", err);
    responseHandler.error(res);
  }
};

// Xóa lịch chiếu
const deleteShow = async (req, res) => {
  try {
    const { showId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(showId)) {
      return responseHandler.badRequest(res, "ID lịch chiếu không hợp lệ.");
    }

    const show = await Show.findById(showId);
    if (!show) return responseHandler.notFound(res, "Không tìm thấy lịch chiếu.");

    const isManager = await isTheaterManagerOf(userId, show.theaterId);
    if (!isManager) {
      return responseHandler.unauthorized(res, "Bạn không có quyền xóa lịch chiếu này.");
    }

    await Show.deleteOne({ _id: showId });
    return responseHandler.ok(res, { message: "Xóa lịch chiếu thành công!" });
  } catch (err) {
    console.error("Lỗi xóa lịch chiếu:", err);
    responseHandler.error(res);
  }
};

// Lấy danh sách lịch chiếu theo rạp
const getShowsByTheater = async (req, res) => {
  try {
    const { theaterId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(theaterId)) {
      return responseHandler.badRequest(res, "ID rạp không hợp lệ.");
    }

    const shows = await Show.find({ theaterId })
      .populate("movieId", "movieName duration poster")
      .populate("roomId", "roomNumber")
      .sort({ startTime: 1 });

    return responseHandler.ok(res, { shows });
  } catch (err) {
    console.error("Lỗi lấy lịch chiếu:", err);
    responseHandler.error(res);
  }
};

const getShowsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return responseHandler.badRequest(res, "ID phim không hợp lệ.");
    }

    const shows = await Show.find({ movieId })
      .populate("theaterId", "theaterName location")
      .populate("roomId", "roomNumber")
      .sort({ startTime: 1 });

    return responseHandler.ok(res, { shows });
  } catch (err) {
    console.error("Lỗi lấy lịch chiếu theo phim:", err);
    responseHandler.error(res);
  }
};

export default {
  addShow,
  updateShow,
  deleteShow,
  getShowsByTheater,
  getShowsByMovie,
};
