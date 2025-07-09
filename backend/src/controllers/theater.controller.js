import Theater from "../models/theater.model.js";
import User from "../models/user.model.js";
import TheaterSystem from "../models/theaterSystem.model.js";
import responseHandler from "../handlers/response.handler.js";
import mongoose from "mongoose";

// Thêm rạp chiếu phim
const createTheater = async (req, res) => {
  try {
    const { managerId, theaterName, location, theaterSystemId } = req.body;

    if (!managerId || !theaterName || !location || !theaterSystemId) {
      return responseHandler.badRequest(res, "Thiếu thông tin bắt buộc.");
    }

    if (![managerId, theaterSystemId].every(id => mongoose.Types.ObjectId.isValid(id))) {
      return responseHandler.badRequest(res, "ID không hợp lệ.");
    }

    const manager = await User.findOne({ _id: managerId, isDeleted: false });
    if (!manager) {
      return responseHandler.notFound(res, "Không tìm thấy người dùng quản lý.");
    }

    if (manager.role !== 'theater-manager') {
      return responseHandler.badRequest(res, "Người dùng không phải là theater-manager.");
    }

    const existingTheater = await Theater.findOne({ managerId, isDeleted: false });
    if (existingTheater) {
      return responseHandler.badRequest(res, "Người quản lý này đã được phân công cho một rạp khác.");
    }

    const system = await TheaterSystem.findById(theaterSystemId);
    if (!system) {
      return responseHandler.notFound(res, "Không tìm thấy hệ thống rạp.");
    }

    const existed = await Theater.findOne({ theaterName });
    if (existed) {
      return responseHandler.badRequest(res, "Tên rạp đã tồn tại.");
    }

    const theater = new Theater({
      managerId,
      theaterName,
      location,
      theaterSystemId
    });

    await theater.save();

    return responseHandler.created(res, {
      message: "Tạo rạp chiếu phim thành công!",
      theater
    });
  } catch (err) {
    console.error("Lỗi tạo rạp:", err);
    responseHandler.error(res);
  }
};


// Cập nhật rạp chiếu phim
const updateTheater = async (req, res) => {
  try {
    const { theaterId } = req.params;
    const { theaterName, location, managerId, theaterSystemId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(theaterId)) {
      return responseHandler.badRequest(res, "ID rạp không hợp lệ.");
    }

    const theater = await Theater.findById(theaterId);
    if (!theater || theater.isDeleted) {
      return responseHandler.notFound(res, "Không tìm thấy rạp.");
    }

    if (theaterName) {
      const nameTaken = await Theater.findOne({ theaterName, _id: { $ne: theaterId } });
      if (nameTaken) {
        return responseHandler.badRequest(res, "Tên rạp đã được sử dụng.");
      }
      theater.theaterName = theaterName;
    }

    if (location) theater.location = location;

    if (managerId) {
      if (!mongoose.Types.ObjectId.isValid(managerId)) {
        return responseHandler.badRequest(res, "ID quản lý không hợp lệ.");
      }
      const manager = await User.findOne({ _id: managerId, role: 'theater-manager', isDeleted: false });
      if (!manager) {
        return responseHandler.notFound(res, "Không tìm thấy quản lý.");
      }
      theater.managerId = managerId;
    }

    if (theaterSystemId) {
      if (!mongoose.Types.ObjectId.isValid(theaterSystemId)) {
        return responseHandler.badRequest(res, "ID hệ thống không hợp lệ.");
      }
      const system = await TheaterSystem.findById(theaterSystemId);
      if (!system) {
        return responseHandler.notFound(res, "Không tìm thấy hệ thống.");
      }
      theater.theaterSystemId = theaterSystemId;
    }

    await theater.save();
    return responseHandler.ok(res, { message: "Cập nhật rạp chiếu phim thành công!", theater });
  } catch (err) {
    console.error("Lỗi cập nhật rạp:", err);
    responseHandler.error(res);
  }
};

// Xóa (soft delete) rạp chiếu phim
const deleteTheater = async (req, res) => {
  try {
    const { theaterId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(theaterId)) {
      return responseHandler.badRequest(res, "ID rạp không hợp lệ.");
    }

    const theater = await Theater.findById(theaterId);
    if (!theater || theater.isDeleted) {
      return responseHandler.notFound(res, "Không tìm thấy rạp.");
    }

    theater.isDeleted = true;
    await theater.save();

    return responseHandler.ok(res, { message: "Xóa rạp chiếu phim thành công!" });
  } catch (err) {
    console.error("Lỗi xóa rạp:", err);
    responseHandler.error(res);
  }
};

export default {
  createTheater,
  updateTheater,
  deleteTheater
};
