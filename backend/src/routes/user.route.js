import express from "express";
import userValidator from "../middlewares/validators/user.middleware.js";

import userController from "../controllers/user.controller.js";
import requestHandler from "../handlers/request.handler.js";

const router = express.Router();

router.post(
	"/signup",
	userValidator.signUpValidator,
	requestHandler.validate,
	userController.signUp
);

router.post(
	"/signin",
	userValidator.signInValidator,
	requestHandler.validate,
	userController.signIn
);

router.get("/verify", userController.verifyEmail);

router.post(
	"/resend-verification-email",
	userValidator.resendEmailValidator,
	requestHandler.validate,
	userController.resendVerificationEmail
);

router.post(
	"/forgot-password",
	userValidator.forgotPasswordValidator,
	requestHandler.validate,
	userController.forgotPassword
);

router.post(
	"/reset-password",
	userValidator.resetPasswordValidator,
	requestHandler.validate,
	userController.resetPassword
);

export default router;
