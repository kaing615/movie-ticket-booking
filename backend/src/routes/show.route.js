import express from "express";
import showController from "../controllers/show.controller.js";
import tokenMiddleware from "../middlewares/token.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(tokenMiddleware.auth);
router.use(authorizeRoles(["theater-manager"]));
//everything below this requires auth

router.post("/", showController.addShow);

router.put("/:showId", showController.updateShow);

router.delete("/:showId", showController.deleteShow);

router.get("/theater/:theaterId", showController.getShowsByTheater);

router.get("/movie/:movieId", showController.getShowsByMovie);

export default router;
