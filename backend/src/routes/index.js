import express from "express";
import token from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js"; // Middleware to authorize user roles

import userRoute from "./user.route.js";
import theaterRoute from "./theater.route.js";
import theaterManagerRoute from "./theater-manager.route.js"

const router = express.Router();

router.use("/user", userRoute);

//Every route after this middleware will require authentication
router.use(token.auth);
router.use("/theater-manager", authorizeRoles("theater-manager"), theaterManagerRoute);
router.use("/theater", authorizeRoles(["admin"]), theaterRoute);

export default router;
