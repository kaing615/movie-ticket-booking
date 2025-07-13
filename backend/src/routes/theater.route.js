import express from "express";
import theaterController from "../controllers/theater.controller.js";
import theatherValidator from "../middlewares/validators/theater.midđleware.js";
import requestHandler from "../handlers/request.handler.js";

const router = express.Router();

router.get("/", theaterController.getTheatersBySystem);
router.post("/", theaterController.createTheaterAndManager);
router.put("/update-theater/:theaterId", theaterController.updateTheater);
router.delete("/delete-theater/:theaterId", theaterController.deleteTheater);

export default router;
