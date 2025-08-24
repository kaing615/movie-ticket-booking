import mongoose from "mongoose";

import Theater from "../models/theater.model.js";
import User from "../models/user.model.js";
import TheaterSystem from "../models/theaterSystem.model.js";
import responseHandler from "../handlers/response.handler.js";

import { withOptionalTransaction } from "../helpers/tx.js";
import { createManagerWithPassword } from "../helpers/ensureManager.js";

const normStr = (v) => String(v ?? "").trim();

/** Tìm hệ thống rạp theo code (case-insensitive) hoặc id */
async function resolveSystem({ theaterSystemCode, theaterSystemId, session }) {
  // Nếu có id và hợp lệ -> ưu tiên id
  if (theaterSystemId && mongoose.Types.ObjectId.isValid(theaterSystemId)) {
    let q = TheaterSystem.findById(theaterSystemId);
    if (session) q = q.session(session);
    const sys = await q;
    return sys || null;
  }

  // Nếu có code -> chuẩn hoá upper-case để stable
  const code = normStr(theaterSystemCode);
  if (code) {
    let q = TheaterSystem.findOne({ code: code.toUpperCase(), isDeleted: { $ne: true } });
    if (session) q = q.session(session);
    const sys = await q;
    return sys || null;
  }

  return null;
}

/**
 * Tạo rạp + tạo mới tài khoản theater-manager (admin đặt mật khẩu)
 */
const createTheaterAndManager = async (req, res) => {
  try {
    const result = await withOptionalTransaction(async (session) => {
      const {
        theaterName,
        location,
        theaterSystemId, // ở API này yêu cầu id
        managerEmail,
        managerUserName,
        managerPassword,
      } = req.body;

      if (!theaterName || !location || !theaterSystemId || !managerEmail || !managerUserName || !managerPassword) {
        const err = new Error("Thiếu thông tin bắt buộc.");
        err.status = 400; throw err;
      }

      if (!mongoose.Types.ObjectId.isValid(theaterSystemId)) {
        const err = new Error("ID hệ thống không hợp lệ.");
        err.status = 400; throw err;
      }

      // Hệ thống
      let sysQ = TheaterSystem.findById(theaterSystemId);
      if (session) sysQ = sysQ.session(session);
      const system = await sysQ;
      if (!system) {
        const err = new Error("Không tìm thấy hệ thống rạp.");
        err.status = 404; throw err;
      }

      // Trùng tên trong cùng hệ thống
      let existedTheaterQ = Theater.findOne({
        theaterName: normStr(theaterName),
        theaterSystemId: system._id,
        isDeleted: false,
      });
      if (session) existedTheaterQ = existedTheaterQ.session(session);
      const existedTheater = await existedTheaterQ;
      if (existedTheater) {
        const err = new Error("Tên rạp đã tồn tại trong hệ thống này.");
        err.status = 400; throw err;
      }

      const normEmail = normStr(managerEmail).toLowerCase();
      let userQ = User.findOne({ email: normEmail, isDeleted: false });
      if (session) userQ = userQ.session(session);
      const existedUser = await userQ;
      if (existedUser) {
        const err = new Error("Email quản lý đã được sử dụng.");
        err.status = 400; throw err;
      }

      // Tạo manager với mật khẩu do admin đặt
      const newManager = await createManagerWithPassword({
        email: normEmail,
        userName: normStr(managerUserName),
        plainPassword: managerPassword,
        session,
      });

      // 1 manager chỉ quản 1 rạp
      let dupQ = Theater.findOne({ managerId: newManager._id, isDeleted: false });
      if (session) dupQ = dupQ.session(session);
      const dup = await dupQ;
      if (dup) {
        const err = new Error("Người quản lý này đã được phân công cho một rạp khác.");
        err.status = 400; throw err;
      }

      // Tạo rạp
      const created = await Theater.create(
        [{ theaterName: normStr(theaterName), location: normStr(location), theaterSystemId: system._id, managerId: newManager._id }],
        session ? { session } : undefined
      );
      const theater = created[0];

      const safeManager = newManager.toObject();
      delete safeManager.password;
      delete safeManager.verifyKey;
      delete safeManager.verifyKeyExpires;

      return {
        message: "Tạo rạp và tài khoản theater-manager thành công!",
        theater,
        manager: safeManager,
      };
    });

    return responseHandler.created(res, result);
  } catch (err) {
    console.error("Lỗi tạo rạp và quản lý:", err);
    if (err.status) return res.status(err.status).json({ message: err.message });
    return responseHandler.error(res, err.message);
  }
};

/**
 * Tạo rạp. Nếu managerEmail chưa tồn tại -> yêu cầu admin truyền password để tạo mới account manager.
 * Nhận theaterSystemCode (không phân biệt hoa/thường) HOẶC theaterSystemId.
 */
