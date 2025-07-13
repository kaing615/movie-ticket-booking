import express from "express";
import showController from "../controllers/show.controller.js";
import tokenMiddleware from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  tokenMiddleware.auth,
  authorizeRoles(["theater-manager"]),
  showController.addShow
);

router.put(
  "/:showId",
  tokenMiddleware.auth,
  authorizeRoles(["theater-manager"]),
  showController.updateShow
);

router.delete(
  "/:showId",
  tokenMiddleware.auth,
  authorizeRoles(["theater-manager"]),
  showController.deleteShow
);

router.get("/theater/:theaterId", showController.getShowsByTheater);

router.get("/movie/:movieId", showController.getShowsByMovie);

export default router;
