import express from "express";
import {
    loginProfile,
    registerProfile,
    updatePassword
} from "../controllers/authController.js";

const router = express.Router();

//Register route
router.post("/register", registerProfile);
//Login route
router.post("/login", loginProfile);
//update  password route
router.post("/update-password", updatePassword);

export default router;
