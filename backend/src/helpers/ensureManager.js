// src/controllers/_helpers/ensureManager.js
import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";   
import crypto from "crypto";

const normalizeEmail = (e) =>
  String(e || "")
    .trim()
    .toLowerCase();
const genTempPassword = () => crypto.randomBytes(6).toString("base64url"); // 8-10 ký tự

export async function ensureManagerByEmail(
  email,
  { session, promote = true } = {}
) {
  const norm = normalizeEmail(email);
  if (!norm) return null;

  let user = await User.findOne({ email: norm }).session(session);

  if (!user) {
    const tempPw = genTempPassword();
    const hashed = await bcrypt.hash(tempPw, 10);
    const [created] = await User.create(
      [
        {
          email: norm,
          userName: norm.split("@")[0],
          role: "theater-manager",
          password: hashed,
          isVerified: true,
          verifyKey: crypto.randomBytes(32).toString("hex"),
          verifyKeyExpires: Date.now() + 24 * 60 * 60 * 1000,
        },
      ],
      { session }
    );
    user = created;
  } else if (user.role !== "theater-manager") {
    if (!promote) {
      throw new Error("Email belongs to an existing non-manager user.");
    }
    user.role = "theater-manager";
    await user.save({ session });
  }

  return user;
}

export async function createManagerWithPassword({ email, userName, plainPassword, session }) {
  const normEmail = normalizeEmail(email);
  if (!normEmail || !plainPassword) {
    const err = new Error("Thiếu email hoặc mật khẩu của theater-manager.");
    err.status = 400;
    throw err;
  }

  const existed = await User.findOne({ email: normEmail, isDeleted: false }).session(session);
  if (existed) {
    const err = new Error("Email đã tồn tại, không thể tạo mới manager với mật khẩu.");
    err.status = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  const doc = {
    email: normEmail,
    userName: userName || normEmail.split("@")[0],
    password: hashedPassword,
    role: "theater-manager",
    isVerified: true, 
    verifyKey: crypto.randomBytes(32).toString("hex"),
    verifyKeyExpires: Date.now() + 24 * 60 * 60 * 1000,
  };

  const [user] = await User.create([doc], { session });
  return user;
}