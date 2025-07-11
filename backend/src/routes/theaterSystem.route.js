import express from "express";
import controller from "../controllers/theaterSystem.controller.js";
import requestHandler from "../handlers/request.handler.js";
import theaterSystemValidator from "../middlewares/validators/theaterSystem.middleware.js";

const router = express.Router();

router.post(
	"/",
	theaterSystemValidator.createTheaterSystemValidator,
	requestHandler.validate,
	controller.createTheaterSystem
);
router.put(
	"/:systemId",
	theaterSystemValidator.updateTheaterSystem,
	requestHandler.validate,
	controller.updateTheaterSystem
);
router.delete(
	"/:systemId",
	theaterSystemValidator.deleteTheaterSystem,
	requestHandler.validate,
	controller.deleteTheaterSystem
);

export default router;
