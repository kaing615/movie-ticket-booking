import express from 'express';
import { body, param } from 'express-validator';
import userController from '../controllers/user.controller.js';
import requestHandler from '../handlers/request.handler.js';

const router = express.Router();

router.post(
    '/signup',
    [
        body('email').isEmail().withMessage('Email không hợp lệ'),
        body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
        body('userName').notEmpty().withMessage('Tên người dùng không được để trống'),
    ],
    requestHandler.validate,
    userController.signUp
);

router.post(
    '/signin',
    [
        body('email').isEmail().withMessage('Email không hợp lệ'),
        body('password').notEmpty().withMessage('Mật khẩu không được để trống'),
    ],
    requestHandler.validate,
    userController.signIn
);

router.get(
    '/verify-email',
    userController.verifyEmail
);

router.post(
    '/resend-verification-email',
    [
        body('email').isEmail().withMessage('Email không hợp lệ'),
    ],
    requestHandler.validate,
    userController.resendVerificationEmail
);

router.post(
    '/forgot-password',
    [
        body('email').isEmail().withMessage('Email không hợp lệ'),
    ],
    requestHandler.validate,
    userController.forgotPassword
);

router.post(
    '/reset-password',
    [
        body('email').isEmail().withMessage('Email không hợp lệ'),
        body('token').notEmpty().withMessage('Token không được để trống'),
        body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
    ],
    requestHandler.validate,
    userController.resetPassword
);

export default router;
