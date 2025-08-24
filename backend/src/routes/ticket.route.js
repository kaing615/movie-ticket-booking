import express from "express";
import ticketController from "../controllers/ticket.controller.js";
import tokenMiddleware from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import { ensureTicketOwner } from "../middlewares/ownership.middleware.js";

const router = express.Router();

router.use(tokenMiddleware.auth);

router.get("/me", ticketController.getUserTickets);
router.get("/:id", ensureTicketOwner, ticketController.getTicketById);

router.put("/:id/use",
  authorizeRoles(["theater-manager", "admin"]),
  ticketController.markTicketAsUsed
);

router.put("/:id/cancel",
  ensureTicketOwner,
  ticketController.cancelTicket
);

router.put("/:id/refund",
  authorizeRoles(["admin"]),
  ticketController.refundTicket
);

export default router;
