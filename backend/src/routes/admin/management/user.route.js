import express from "express";
import userController from "../../../controllers/admin/users.controller.js";

const router = express.Router();

router.get("/managers", userController.getManagers);

export default router;
