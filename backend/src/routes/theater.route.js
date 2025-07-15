import express from "express";
import theaterController from "../controllers/theater.controller.js";
import theaterValidator from "../middlewares/validators/theater.middleware.js";
import requestHandler from "../handlers/request.handler.js";
import tokenMiddleware from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

//public routes that don't requires auth
router.get("/", theaterController.getTheater);

router.use(tokenMiddleware.auth);
router.use(authorizeRoles(["theater-manager"]));
//everything below requires auth

router.post(
	"/",
	theaterValidator.createTheaterValidator,
	requestHandler.validate,
	theaterController.createTheaterAndManager
);

router.put(
	"/update-theater/:theaterId",
	theaterValidator.updateTheaterValidator,
	requestHandler.validate,
	theaterController.updateTheater
);

router.delete(
	"/delete-theater/:theaterId",
	theaterValidator.deleteTheaterValidator,
	requestHandler.validate,
	theaterController.deleteTheater
);

export default router;
