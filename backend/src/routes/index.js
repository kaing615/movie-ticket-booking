import express from "express";
import token from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

import userRoute from "./auth.route.js";
import theaterRoute from "./theater.route.js";
import showRoute from "./show.route.js";
import theaterSystemRoute from "./theaterSystem.route.js";
import roomRoute from "./room.route.js";
import movieRoute from "./movie.route.js";
import reviewRoute from "./review.route.js";
import bookingRoute from "./booking.route.js";
import ticketRoute from "./ticket.route.js";
import seatRoute from "./seat.route.js";

import adminRoutes from "../routes/admin/admin.route.js";

const router = express.Router();

router.use("/user", userRoute);
router.use("/show", showRoute);
router.use("/movies", movieRoute);
router.use("/theater-system", theaterSystemRoute);
router.use("/theater", theaterRoute);
router.use("/review", reviewRoute);
router.use("/booking", bookingRoute);
router.use("/ticket", ticketRoute);
router.use("/seat", seatRoute);

router.use(token.auth);

router.use("/room", authorizeRoles(["theater-manager", "admin"]), roomRoute);
router.use("/admin", authorizeRoles(["admin"]), adminRoutes);

export default router;
