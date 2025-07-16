import express from "express";
import movieController from "../controllers/movie.controller.js"
import requestHandler from "../handlers/request.handler.js";
import tokenMiddleware from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", movieController.getMovies);

router.get("/:id", movieController.getMovieById);

router.post(
  "/",
  tokenMiddleware.auth,
  authorizeRoles(["admin", "theater-manager"]),
  requestHandler.validate,
  movieController.createMovie
);

router.put(
  "/:id",
  tokenMiddleware.auth,
  authorizeRoles(["admin", "theater-manager"]),
  requestHandler.validate,
  movieController.updateMovie
);

router.delete(
  "/:id",
  tokenMiddleware.auth,
  authorizeRoles(["admin", "theater-manager"]),
  requestHandler.validate,
  movieController.deleteMovie
);

export default router;
