import express from "express";
import bookingController from "../controllers/booking.controller.js";
import tokenMiddleware from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import { ensureBookingOwner } from "../middlewares/ownership.middleware.js";

const router = express.Router();

router.use(tokenMiddleware.auth);

router.get("/me", bookingController.getBookingOfUser);
router.post("/", bookingController.createBooking);

router.post("/confirm", bookingController.confirmBookingFromHold);

router.put("/:id/pay",
  authorizeRoles(["admin"]),
  bookingController.updateBooking
);

router.put("/:id/cancel",
  ensureBookingOwner,
  bookingController.updateBooking
);

router.delete("/:id", ensureBookingOwner, bookingController.deleteBooking);

export default router;