const createTheater = async (req, res) => {
  try {
    const result = await withOptionalTransaction(async (session) => {
      const {
        theaterName,
        location,
        theaterSystemCode,
        theaterSystemId,     // hỗ trợ thêm
        managerEmail,
        managerUserName,
        managerPassword,
      } = req.body;

      if (!theaterName || !location) {
        const err = new Error("Thiếu thông tin bắt buộc.");
        err.status = 400; throw err;
      }

      // Hệ thống (optional)
      const system = await resolveSystem({ theaterSystemCode, theaterSystemId, session });

      // Kiểm tra trùng tên THEO HỆ THỐNG (null cũng là một hệ riêng)
      let nameQ = Theater.findOne({
        theaterName: normStr(theaterName),
        theaterSystemId: system?._id ?? null,
        isDeleted: false,
      });
      if (session) nameQ = nameQ.session(session);
      const nameTaken = await nameQ;
      if (nameTaken) {
        const err = new Error("Tên rạp đã được sử dụng trong hệ thống này.");
        err.status = 400; throw err;
      }

      // Manager (optional)
      let manager = null;
      if (managerEmail) {
        const normEmail = normStr(managerEmail).toLowerCase();
        let mQ = User.findOne({ email: normEmail, isDeleted: false });
        if (session) mQ = mQ.session(session);
        manager = await mQ;

        if (!manager) {
          if (!managerPassword) {
            const err = new Error("Chưa có tài khoản manager, vui lòng nhập mật khẩu để tạo mới.");
            err.status = 400; throw err;
          }
          manager = await createManagerWithPassword({
            email: normEmail,
            userName: normStr(managerUserName) || normEmail.split("@")[0],
            plainPassword: managerPassword,
            session,
          });
        } else if (manager.role !== "theater-manager") {
          const err = new Error("Người dùng không phải là theater-manager.");
          err.status = 400; throw err;
        }

        // 1 manager chỉ quản 1 rạp
        let dupQ = Theater.findOne({ managerId: manager._id, isDeleted: false });
        if (session) dupQ = dupQ.session(session);
        const existingTheater = await dupQ;
        if (existingTheater) {
          const err = new Error("Người quản lý này đã được phân công cho một rạp khác.");
          err.status = 400; throw err;
        }
      }

      // Tạo rạp
      const created = await Theater.create(
        [{
          theaterName: normStr(theaterName),
          location: normStr(location),
          theaterSystemId: system?._id ?? null,
          ...(manager ? { managerId: manager._id } : {}),
        }],
        session ? { session } : undefined
      );
      const theater = created[0];

      return { message: "Tạo rạp chiếu phim thành công!", theater };
    });

    return responseHandler.created(res, result);
  } catch (err) {
    console.error("Lỗi tạo rạp:", err);
    if (err.status) return res.status(err.status).json({ message: err.message });
    return responseHandler.error(res, err.message);
  }
};

/**
 * Cập nhật rạp:
 * - đổi tên/location
 * - gán/bỏ gán manager (email); nếu email mới chưa tồn tại -> bắt buộc nhập mật khẩu để tạo mới.
 * - đổi hệ thống theo code hoặc id.
 */
