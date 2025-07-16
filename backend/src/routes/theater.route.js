import express from "express";
import theaterController from "../controllers/theater.controller.js";
import theaterValidator from "../middlewares/validators/theater.middleware.js";
import requestHandler from "../handlers/request.handler.js";
import tokenMiddleware from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
    "/", 
    theaterController.getTheater
);

router.post(
    "/", 
    ...theaterValidator.createTheaterValidator,
    requestHandler.validate,
    tokenMiddleware.auth,
    authorizeRoles(["theater-manager"]),
    theaterController.createTheaterAndManager
);

router.put(
    "/update-theater/:theaterId", 
    ...theaterValidator.updateTheaterValidator,
    requestHandler.validate,
    tokenMiddleware.auth,
    authorizeRoles(["theater-manager"]),
    theaterController.updateTheater
);

router.delete(
    "/delete-theater/:theaterId", 
    ...theaterValidator.deleteTheaterValidator,
    requestHandler.validate,
    tokenMiddleware.auth,
    authorizeRoles(["theater-manager"]),
    theaterController.deleteTheater
);

export default router;
