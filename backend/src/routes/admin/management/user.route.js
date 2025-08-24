// src/routes/admin/users.route.js
import express from "express";
import usersController from "../../../controllers/admin/users.controller.js";

const router = express.Router();

// Customers
router.get("/customers", usersController.getCustomers);
router.post("/customers", usersController.createCustomer);
router.put("/customers/:id", usersController.updateCustomer);
router.delete("/customers/:id", usersController.deleteCustomer);

// Managers
router.get("/managers", usersController.getManagers);
router.put("/managers/:id", usersController.updateManager);
router.delete("/managers/:id", usersController.deleteManager);

export default router;
