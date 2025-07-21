import express from "express";
import roomController from "../controllers/room.controller.js";
import requestHandler from "../handlers/request.handler.js";
import tokenMiddleware from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
    "/",
    roomController.getRoomByTheater,
);

router.use(tokenMiddleware.auth);
router.use(authorizeRoles(["theater-manager"]));

router.post(
    "/create", 
    requestHandler.validate,
    roomController.createRoom);

router.put(
    "/:roomId", 
    requestHandler.validate,
    roomController.updateRoom
);

router.delete(
    "/:roomId",
    requestHandler.validate, 
    roomController.deleteRoom
);

export default router;
