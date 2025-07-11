import express from "express";
import token from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

import userRoute from "./user.route.js";
import theaterRoute from "./theater.route.js";

const router = express.Router();

router.use("/user", userRoute);

router.use(token.auth);

router.use("/theater", authorizeRoles(["admin"]), theaterRoute);

export default router;
