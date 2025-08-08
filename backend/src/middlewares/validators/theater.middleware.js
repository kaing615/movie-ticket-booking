import { body, param } from "express-validator";

const createTheaterWithManagerValidator = [
	body("managerEmail").isEmail().withMessage("Email không hợp lệ"),
	body("managerPassword")
		.isLength({ min: 6 })
		.withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
	body("managerUserName")
		.notEmpty()
		.withMessage("Tên người dùng không được để trống"),
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

const createTheaterValidator = [
	body("managerEmail")
		.optional()
		.isEmail()
		.withMessage("Email quản lý phải hợp lệ."),
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
	body("theaterSystemCode")
		.optional()
		.trim()
		.escape()
		.isString()
		.notEmpty()
		.withMessage("Mã hệ thống rạp không hợp lệ."),
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
	body("managerEmail")
		.optional()
		.isString()
		.withMessage("managerEmail must be a string")
		.if(body("managerEmail").notEmpty())
		.isEmail()
		.withMessage("Email quản lý phải hợp lệ."),
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
	createTheaterWithManagerValidator,
	createTheaterValidator,
	updateTheaterValidator,
	deleteTheaterValidator,
};
export default theaterValidator;
