import express from "express";
import authorizeRoles from "../middlewares/role.middleware.js";
import tokenMiddleware from "../middlewares/token.middleware.js";
import supportController from "../controllers/support.controller.js";

const router = express.Router();

router.use(tokenMiddleware.auth);

router.post("/", tokenMiddleware.auth, supportController.createSupportTicket);

router.use(authorizeRoles(["admin", "theater-manager"]));

router.get("/", supportController.getAllSupportTickets);

router.get("/:id", supportController.getSupportTicketById);

router.put("/:id", supportController.updateSupportTicket);

router.delete("/:id", supportController.deleteSupportTicket);

export default router;
