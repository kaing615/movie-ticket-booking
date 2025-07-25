import Theater from "../models/theater.model.js";
import User from "../models/user.model.js";
import TheaterSystem from "../models/theaterSystem.model.js";
import responseHandler from "../handlers/response.handler.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// ==========================
// Tạo rạp và tài khoản theater-manager mới (Option: dùng cho admin tạo cả 2 cùng lúc)
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

		// Check hệ thống rạp
		const system = await TheaterSystem.findById(theaterSystemId);
		if (!system) {
			return responseHandler.notFound(
				res,
				"Không tìm thấy hệ thống rạp."
			);
		}

		// Check tên rạp trùng
		const existedTheater = await Theater.findOne({
			theaterName,
			theaterSystemId,
			isDeleted: false,
		});
		if (existedTheater) {
			return responseHandler.badRequest(
				res,
				"Tên rạp đã tồn tại trong hệ thống này."
			);
		}

		// Check email manager trùng
		const existedUser = await User.findOne({
			email: managerEmail,
			isDeleted: false,
		});
		if (existedUser) {
			return responseHandler.badRequest(
				res,
				"Email quản lý đã được sử dụng."
			);
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(managerPassword, 10);

		// Tạo user theater-manager
		const newManager = new User({
			email: managerEmail,
			userName: managerUserName,
			password: hashedPassword,
			role: "theater-manager",
			isVerified: true,
			verifyKey: crypto.randomBytes(32).toString("hex"),
			verifyKeyExpires: Date.now() + 24 * 60 * 60 * 1000,
		});
		await newManager.save();

		// Tạo rạp
		const theater = new Theater({
			theaterName,
			location,
			theaterSystemId,
			managerId: newManager._id,
		});
		await theater.save();

		// Ẩn thông tin nhạy cảm
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

// ==========================
// Tạo rạp, gán managerId có sẵn (option: dùng khi đã có sẵn account manager)
const createTheater = async (req, res) => {
	try {
		const { managerId, theaterName, location, theaterSystemId } = req.body;

		// Validate
		if (!managerId || !theaterName || !location || !theaterSystemId) {
			return responseHandler.badRequest(res, "Thiếu thông tin bắt buộc.");
		}

		const nameTaken = await Theater.findOne({
			theaterName,
			isDeleted: false,
		});
		if (nameTaken) {
			return responseHandler.badRequest(res, "Tên rạp đã được sử dụng.");
		}

		// Check manager
		const manager = await User.findOne({
			_id: managerId,
			isDeleted: false,
		});
		if (!manager) {
			return responseHandler.notFound(
				res,
				"Không tìm thấy người dùng quản lý."
			);
		}
		if (manager.role !== "theater-manager") {
			return responseHandler.badRequest(
				res,
				"Người dùng không phải là theater-manager."
			);
		}

		// Một manager chỉ quản lý 1 rạp
		const existingTheater = await Theater.findOne({
			managerId,
			isDeleted: false,
		});
		if (existingTheater) {
			return responseHandler.badRequest(
				res,
				"Người quản lý này đã được phân công cho một rạp khác."
			);
		}

		// Check hệ thống rạp
		const system = await TheaterSystem.findById(theaterSystemId);
		if (!system) {
			return responseHandler.notFound(
				res,
				"Không tìm thấy hệ thống rạp."
			);
		}

		// Tạo rạp
		const theater = new Theater({
			managerId,
			theaterName,
			location,
			theaterSystemId,
		});

		await theater.save();

		return responseHandler.created(res, {
			message: "Tạo rạp chiếu phim thành công!",
			theater,
		});
	} catch (err) {
		console.error("Lỗi tạo rạp:", err);
		responseHandler.error(res);
	}
};

// ==========================
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
				isDeleted: false,
			});
			if (nameTaken) {
				return responseHandler.badRequest(
					res,
					"Tên rạp đã được sử dụng trong hệ thống này."
				);
			}
			theater.theaterName = theaterName;
		}

		if (location) theater.location = location;

		if (managerId) {
			if (!mongoose.Types.ObjectId.isValid(managerId)) {
				return responseHandler.badRequest(
					res,
					"ID quản lý không hợp lệ."
				);
			}
			const manager = await User.findOne({
				_id: managerId,
				role: "theater-manager",
				isDeleted: false,
			});
			if (!manager) {
				return responseHandler.notFound(res, "Không tìm thấy quản lý.");
			}
			theater.managerId = managerId;
		}

		if (theaterSystemId) {
			if (!mongoose.Types.ObjectId.isValid(theaterSystemId)) {
				return responseHandler.badRequest(
					res,
					"ID hệ thống không hợp lệ."
				);
			}
			const system = await TheaterSystem.findById(theaterSystemId);
			if (!system) {
				return responseHandler.notFound(
					res,
					"Không tìm thấy hệ thống."
				);
			}
			theater.theaterSystemId = theaterSystemId;
		}

		await theater.save();
		return responseHandler.ok(res, {
			message: "Cập nhật rạp chiếu phim thành công!",
			theater,
		});
	} catch (err) {
		console.error("Lỗi cập nhật rạp:", err);
		responseHandler.error(res);
	}
};

