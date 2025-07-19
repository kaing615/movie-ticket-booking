import express from "express";
import analyticsController from "../controllers/admin/admin-analytics.controller.js";

const router = express.Router();

router.get("/daily-ticket-number", analyticsController.getDailyTicketCount);

router.get("/daily-ticket-revenue", analyticsController.getDailyRevenue);

router.get("/user-count-by-role", analyticsController.getUserCountByRole);

router.get("/theater-by-system", analyticsController.getTheaterBySystem);
export default router;
