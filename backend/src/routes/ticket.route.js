import express from "express";
import ticketController from "../controllers/ticket.controller.js";
import tokenMiddleware from "../middlewares/token.middleware.js";

const router = express.Router();

// Yêu cầu đăng nhập cho tất cả routes
router.use(tokenMiddleware.auth);

// Routes cho ticket
router.get("/me", ticketController.getUserTickets);
router.get("/:id", ticketController.getTicketById);
router.put("/:id/use", ticketController.markTicketAsUsed);
router.put("/:id/cancel", ticketController.cancelTicket);
router.put("/:id/refund", ticketController.refundTicket);

export default router;