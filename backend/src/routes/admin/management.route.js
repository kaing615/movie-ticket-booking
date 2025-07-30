import express from "express";
import userManagementsRoutes from "./management/user.route.js";

const router = express.Router();

router.use("/users", userManagementsRoutes);

export default router;
