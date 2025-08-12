import { body, param } from "express-validator";

const createTheaterSystemValidator = [
	body("name")
		.trim()
		.escape()
		.isString()
		.notEmpty()
		.withMessage("Ten hệ thống không được trống."),
	body("code")
		.trim()
		.escape()
		.isString()
		.notEmpty()
		.withMessage("Mã hệ thống không được sé trống."),
	body("logo")
		.optional()
		.trim()
		.isString()
		.withMessage("logo must be a string")
		.isURL()
		.withMessage("Logo must be a valid URL."),
	body("description")
		.optional()
		.trim()
		.isLength({ min: 1 })
		.escape()
		.isString()
		.withMessage("description must be a string"),
];

const updateTheaterSystem = [
	param("id")
		.notEmpty()
		.withMessage("ID hệ thống phải được cung cấp.")
		.isMongoId()
		.withMessage("ID hệ thống không hợp lệ."),
	body("name")
		.optional()
		.trim()
		.escape()
		.isString()
		.withMessage("name must be a string"),
	body("code")
		.optional()
		.trim()
		.escape()
		.isString()
		.withMessage("code must be a string"),
	body("logo")
		.optional()
		.trim()
		.isString()
		.withMessage("logo must be a string")
		.isURL()
		.withMessage("Logo must be a valid URL."),
	body("description")
		.optional()
		.trim()
		.isLength({ min: 1 })
		.escape()
		.isString()
		.withMessage("description must be a string"),
];

const deleteTheaterSystem = [
	param("id")
		.notEmpty()
		.withMessage("ID hệ thống phải được cung cấp.")
		.isMongoId()
		.withMessage("ID hệ thống không hợp lệ."),
];

export default {
	createTheaterSystemValidator,
	updateTheaterSystem,
	deleteTheaterSystem,
};
