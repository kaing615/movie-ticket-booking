import express from "express";
import controller from "../controllers/theaterSystem.controller.js";
import requestHandler from "../handlers/request.handler.js";
import theaterSystemValidator from "../middlewares/validators/theaterSystem.middleware.js";
import tokenMiddleware from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
    "/",
    controller.getAllTheaterSystems
)

router.get(
    "/:id",
    controller.getTheaterSystemById
)

router.post(
    "/", 
    ...theaterSystemValidator.createTheaterSystemValidator,
    requestHandler.validate, 
    tokenMiddleware.auth,
    authorizeRoles(["admin"]),
    controller.createTheaterSystem
);

router.post("/add-theater", controller.addTheaterToSystem);

router.put(
    "/:id",
    ...theaterSystemValidator.updateTheaterSystem,
    requestHandler.validate,
    tokenMiddleware.auth,
    authorizeRoles(["admin"]),
    controller.updateTheaterSystem
);

router.delete(
    "/:id", 
    ...theaterSystemValidator.deleteTheaterSystem,
    requestHandler.validate,
    tokenMiddleware.auth,
    authorizeRoles(["admin"]),
    controller.deleteTheaterSystem
);

export default router;
