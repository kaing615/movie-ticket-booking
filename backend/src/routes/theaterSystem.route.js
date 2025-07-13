import express from "express";
import controller from "../controllers/theaterSystem.controller.js";

const router = express.Router();

router.post("/", controller.createTheaterSystem);
router.post("/add-theater", controller.addTheaterToSystem);
router.get("/", controller.getAllTheaterSystems);
router.get("/:systemId", controller.getTheaterSystemById);
router.put("/:systemId", controller.updateTheaterSystem);
router.delete("/:systemId", controller.deleteTheaterSystem);

export default router;
