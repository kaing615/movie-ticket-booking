import express from "express";
import seatController from "../controllers/seat.controller.js";
import tokenMiddleware from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/room/:roomId", seatController.getSeatsByRoom);
router.get("/:id", seatController.getSeatById);

// Protect all routes - require authentication
router.use(tokenMiddleware.auth);
router.use(authorizeRoles(["admin", "theater-manager"]));

// Protected writes
router.use(tokenMiddleware.auth);
router.use(authorizeRoles(["admin", "theater-manager"]));
router.post("/", seatController.createSeat);
router.put("/:id", seatController.updateSeat);
router.delete("/:id", seatController.deleteSeat);

export default router;