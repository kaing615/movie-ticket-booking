// src/controllers/admin/users.controller.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import User from "../../models/user.model.js";
import Theater from "../../models/theater.model.js";
import responseHandler from "../../handlers/response.handler.js";

const toBool = (v) => (typeof v === "boolean" ? v : String(v) === "true");

// ====== GETS
export const getCustomers = async (req, res) => {
  try {
    const users = await User.find({ role: "customer" });
    return responseHandler.ok(res, users);
  } catch (error) {
    console.error("getCustomers error:", error);
    return responseHandler.error(res);
  }
};

export const getManagers = async (req, res) => {
  try {
    const users = await User.find({ role: "theater-manager" });
    return responseHandler.ok(res, users);
  } catch (error) {
    console.error("getManagers error:", error);
    return responseHandler.error(res);
  }
};

// ====== CUSTOMERS
export const createCustomer = async (req, res) => {
  try {
    const { email, userName } = req.body;

    if (!email || !userName) {
      return responseHandler.badRequest(res, "Missing email or userName");
    }

    const norm = String(email).trim().toLowerCase();
    const existed = await User.findOne({ email: norm, isDeleted: false });
    if (existed) {
      return responseHandler.badRequest(res, "Email already in use");
    }

    // Tạo password tạm (không trả về cho FE). KHÔNG cho đổi password ở UI.
    const tempPw = crypto.randomBytes(9).toString("base64url"); // ~12 ký tự
    const hashed = await bcrypt.hash(tempPw, 10);

    const created = await User.create({
      email: norm,
      userName,
      password: hashed,
      role: "customer",
      isVerified: true,
    });

    // Không trả password ra
    const safe = created.toObject();
    delete safe.password;
    return responseHandler.created(res, safe);
  } catch (error) {
    console.error("createCustomer error:", error);
    if (error.code === 11000) {
      return responseHandler.badRequest(res, "Email already exists");
    }
    return responseHandler.error(res);
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, userName, isDeleted } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseHandler.badRequest(res, "Invalid user id");
    }

    const user = await User.findById(id);
    if (!user || user.role !== "customer") {
      return responseHandler.notFound(res, "Customer not found");
    }

    // KHÔNG cho đổi password hoặc role
    if (typeof email === "string" && email.trim()) {
      const norm = email.trim().toLowerCase();
      if (norm !== user.email) {
        const dup = await User.findOne({ email: norm, _id: { $ne: id } });
        if (dup) return responseHandler.badRequest(res, "Email already in use");
        user.email = norm;
      }
    }
    if (typeof userName === "string") user.userName = userName;
    if (typeof isDeleted !== "undefined") user.isDeleted = toBool(isDeleted);

    await user.save();
    const safe = user.toObject();
    delete safe.password;
    return responseHandler.ok(res, safe);
  } catch (error) {
    console.error("updateCustomer error:", error);
    return responseHandler.error(res);
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseHandler.badRequest(res, "Invalid user id");
    }

    const user = await User.findById(id);
    if (!user || user.role !== "customer") {
      return responseHandler.notFound(res, "Customer not found");
    }

    // Soft delete
    user.isDeleted = true;
    await user.save();
    return responseHandler.ok(res, { message: "Customer deleted" });
  } catch (error) {
    console.error("deleteCustomer error:", error);
    return responseHandler.error(res);
  }
};

// ====== MANAGERS (no password changes here)
export const updateManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, userName, isDeleted } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseHandler.badRequest(res, "Invalid user id");
    }

    const user = await User.findById(id);
    if (!user || user.role !== "theater-manager") {
      return responseHandler.notFound(res, "Manager not found");
    }

    // KHÔNG cho đổi password hay role
    if (typeof email === "string" && email.trim()) {
      const norm = email.trim().toLowerCase();
      if (norm !== user.email) {
        const dup = await User.findOne({ email: norm, _id: { $ne: id } });
        if (dup) return responseHandler.badRequest(res, "Email already in use");
        user.email = norm;
      }
    }
    if (typeof userName === "string") user.userName = userName;

    if (typeof isDeleted !== "undefined") {
      user.isDeleted = toBool(isDeleted);
      // Nếu deactivate manager => gỡ khỏi theater đang quản lý (tránh mồ côi tham chiếu)
      if (user.isDeleted) {
        await Theater.updateMany({ managerId: user._id }, { $set: { managerId: null } });
      }
    }

    await user.save();
    const safe = user.toObject();
    delete safe.password;
    return responseHandler.ok(res, safe);
  } catch (error) {
    console.error("updateManager error:", error);
    return responseHandler.error(res);
  }
};

export const deleteManager = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseHandler.badRequest(res, "Invalid user id");
    }

    const user = await User.findById(id);
    if (!user || user.role !== "theater-manager") {
      return responseHandler.notFound(res, "Manager not found");
    }

    // Soft delete + gỡ khỏi các theater
    user.isDeleted = true;
    await user.save();
    await Theater.updateMany({ managerId: user._id }, { $set: { managerId: null } });

    return responseHandler.ok(res, { message: "Manager deleted" });
  } catch (error) {
    console.error("deleteManager error:", error);
    return responseHandler.error(res);
  }
};

export default {
  getCustomers,
  getManagers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  updateManager,
  deleteManager,
};
