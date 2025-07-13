import express from "express";
import userValidator from "../middlewares/validators/user.middleware.js";

import authController from "../controllers/auth.controller.js";
import requestHandler from "../handlers/request.handler.js";

const router = express.Router();

router.post(
	"/signup",
	userValidator.signUpValidator,
	requestHandler.validate,
	authController.signUp
);
router.post(
	"/signin",
	userValidator.signInValidator,
	requestHandler.validate,
	authController.signIn
);

router.get("/verify", authController.verifyEmail);

router.post(
	"/resend-verification-email",
	userValidator.resendEmailValidator,
	requestHandler.validate,
	authController.resendVerificationEmail
);

router.post(
	"/forgot-password",
	userValidator.forgotPasswordValidator,
	requestHandler.validate,
	authController.forgotPassword
);

router.post(
	"/reset-password",
	userValidator.resetPasswordValidator,
	requestHandler.validate,
	authController.resetPassword
);

export default router;
