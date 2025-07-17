import express from "express";
import movieValidator from "../middlewares/validators/movie.middleware.js";
import movieController from "../controllers/movie.controller.js";
import requestHandler from "../handlers/request.handler.js";
import tokenMiddleware from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", movieController.getMovies);

router.get(
	"/:id",
	movieValidator.movieIdValidator,
	requestHandler.validate,
	movieController.getMovieById
);

router.use(tokenMiddleware.auth);
router.use(authorizeRoles(["admin"]));

router.post(
	"/",
	movieValidator.createMovieValidation,
	requestHandler.validate,
	movieController.createMovie
);

router.put(
	"/:id",
	movieValidator.updateMovieValidation,
	requestHandler.validate,
	movieController.updateMovie
);

router.delete(
	"/:id",
	movieValidator.movieIdValidator,
	requestHandler.validate,
	movieController.deleteMovie
);

export default router;
