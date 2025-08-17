import express from "express";
import showController from "../controllers/show.controller.js";
import tokenMiddleware from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

// Public GETs
router.get("/theater/:theaterId", showController.getShowsByTheater);
router.get("/movie/:movieId",   showController.getShowsByMovie);
router.get("/theater/:theaterId/movies", showController.getMoviesOfTheater);
router.get("/:showId/seats",    showController.getSeatsOfShow);

// Hold seats (cần đăng nhập)
router.use(tokenMiddleware.auth);
router.post("/:showId/hold",            showController.holdSeats);
router.put("/:showId/hold/refresh",     showController.refreshHold);
router.delete("/:showId/hold",          showController.releaseHold);

// Quản trị suất chiếu
router.use(authorizeRoles(["theater-manager"]));
router.post("/",                 showController.addShow);
router.put("/:showId",           showController.updateShow);
router.delete("/:showId/movie",  showController.deleteMovieFromTheater);

export default router;