const updateTheater = async (req, res) => {
  try {
    const result = await withOptionalTransaction(async (session) => {
      const { theaterId } = req.params;
      const {
        theaterName,
        location,
        managerEmail,
        managerUserName,
        managerPassword,
        theaterSystemCode,
        theaterSystemId,
      } = req.body;

      if (!mongoose.Types.ObjectId.isValid(theaterId)) {
        const err = new Error("ID rạp không hợp lệ.");
        err.status = 400; throw err;
      }

      let tQ = Theater.findById(theaterId);
      if (session) tQ = tQ.session(session);
      const theater = await tQ;
      if (!theater || theater.isDeleted) {
        const err = new Error("Không tìm thấy rạp.");
        err.status = 404; throw err;
      }

      // Tính system đích (nếu có request đổi)
      let targetSystemId = theater.theaterSystemId;
      if (theaterSystemCode !== undefined || theaterSystemId !== undefined) {
        const sys = await resolveSystem({ theaterSystemCode, theaterSystemId, session });
        targetSystemId = sys ? sys._id : null;
        if (theaterSystemCode || theaterSystemId) {
          if (!sys) {
            const err = new Error("Không tìm thấy hệ thống.");
            err.status = 404; throw err;
          }
        }
      }

      // Đổi tên: kiểm tra trùng THEO hệ thống đích
      if (theaterName) {
        let dupNameQ = Theater.findOne({
          _id: { $ne: theaterId },
          theaterName: normStr(theaterName),
          theaterSystemId: targetSystemId ?? null,
          isDeleted: false,
        });
        if (session) dupNameQ = dupNameQ.session(session);
        const nameTaken = await dupNameQ;
        if (nameTaken) {
          const err = new Error("Tên rạp đã được sử dụng trong hệ thống này.");
          err.status = 400; throw err;
        }
        theater.theaterName = normStr(theaterName);
      }

      if (location) theater.location = normStr(location);

      // Manager reassignment
      if (managerEmail !== undefined) {
        const normEmail = normStr(managerEmail).toLowerCase();
        if (!normEmail) {
          theater.managerId = null; // bỏ gán
        } else {
          let mQ = User.findOne({ email: normEmail, isDeleted: false });
          if (session) mQ = mQ.session(session);
          let manager = await mQ;

          if (!manager) {
            if (!managerPassword) {
              const err = new Error("Email manager mới chưa tồn tại. Cần nhập mật khẩu để tạo tài khoản mới.");
              err.status = 400; throw err;
            }
            manager = await createManagerWithPassword({
              email: normEmail,
              userName: normStr(managerUserName) || normEmail.split("@")[0],
              plainPassword: managerPassword,
              session,
            });
          } else if (manager.role !== "theater-manager") {
            const err = new Error("Người dùng không phải là theater-manager.");
            err.status = 400; throw err;
          }

          // 1 manager chỉ quản 1 rạp
          let dupQ = Theater.findOne({
            _id: { $ne: theaterId },
            managerId: manager._id,
            isDeleted: false,
          });
          if (session) dupQ = dupQ.session(session);
          const dup = await dupQ;
          if (dup) {
            const err = new Error("Người quản lý này đã được phân công cho một rạp khác.");
            err.status = 400; throw err;
          }

          theater.managerId = manager._id;
        }
      }

      // Apply system change (nếu có)
      if (theaterSystemCode !== undefined || theaterSystemId !== undefined) {
        theater.theaterSystemId = targetSystemId ?? null;
      }

      await theater.save(session ? { session } : undefined);

      return { message: "Cập nhật rạp chiếu phim thành công!", theater };
    });

    return responseHandler.ok(res, result);
  } catch (err) {
    console.error("Lỗi cập nhật rạp:", err);
    if (err.status) return res.status(err.status).json({ message: err.message });
    return responseHandler.error(res, err.message);
  }
};

/** Soft delete */
const deleteTheater = async (req, res) => {
  try {
    const { theaterId } = req.params;

    const theater = await Theater.findById(theaterId);
    if (!theater || theater.isDeleted) {
      return responseHandler.notFound(res, "Không tìm thấy rạp hoặc đã bị xóa.");
    }

    theater.isDeleted = true;
    await theater.save();

    return responseHandler.ok(res, { message: "Xóa rạp chiếu phim thành công!" });
  } catch (err) {
    console.error("Lỗi xóa rạp:", err);
    return responseHandler.error(res);
  }
};

const getTheater = async (req, res) => {
  try {
    const { systemId } = req.query;
    const filter = { isDeleted: false };
    if (systemId) {
      if (!mongoose.Types.ObjectId.isValid(systemId)) {
        return responseHandler.badRequest(res, "systemId không hợp lệ.");
      }
      filter.theaterSystemId = systemId;
    }
    const theaters = await Theater.find(filter);
    return responseHandler.ok(res, { theaters });
  } catch (error) {
    console.error("Lỗi lấy danh sách rạp:", error);
    return responseHandler.serverError(res, error.message || "Unknown server error.");
  }
};

const getTheaterById = async (req, res) => {
  try {
    const { id } = req.params;
    const theater = await Theater.findById(id).populate("theaterSystemId");
    if (!theater || theater.isDeleted) {
      return responseHandler.notFound(res, "Không tìm thấy rạp hoặc đã bị xóa.");
    }
    return responseHandler.ok(res, theater);
  } catch (err) {
    return responseHandler.error(res, err);
  }
};

const getTheaterByManagerId = async (req, res) => {
  try {
    const { managerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(managerId)) {
      return responseHandler.badRequest(res, "ID manager không hợp lệ.");
    }

    const manager = await User.findOne({ _id: managerId, role: "theater-manager", isDeleted: false });
    if (!manager) {
      return responseHandler.notFound(res, "Không tìm thấy theater manager.");
    }

    const theater = await Theater.findOne({ managerId, isDeleted: false })
      .populate("managerId", "userName email")
      .populate("theaterSystemId", "name code logo");

    if (!theater) {
      return responseHandler.notFound(res, "Không tìm thấy rạp được quản lý bởi manager này.");
    }

    return responseHandler.ok(res, { message: "Lấy thông tin rạp thành công!", theater });
  } catch (err) {
    console.error("Lỗi lấy thông tin rạp theo manager:", err);
    return responseHandler.error(res);
  }
};

export default {
  createTheaterAndManager,
  createTheater,
  updateTheater,
  deleteTheater,
  getTheater,
  getTheaterById,
  getTheaterByManagerId,
};
