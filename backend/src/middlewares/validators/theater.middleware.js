import { body, param } from "express-validator";

const createTheaterValidator = [
	body("managerId")
		.notEmpty()
		.withMessage("ID quản lý phải được cung cấp.")
		.isMongoId()
		.withMessage("ID quản lý không hợp lệ."),
	body("theaterName")
		.trim()
		.escape()
		.isString()
		.notEmpty()
		.withMessage("Tên rạp phải được cung cấp."),
	body("location")
		.trim()
		.escape()
		.isString()
		.notEmpty()
		.withMessage("Địa chỉ rạp phải được cung cấp."),
	body("theaterSystemId")
		.notEmpty()
		.withMessage("ID hệ thống rạp phải được cung cấp.")
		.isMongoId()
		.withMessage("ID hệ thống rạp không hợp lệ."),
];

const updateTheaterValidator = [
	param("theaterId")
		.notEmpty()
		.withMessage("ID rạp phải được cung cấp.")
		.isMongoId()
		.withMessage("ID rạp không hợp lệ."),
	body("theaterName")
		.optional()
		.trim()
		.escape()
		.isString()
		.withMessage("theaterName must be a string"),
	body("location")
		.optional()
		.trim()
		.escape()
		.isString()
		.withMessage("Location must be a string"),
	body("managerId")
		.optional()
		.isMongoId()
		.withMessage("ID quản lý không hợp lệ."),
	body("theaterSystemId")
		.optional()
		.isMongoId()
		.withMessage("ID hệ thống rạp không hợp lệ."),
];

const deleteTheaterValidator = [
	param("theaterId")
		.notEmpty()
		.withMessage("ID rạp phải được cung cấp.")
		.isMongoId()
		.withMessage("ID rạp không hợp lệ."),
];

const theaterValidator = {
	createTheaterValidator,
	updateTheaterValidator,
	deleteTheaterValidator,
};
export default theaterValidator;
