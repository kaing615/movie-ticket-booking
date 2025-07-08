import express from "express";
import theaterController from "../controllers/theater.controller.js";
import requestHandler from "../handlers/request.handler.js";

const router = express.Router();

router.post("/", requestHandler.validate, theaterController.createTheater);

export default router;
