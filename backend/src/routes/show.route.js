import express from "express";
import showController from "../controllers/show.controller.js";
import tokenMiddleware from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/theater/:theaterId", showController.getShowsByTheater);

router.get("/movie/:movieId", showController.getShowsByMovie);
router.get("/theater/:theaterId/movies", showController.getMoviesOfTheater);

router.use(tokenMiddleware.auth);
router.use(authorizeRoles(["theater-manager"]));

router.post("/", showController.addShow);

router.put("/:showId", showController.updateShow);

router.delete("/:showId/movie", showController.deleteMovieFromTheater);

export default router;
