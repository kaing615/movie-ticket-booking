import Room from "../models/room.model.js";
import Theater from "../models/theater.model.js";
import responseHandler from "../handlers/response.handler.js";
import mongoose from "mongoose";

// Helper: Check quyền sở hữu của theater-manager với rạp
const isTheaterManagerOf = async (userId, theaterId) => {
  const theater = await Theater.findById(theaterId);
  if (!theater || theater.isDeleted) return false;
  return theater.managerId.toString() === userId;
};

// Thêm phòng chiếu
const createRoom = async (req, res) => {
  try {
    const { theaterId, roomNumber } = req.body;
    const currentUserId = req.user?.id;

    if (!theaterId || !roomNumber) {
      return responseHandler.badRequest(res, "Thiếu thông tin bắt buộc.");
    }

    if (!mongoose.Types.ObjectId.isValid(theaterId)) {
      return responseHandler.badRequest(res, "ID rạp không hợp lệ.");
    }

    // Check quyền manager
    const isManager = await isTheaterManagerOf(currentUserId, theaterId);
    if (!isManager) {
      return responseHandler.unauthorized(res, "Bạn không có quyền tạo phòng cho rạp này.");
    }

    // Check số phòng trùng
    const existed = await Room.findOne({ roomNumber, theaterId });
    if (existed) {
      return responseHandler.badRequest(res, "Số phòng đã tồn tại trong rạp này.");
    }

    const room = new Room({ theaterId, roomNumber });
    await room.save();

    return responseHandler.created(res, {
      message: "Tạo phòng chiếu thành công!",
      room
    });
  } catch (err) {
    console.error("Lỗi tạo phòng:", err);
    responseHandler.error(res);
  }
};

// Cập nhật phòng chiếu
const updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { roomNumber } = req.body;
    const currentUserId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return responseHandler.badRequest(res, "ID phòng không hợp lệ.");
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return responseHandler.notFound(res, "Không tìm thấy phòng.");
    }

    // Check quyền manager
    const isManager = await isTheaterManagerOf(currentUserId, room.theaterId);
    if (!isManager) {
      return responseHandler.unauthorized(res, "Bạn không có quyền cập nhật phòng của rạp này.");
    }

    if (roomNumber) {
      const existed = await Room.findOne({
        roomNumber,
        theaterId: room.theaterId,
        _id: { $ne: roomId }
      });
      if (existed) {
        return responseHandler.badRequest(res, "Số phòng đã tồn tại trong rạp.");
      }
      room.roomNumber = roomNumber;
    }

    await room.save();
    return responseHandler.ok(res, { message: "Cập nhật phòng chiếu thành công!", room });
  } catch (err) {
    console.error("Lỗi cập nhật phòng:", err);
    responseHandler.error(res);
  }
};

// Xóa phòng chiếu
const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const currentUserId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return responseHandler.badRequest(res, "ID phòng không hợp lệ.");
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return responseHandler.notFound(res, "Không tìm thấy phòng.");
    }

    // Check quyền manager
    const isManager = await isTheaterManagerOf(currentUserId, room.theaterId);
    if (!isManager) {
      return responseHandler.unauthorized(res, "Bạn không có quyền xóa phòng của rạp này.");
    }

    await Room.deleteOne({ _id: roomId });

    return responseHandler.ok(res, { message: "Xóa phòng chiếu thành công!" });
  } catch (err) {
    console.error("Lỗi xóa phòng:", err);
    responseHandler.error(res);
  }
};

export default {
  createRoom,
  updateRoom,
  deleteRoom
};
