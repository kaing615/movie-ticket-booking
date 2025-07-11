import express from "express";
import theaterController from "../controllers/theater.controller.js";
import theatherValidator from "../middlewares/validators/theater.midđleware.js";
import requestHandler from "../handlers/request.handler.js";

const router = express.Router();

router.get("/", theaterController.getTheatersBySystem);
router.post(
	"/",
	theatherValidator.createTheaterValidator,
	requestHandler.validate,
	theaterController.createTheater
);
router.put(
	"/:theaterId",
	theatherValidator.updateTheaterValidator,
	requestHandler.validate,
	theaterController.updateTheater
);
router.delete(
	"/:theaterId",
	theatherValidator.deleteTheaterValidator,
	requestHandler.validate,
	theaterController.deleteTheater
);

export default router;
