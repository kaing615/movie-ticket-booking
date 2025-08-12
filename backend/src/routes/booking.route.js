import express from "express";
import bookingController from "../controllers/booking.controller.js";
import tokenMiddleware from "../middlewares/token.middleware.js";

const router = express.Router();

// Yêu cầu đăng nhập cho tất cả routes
router.use(tokenMiddleware.auth);

// Routes cho booking
router.get("/me", bookingController.getBookingOfUser);
router.post("/", bookingController.createBooking);
router.put("/:id", bookingController.updateBooking);
router.delete("/:id", bookingController.deleteBooking);

export default router;