import express from "express";
import token from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

import authRoute from "./auth.route.js";
import theaterRoute from "./theater.route.js";
import theaterManagerRoute from "./theater-manager.route.js";
import showRoute from "./show.route.js";
import theaterSystemRoute from "./theaterSystem.route.js";
import roomRoute from "./room.route.js";

const router = express.Router();

router.use("/auth", authRoute);

router.use(token.auth);
router.use(
	"/theater-manager",
	authorizeRoles(["theater-manager"]),
	theaterManagerRoute
);
router.use("/theater-system", authorizeRoles(["admin"]), theaterSystemRoute);
router.use("/show", authorizeRoles(["theater-manager"]), showRoute);
router.use("/theater", authorizeRoles(["admin"]), theaterRoute);
router.use("/room", authorizeRoles(["theater-manager"]), roomRoute);

export default router;
