import express from "express";
import analyticsController from "../controllers/admin/admin-analytics.controller.js";

const router = express.Router();

router.get("/daily-ticket-number", analyticsController.getDailyTicketCount);

router.get("/daily-ticket-revenue", analyticsController.getDailyRevenue);
export default router;
