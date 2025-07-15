import express from "express";
import movieController from "../controllers/movie.controller.js";
import requestHandler from "../handlers/request.handler.js";
import tokenMiddleware from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

//public routes that don't requires auth
router.get("/", movieController.getMovies);

router.get("/:id", movieController.getMovieById);

router.use(tokenMiddleware.auth);
router.use(authorizeRoles(["admin", "theater-manager"]));
//everything below requires auth

router.post("/", requestHandler.validate, movieController.createMovie);

router.put("/:id", requestHandler.validate, movieController.updateMovie);

router.delete("/:id", requestHandler.validate, movieController.deleteMovie);

export default router;
