// src/routes/theater.route.js
import express from "express";
import theaterController from "../controllers/theater.controller.js";
import theaterValidator from "../middlewares/validators/theater.middleware.js";
import requestHandler from "../handlers/request.handler.js";
import tokenMiddleware from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", theaterController.getTheater);
router.get(
  "/manager/:managerId",
  requestHandler.validate,
  theaterController.getTheaterByManagerId
);
router.get("/:id", theaterController.getTheaterById);

router.use(tokenMiddleware.auth);

router.use(authorizeRoles(["admin", "theater-manager"]));
router.put(
  "/:theaterId",
  theaterValidator.updateTheaterValidator,
  requestHandler.validate,
  theaterController.updateTheater
);

router.use(authorizeRoles(["admin"]));
router.post(
  "/",
  theaterValidator.createTheaterValidator,
  requestHandler.validate,
  theaterController.createTheater
);
router.post(
  "/create-theater-and-manager",
  theaterValidator.createTheaterWithManagerValidator,
  requestHandler.validate,
  theaterController.createTheaterAndManager
);
router.delete(
  "/:theaterId",
  theaterValidator.deleteTheaterValidator,
  requestHandler.validate,
  theaterController.deleteTheater
);

export default router;
