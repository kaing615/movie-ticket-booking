import Ticket from "../models/ticket.model.js";
import Booking from "../models/booking.model.js";
import responseHandler from "../handlers/response.handler.js";

const hasElevated = (user) => ["admin", "theater-manager"].includes(user.role);

export const ensureTicketOwner = async (req, res, next) => {
  const t = await Ticket.findById(req.params.id).select("ownerId");
  if (!t) return responseHandler.notFound(res, "Không tìm thấy vé!");
  if (String(t.ownerId) !== String(req.user._id) && !hasElevated(req.user)) {
    return responseHandler.forbidden(res, "Bạn không có quyền với vé này.");
  }
  next();
};

export const ensureBookingOwner = async (req, res, next) => {
  const b = await Booking.findById(req.params.id).select("userId status");
  if (!b) return responseHandler.notFound(res, "Không tìm thấy đơn đặt vé!");
  if (String(b.userId) !== String(req.user._id) && !hasElevated(req.user)) {
    return responseHandler.forbidden(res, "Bạn không có quyền với đơn này.");
  }
  // đính kèm vào req nếu cần
  req._booking = b;
  next();
};
