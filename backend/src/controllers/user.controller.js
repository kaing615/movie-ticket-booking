import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import responseHandler from "../handlers/response.handler.js";
import User from "../models/user.model.js";
import dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { CONNREFUSED } from "dns";

dotenv.config();

var transport = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

const generateToken = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

export const sendVerificationEmail = async (email, verifyKey, userName) => {
	const verifyLink = `http://localhost:4000/api/v1/user/verify?email=${encodeURIComponent(
		email
	)}&verifyKey=${verifyKey}`;
	const data = {
		from: "Cinema Gate <no-reply@cinemagate.com>",
		to: email,
		subject: "Xác thực tài khoản Cinema Gate",
		html: `
            <h3>Xin chào ${userName || ""}!</h3>
            <p>Bạn vừa đăng ký tài khoản Cinema Gate. Vui lòng bấm vào liên kết dưới đây để xác thực email:</p>
            <a href="${verifyLink}">${verifyLink}</a>
            <br /><br />
            <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
        `,
	};
	try {
		let info = await transport.sendMail(data);
		console.log("Email sent: ", info.messageId);
	} catch (err) {
		console.error("Lỗi gửi email xác thực: ", err);
		throw new Error("Không gửi được email xác thực!");
	}
};

export const verifyEmail = async (req, res) => {
	try {
		const { email, verifyKey } = req.query;
		const user = await User.findOne({
			email,
			verifyKey,
			verifyKeyExpires: { $gt: Date.now() },
			isVerified: false,
		});
		if (!user)
			return responseHandler.badRequest(
				res,
				"Liên kết xác thực không hợp lệ hoặc đã được sử dụng."
			);

		user.isVerified = true;
		user.verifyKey = "";
		user.verifyKeyExpires = undefined;

		await user.save();

		const token = jwt.sign(
			{ id: user._id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "7d" }
		);

		const userData = user.toObject();
		delete userData.password;
		delete userData.salt;
		delete userData.verifyKey;

		return responseHandler.ok(res, {
			message: "Xác thực email thành công!",
			token,
			...userData,
			id: user._id,
		});
	} catch (err) {
		console.error("Verify email error:", err);
		responseHandler.error(res);
	}
};

export const resendVerificationEmail = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email, isVerified: false });
		if (!user)
			return responseHandler.badRequest(
				res,
				"Người dùng đã xác thực hoặc không tồn tại."
			);

		user.verifyKey = generateToken();
		user.verifyKeyExpires = Date.now() + 24 * 60 * 60 * 1000;

		await user.save();

		await sendVerificationEmail(user.email, user.verifyKey, user.userName);

		return responseHandler.ok(res, {
			message: "Đã gửi lại email xác thực thành công!",
		});
	} catch (err) {
		responseHandler.error(res);
	}
};

export const signUp = async (req, res) => {
	try {
		const { userName, email, password } = req.body;

		const checkUser = await User.findOne({ email });
		if (checkUser)
			return responseHandler.badRequest(res, "Email đã được sử dụng.");

		if (!password) {
			return responseHandler.badRequest(
				res,
				"Mật khẩu không được để trống."
			);
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		const verifyKey = generateToken();
		const verifyKeyExpires = Date.now() + 24 * 60 * 60 * 1000;

		const user = new User({
			email,
			userName,
			password: hashedPassword,
			salt,
			isVerified: false,
			isDeleted: false,
			verifyKey,
			verifyKeyExpires,
		});

		await sendVerificationEmail(user.email, user.verifyKey, user.userName);
		await user.save();

		if (user.isVerified) {
			const token = jwt.sign(
				{ id: user._id, role: user.role },
				process.env.JWT_SECRET,
				{ expiresIn: "7d" }
			);
			const userData = user.toObject();
			delete userData.password;
			delete userData.salt;
			delete userData.verifyKey;
			return responseHandler.created(res, {
				token,
				user: userData,
				id: user._id,
			});
		}

		return responseHandler.created(res, {
			message:
				"Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
			id: user._id,
		});
	} catch (err) {
		console.error("Lỗi đăng ký:", err);
		responseHandler.error(res);
	}
};

export const signIn = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password)
			return responseHandler.badRequest(
				res,
				"Email và mật khẩu là bắt buộc."
			);

		const user = await User.findOne({ email });

		const genericErrorMessage = "Email hoặc mật khẩu không đúng.";
		// chống user enumeration

		const DUMMY_HASH =
			"$2a$10$abcdefghijklmnopqrstuvwxyzaBcdefghijklmnopqrstuvwxyza";
		// chống timing attack
		let isValidPassword = false;

		if (user && user.isVerified) {
			isValidPassword = await bcrypt.compare(password, user.password);
		} else {
			await bcrypt.compare(password, DUMMY_HASH);
			isValidPassword = false;
		}
		if (!isValidPassword) {
			return responseHandler.unauthorized(res, genericErrorMessage);
		}

		const token = jwt.sign(
			{
				id: user._id,
				role: user.role,
				userName: user.userName,
				email: user.email,
			},
			process.env.JWT_SECRET,
			{ expiresIn: "7d" }
		);

		const userData = user.toObject();
		delete userData.password;
		delete userData.salt;
		delete userData.verifyKey;

		return responseHandler.ok(res, {
			token,
			user: userData,
			id: user._id,
		});
	} catch (err) {
		console.error("Lỗi đăng nhập:", err);
		responseHandler.error(
			res,
			err.message || "Unknown error during sign-in."
		);
	}
};

export const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });
		if (!user)
			return responseHandler.ok(res, {
				message:
					"Nếu email này tồn tại, đã gửi liên kết đặt lại mật khẩu.",
			});

		const resetToken = generateToken();
		user.resetToken = resetToken;
		user.resetTokenExpires = Date.now() + 15 * 60 * 1000;

		await user.save();

		const resetLink = `http://localhost:4000/api/v1/user/reset-password?token=${resetToken}&email=${encodeURIComponent(
			email
		)}`;

		await transport.sendMail({
			from: "Cinema Gate <no-reply@cinemagate.com>",
			to: email,
			subject: "Đặt lại mật khẩu Cinema Gate",
			html: `
                <p>Nhấn vào liên kết bên dưới để đặt lại mật khẩu. Liên kết sẽ hết hạn sau 15 phút:</p>
                <a href="${resetLink}">${resetLink}</a>
            `,
		});

		return responseHandler.ok(res, {
			message: "Nếu email này tồn tại, đã gửi liên kết đặt lại mật khẩu.",
		});
	} catch (err) {
		console.error("Lỗi quên mật khẩu:", err);
		responseHandler.error(res);
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { email, token, newPassword } = req.body;
		const user = await User.findOne({
			email,
			resetToken: token,
			resetTokenExpires: { $gt: Date.now() },
		});
		if (!user)
			return responseHandler.badRequest(
				res,
				"Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."
			);

		user.password = await bcrypt.hash(newPassword, 10);
		user.resetToken = undefined;
		user.resetTokenExpires = undefined;
		await user.save();

		return responseHandler.ok(res, {
			message: "Đặt lại mật khẩu thành công.",
		});
	} catch (err) {
		console.error("Lỗi đặt lại mật khẩu:", err);
		responseHandler.error(res);
	}
};

export default {
	signUp,
	signIn,
	verifyEmail,
	resendVerificationEmail,
	forgotPassword,
	resetPassword,
};
