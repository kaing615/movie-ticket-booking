import express from "express";
import controller from "../controllers/theaterSystem.controller.js";
import requestHandler from "../handlers/request.handler.js";
import theaterSystemValidator from "../middlewares/validators/theaterSystem.middleware.js";
import tokenMiddleware from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

//public routes that don't requires auth
router.get("/", controller.getAllTheaterSystems);
router.get("/:systemId", controller.getTheaterSystemById);

router.use(tokenMiddleware.auth);
router.use(authorizeRoles(["admin"]));
//everything below requires auth

router.post(
	"/",
	theaterSystemValidator.createTheaterSystemValidator,
	requestHandler.validate,
	controller.createTheaterSystem
);

router.post("/add-theater", controller.addTheaterToSystem);

router.put("/:systemId", controller.updateTheaterSystem);

router.delete("/:systemId", controller.deleteTheaterSystem);

export default router;