// ==========================
// Xóa (soft delete) rạp chiếu phim
const deleteTheater = async (req, res) => {
	try {
		const { theaterId } = req.params;

		const theater = await Theater.findById(theaterId);
		if (!theater || theater.isDeleted) {
			return responseHandler.notFound(
				res,
				"Không tìm thấy rạp hoặc đã bị xóa."
			);
		}

		theater.isDeleted = true;
		await theater.save();

		return responseHandler.ok(res, {
			message: "Xóa rạp chiếu phim thành công!",
		});
	} catch (err) {
		console.error("Lỗi xóa rạp:", err);
		responseHandler.error(res);
	}
};

const getTheater = async (req, res) => {
	try {
		const { systemId } = req.query;
		const filter = { isDeleted: false };
		if (systemId) {
			if (!mongoose.Types.ObjectId.isValid(systemId)) {
				return responseHandler.badRequest(
					res,
					"systemId không hợp lệ."
				);
			}
			filter.theaterSystemId = systemId;
		}
		const theaters = await Theater.find(filter);
		return responseHandler.ok(res, { theaters });
	} catch (error) {
		console.error("Lỗi lấy danh sách rạp:", error);
		return responseHandler.serverError(
			res,
			error.message || "Unknown server error."
		);
	}
};

const getTheaterByManagerId = async (req, res) => {
  try {
    const { managerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(managerId)) {
      return responseHandler.badRequest(res, "ID manager không hợp lệ.");
    }

    // Kiểm tra manager có tồn tại và là theater-manager không
    const manager = await User.findOne({ 
      _id: managerId, 
      role: "theater-manager",
      isDeleted: false 
    });

    if (!manager) {
      return responseHandler.notFound(res, "Không tìm thấy theater manager.");
    }

    // Tìm theater được quản lý bởi manager này
    const theater = await Theater.findOne({ 
      managerId: managerId,
      isDeleted: false 
    })
    .populate('managerId', 'userName email') // Lấy thông tin manager
    .populate('theaterSystemId', 'name code logo'); // Lấy thông tin hệ thống rạp

    if (!theater) {
      return responseHandler.notFound(res, "Không tìm thấy rạp được quản lý bởi manager này.");
    }

    return responseHandler.ok(res, {
      message: "Lấy thông tin rạp thành công!",
      theater
    });

  } catch (err) {
    console.error("Lỗi lấy thông tin rạp theo manager:", err);
    responseHandler.error(res);
  }
};

export default {
	createTheaterAndManager, // Dùng khi muốn tạo mới cả rạp và manager cùng lúc
	createTheater, // Dùng khi manager đã có account
	updateTheater,
	deleteTheater,
	getTheater,
	getTheaterByManagerId
};
