import express from "express";
import theaterController from "../controllers/theater.controller.js";


const router = express.Router();

router.post("/create-theater", theaterController.createTheater);
router.put("/update-theater/:theaterId", theaterController.updateTheater);
router.delete("/delete-theater/:theaterId", theaterController.deleteTheater);


export default router;
