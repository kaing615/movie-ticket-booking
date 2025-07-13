import Theater from "../models/theater.model.js";
import User from "../models/user.model.js";
import TheaterSystem from "../models/theaterSystem.model.js";
import responseHandler from "../handlers/response.handler.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Thêm rạp chiếu phim + tạo tài khoản theater-manager
const createTheaterAndManager = async (req, res) => {
  try {
    const {
      theaterName,
      location,
      theaterSystemId,
      managerEmail,
      managerUserName,
      managerPassword,
    } = req.body;

    // Validate bắt buộc
    if (
      !theaterName ||
      !location ||
      !theaterSystemId ||
      !managerEmail ||
      !managerUserName ||
      !managerPassword
    ) {
      return responseHandler.badRequest(res, "Thiếu thông tin bắt buộc.");
    }

    if (!mongoose.Types.ObjectId.isValid(theaterSystemId)) {
      return responseHandler.badRequest(res, "ID hệ thống không hợp lệ.");
    }

    // Check hệ thống rạp tồn tại
    const system = await TheaterSystem.findById(theaterSystemId);
    if (!system) {
      return responseHandler.notFound(res, "Không tìm thấy hệ thống rạp.");
    }

    // Kiểm tra tên rạp đã tồn tại chưa
    const existedTheater = await Theater.findOne({ theaterName, theaterSystemId, isDeleted: false });
    if (existedTheater) {
      return responseHandler.badRequest(res, "Tên rạp đã tồn tại trong hệ thống này.");
    }

    // Kiểm tra email quản lý đã tồn tại chưa
    const existedUser = await User.findOne({ email: managerEmail, isDeleted: false });
    if (existedUser) {
      return responseHandler.badRequest(res, "Email quản lý đã được sử dụng.");
    }

    // Hash password cho manager
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(managerPassword, saltRounds);

    // Tạo user theater-manager
    const newManager = new User({
      email: managerEmail,
      userName: managerUserName,
      password: hashedPassword,
      role: "theater-manager",
      isVerified: true,
      verifyKey: crypto.randomBytes(32).toString("hex"),
      verifyKeyExpires: Date.now() + 24 * 60 * 60 * 1000, // 1 ngày
    });

    await newManager.save();

    // Tạo rạp gắn manager vừa tạo
    const theater = new Theater({
      theaterName,
      location,
      theaterSystemId,
      managerId: newManager._id,
    });

    await theater.save();

    // Ẩn thông tin nhạy cảm manager trước khi trả về
    const safeManager = newManager.toObject();
    delete safeManager.password;
    delete safeManager.verifyKey;
    delete safeManager.verifyKeyExpires;

    return responseHandler.created(res, {
      message: "Tạo rạp và tài khoản theater-manager thành công!",
      theater,
      manager: safeManager,
    });

  } catch (err) {
    console.error("Lỗi tạo rạp và quản lý:", err);
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
      const nameTaken = await Theater.findOne({
        theaterName,
        theaterSystemId: theater.theaterSystemId,
        _id: { $ne: theaterId },
        isDeleted: false
      });
      if (nameTaken) {
        return responseHandler.badRequest(res, "Tên rạp đã được sử dụng trong hệ thống này.");
      }
      theater.theaterName = theaterName;
    }

    if (location) theater.location = location;

    if (managerId) {
      if (!mongoose.Types.ObjectId.isValid(managerId)) {
        return responseHandler.badRequest(res, "ID quản lý không hợp lệ.");
      }
      const manager = await User.findOne({ _id: managerId, role: "theater-manager", isDeleted: false });
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
  createTheaterAndManager,
  updateTheater,
  deleteTheater,
};
