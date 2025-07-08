import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import responseHandler from "../handlers/response.handler";
import User from "../models/user.model";
import formData from "form-data";
import Mailgun from "mailgun.js";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

const generateToken = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

export const sendVerificationEmail = async (email, verifyKey, userName) => {
  const verifyLink = `${process.env.CLIENT_URL}/verify?email=${encodeURIComponent(
    email
  )}&verifyKey=${verifyKey}`;

  const data = {
    from: "Cinema Gate <no-reply@yourdomain.com>",
    to: email,
    subject: "Cinema Gate Account Verification",
    html: `
      <h3>Hello ${userName || ""}!</h3>
      <p>You have just registered a Cinema Gate account. Please click the link below to verify your email:</p>
      <a href="${verifyLink}">${verifyLink}</a>
      <br /><br />
      <p>If you did not register this account, please ignore this email.</p>
    `,
  };

  return mg.messages.create(process.env.MAILGUN_DOMAIN, data);
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, verifyKey } = req.query;
    const user = await User.findOne({ email, verifyKey, verifyKeyExpires: { $gt: Date.now() }, isVerified: false });
    if (!user)
      return responseHandler.badRequest(
        res,
        "The verification link is invalid or has already been used."
      );

    user.isVerified = true;
    user.verifyKey = "";

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
      message: "Email verification successful!",
      token,
      ...userData,
      id: user._id,
    });
  } catch (err) {
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
        "User has already been verified or does not exist."
      );
    
    user.verifyKey = generateToken();
    user.verifyKeyExpires = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    await sendVerificationEmail(user.email, user.verifyKey, user.userName);

    return responseHandler.ok(res, {
      message: "Resend verification email successful!",
    });
  } catch (err) {
    responseHandler.error(res);
  }
};

export const signUp = async (req, res) => {
  try {
    const {
      userName,
      email,
      password,
      role,
    } = req.body;

    const checkUser = await User.findOne({ email });
    if (checkUser)
      return responseHandler.badRequest(res, "User already exists");

    let hashedPassword = "";
    let salt = "";
    let verifyKey = "";

    if (!password) {
        return responseHandler.badRequest(res, "Password cannot be empty.");
    }

    salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(password, salt);
    verifyKey = generateToken();
    const verifyKeyExpires = Date.now() + 24 * 60 * 60 * 1000;

    const user = new User({
      email,
      userName,
      password: hashedPassword,
      salt,
      role,
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
        ...userData,
        id: user._id,
      });
    }

    return responseHandler.created(res, {
      message:
        "Registration successful! Please check your email to verify your account.",
      id: user._id,
    });
  } catch (err) {
    console.error("Sign up error:", err);
    responseHandler.error(res);
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return responseHandler.badRequest(
        res,
        "Email and password are required."
      );

    const user = await User.findOne({ email });
    if (!user) return responseHandler.notFound(res, "User not found.");

    if (!user.isVerified)
      return responseHandler.forbidden(
        res,
        "Please verify your email before logging in."
      );

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return responseHandler.unauthorized(res, "Invalid email or password.");

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
      ...userData,
      id: user._id,
    });
  } catch (err) {
    console.error("signIn error:", err);
    responseHandler.error(res);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return responseHandler.ok(res, {
        message: "If this email exists, sent a reset link.",
      });

    const resetToken = generateToken();
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(
      email
    )}`;
    await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: "Cinema Gate <no-reply@yourdomain.com>",
      to: email,
      subject: "Reset your Cinema Gate password",
      html: `
        <p>Click the link below to reset your password. The link will expire in 15 minutes:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    return responseHandler.ok(res, {
      message: "If this email exists, sent a reset link.",
    });
  } catch (err) {
    console.error("forgotPassword error:", err);
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
      return responseHandler.badRequest(res, "Invalid or expired reset link.");

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return responseHandler.ok(res, { message: "Password reset successful." });
  } catch (err) {
    console.error("resetPassword error:", err);
    responseHandler.error(res);
  }
};