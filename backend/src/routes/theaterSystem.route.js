import express from "express";
import controller from "../controllers/theaterSystem.controller.js";

const router = express.Router();

router.post("/", controller.createTheaterSystem);
router.put("/:systemId", controller.updateTheaterSystem);
router.delete("/:systemId", controller.deleteTheaterSystem);

export default router;
