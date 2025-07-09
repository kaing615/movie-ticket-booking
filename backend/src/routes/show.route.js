import express from "express";
import showController from "../controllers/show.controller.js";

const router = express.Router();

router.post("/create",  showController.addShow);
router.put("/:showId", showController.updateShow);
router.delete("/:showId",  showController.deleteShow);
router.get("/theater/:theaterId", showController.getShowsByTheater);

export default router;
