import express from "express";
import analyticsRoutes from "./analytics.route.js";
import managementRoutes from "./management.route.js";

const router = express.Router();

router.use("/analytics", analyticsRoutes);
router.use("/management", managementRoutes);

export default router;
