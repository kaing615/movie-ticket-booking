import express from "express";
import controller from "../controllers/theaterSystem.controller.js";
import requestHandler from "../handlers/request.handler.js";
import theaterSystemValidator from "../middlewares/validators/theaterSystem.middleware.js";
import tokenMiddleware from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
    "/", 
    ...theaterSystemValidator.createTheaterSystemValidator,
    requestHandler.validate, 
    tokenMiddleware.auth,
    authorizeRoles(["admin"]),
    controller.createTheaterSystem
);

router.post(
    "/add-theater",
    tokenMiddleware.auth,
    authorizeRoles(["admin"]),
    controller.addTheaterToSystem
);

router.get(
    "/", 
    controller.getAllTheaterSystems
);
router.get(
    "/:systemId", 
    controller.getTheaterSystemById
);

router.put(
    "/:systemId",
    ...theaterSystemValidator.updateTheaterSystem,
    requestHandler.validate,
    tokenMiddleware.auth,
    authorizeRoles(["admin"]),
    controller.updateTheaterSystem
);

router.delete(
    "/:systemId", 
    ...theaterSystemValidator.deleteTheaterSystem,
    requestHandler.validate,
    tokenMiddleware.auth,
    authorizeRoles(["admin"]),
    controller.deleteTheaterSystem
);

export default router;
