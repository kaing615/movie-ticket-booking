import express from "express";
import  theaterManager from "../controllers/theater-manager.controller.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/add-movie", theaterManager.addMovie)
router.put("/update-movie/:movieId", theaterManager.updateMovie)
router.delete("/delete-movie/:movieId", theaterManager.deleteMovie)

export default router;
