import TheaterSystem from "../models/theaterSystem.model.js";
import responseHandler from "../handlers/response.handler.js";
import mongoose from "mongoose";

// Tạo hệ thống rạp
const createTheaterSystem = async (req, res) => {
	try {
		const { name, code, logo, description } = req.body;

		const existed = await TheaterSystem.findOne({
			$or: [{ name }, { code }],
		});
		if (existed) {
			return responseHandler.badRequest(
				res,
				"Tên hoặc mã hệ thống đã tồn tại."
			);
		}

		const theaterSystem = new TheaterSystem({
			name,
			code,
			logo,
			description,
		});

		await theaterSystem.save();
		return responseHandler.created(res, {
			message: "Tạo hệ thống rạp thành công!",
			theaterSystem,
		});
	} catch (err) {
		console.error("Lỗi tạo hệ thống rạp:", err);
		responseHandler.error(res);
	}
};

// Cập nhật hệ thống rạp
const updateTheaterSystem = async (req, res) => {
	try {
		const { systemId } = req.params;
		const { name, code, logo, description } = req.body;

		const theaterSystem = await TheaterSystem.findById(systemId);
		if (!theaterSystem) {
			return responseHandler.notFound(
				res,
				"Không tìm thấy hệ thống rạp."
			);
		}

		if (name && name !== theaterSystem.name) {
			const existedName = await TheaterSystem.findOne({
				name,
				_id: { $ne: systemId },
			});
			if (existedName) {
				return responseHandler.badRequest(
					res,
					"Tên hệ thống đã tồn tại."
				);
			}
			theaterSystem.name = name;
		}

		if (code && code !== theaterSystem.code) {
			const existedCode = await TheaterSystem.findOne({
				code,
				_id: { $ne: systemId },
			});
			if (existedCode) {
				return responseHandler.badRequest(
					res,
					"Mã hệ thống đã tồn tại."
				);
			}
			theaterSystem.code = code;
		}

		if (logo) theaterSystem.logo = logo;
		if (description) theaterSystem.description = description;

		await theaterSystem.save();
		return responseHandler.ok(res, {
			message: "Cập nhật hệ thống rạp thành công!",
			theaterSystem,
		});
	} catch (err) {
		console.error("Lỗi cập nhật hệ thống rạp:", err);
		responseHandler.error(res);
	}
};

// Xóa hệ thống rạp (hard delete)
const deleteTheaterSystem = async (req, res) => {
	try {
		const { systemId } = req.params;

		const deleted = await TheaterSystem.findByIdAndDelete(systemId);
		if (!deleted) {
			return responseHandler.notFound(
				res,
				"Không tìm thấy hệ thống để xóa."
			);
		}

		return responseHandler.ok(res, {
			message: "Xóa hệ thống rạp thành công!",
		});
	} catch (err) {
		console.error("Lỗi xóa hệ thống rạp:", err);
		responseHandler.error(res);
	}
};

const addTheaterToSystem = async (req, res) => {
	try {
		const { systemId, theaterId } = req.body;

		if (
			!mongoose.Types.ObjectId.isValid(systemId) ||
			!mongoose.Types.ObjectId.isValid(theaterId)
		) {
			return responseHandler.badRequest(
				res,
				"ID hệ thống hoặc rạp không hợp lệ."
			);
		}

		const theaterSystem = await TheaterSystem.findById(systemId);
		if (!theaterSystem) {
			return responseHandler.notFound(
				res,
				"Không tìm thấy hệ thống rạp."
			);
		}

		const theater = await Theater.findById(theaterId);
		if (!theater || theater.isDeleted) {
			return responseHandler.notFound(res, "Không tìm thấy rạp.");
		}

		// Cập nhật rạp gán vào hệ thống
		theater.theaterSystemId = systemId;
		await theater.save();

		return responseHandler.ok(res, {
			message: "Gán rạp vào hệ thống thành công!",
			theater,
			theaterSystem,
		});
	} catch (err) {
		console.error("Lỗi gán rạp vào hệ thống:", err);
		responseHandler.error(res, err.message);
	}
};

const getAllTheaterSystems = async (req, res) => {
	try {
		const systems = await TheaterSystem.find();
		return responseHandler.ok(res, systems);
	} catch (err) {
		console.error("Lỗi lấy danh sách hệ thống rạp:", err);
		responseHandler.error(res, err.message);
	}
};

const getTheaterSystemById = async (req, res) => {
	try {
		const { systemId } = req.params;
		if (!mongoose.Types.ObjectId.isValid(systemId)) {
			return responseHandler.badRequest(res, "ID hệ thống không hợp lệ.");
		}

		// Lấy hệ thống rạp
		const system = await TheaterSystem.findById(systemId);
		if (!system) {
			return responseHandler.notFound(
				res,
				"Không tìm thấy hệ thống rạp."
			);
		}

		// Lấy danh sách rạp thuộc hệ thống này
		const theaters = await Theater.find({
			theaterSystemId: systemId,
			isDeleted: false,
		});

		return responseHandler.ok(res, {
			theaterSystem: system,
			theaters,
		});
	} catch (err) {
		console.error("Lỗi lấy chi tiết hệ thống rạp:", err);
		responseHandler.error(res, err.message);
	}
};

export default {
	createTheaterSystem,
	updateTheaterSystem,
	deleteTheaterSystem,
	getAllTheaterSystems,
	getTheaterSystemById,
	addTheaterToSystem,
};
