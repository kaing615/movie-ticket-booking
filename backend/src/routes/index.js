import express from "express";
import token from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

import userRoute from "./user.route.js";
import theaterRoute from "./theater.route.js";
import showRoute from "./show.route.js";
import theaterSystemRoute from "./theaterSystem.route.js";
import roomRoute from "./room.route.js";
import movieRoute from "./movie.route.js";

const router = express.Router();

router.use("/user", userRoute);
router.use("/show", showRoute);
router.use("/movies", movieRoute);
router.use("/theater-system", theaterSystemRoute);
router.use("/theater", theaterRoute);

router.use(token.auth);

router.use("/room", authorizeRoles(["theater-manager"]), roomRoute);

export default router;
