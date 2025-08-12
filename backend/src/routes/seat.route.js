import express from "express";
import seatController from "../controllers/seat.controller.js";
import tokenMiddleware from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

// Protect all routes - require authentication
router.use(tokenMiddleware.auth);
router.use(authorizeRoles(["admin", "theater-manager"]));

// Get routes
router.get("/room/:roomId", seatController.getSeatsByRoom);
router.get("/:id", seatController.getSeatById);

// Create, Update, Delete routes (Admin only)
router.post("/", seatController.createSeat);
router.put("/:id", seatController.updateSeat);
router.delete("/:id", seatController.deleteSeat);

export default router;