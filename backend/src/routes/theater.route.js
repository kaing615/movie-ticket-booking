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
    requestHandler.validateRequest(theaterValidator.createTheaterValidator),
    tokenMiddleware.auth(),
    authorizeRoles(["theater-manager"]),
    theaterController.createTheaterAndManager
);

router.put(
    "/update-theater/:theaterId", 
    requestHandler.validateRequest(theaterValidator.updateTheaterValidator),
    tokenMiddleware.auth(),
    authorizeRoles(["theater-manager"]),
    theaterController.updateTheater
);

router.delete(
    "/delete-theater/:theaterId", 
    requestHandler.validateRequest(theaterValidator.deleteTheaterValidator),
    tokenMiddleware.auth(),
    authorizeRoles(["theater-manager"]),
    theaterController.deleteTheater
);

export default router;
