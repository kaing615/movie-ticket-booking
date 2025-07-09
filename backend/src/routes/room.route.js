import express from "express";
import roomController from "../controllers/room.controller.js";

const router = express.Router();

router.post("/create", roomController.createRoom);
router.put("/:roomId", roomController.updateRoom);
router.delete("/:roomId", roomController.deleteRoom);


export default router;
