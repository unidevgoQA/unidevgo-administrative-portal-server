import express from "express";
import {
    appointmentPermission,
    createProfile,
    deleteProfile,
    getAllProfiles,
    getProfileByEmail,
    getProfileById,
    profileEditPermission,
    updateProfile
} from "../controllers/profileController.js";

const router = express.Router();


router.get("/", getAllProfiles);
router.get("/:id", getProfileById);
router.get("/register-user/:email", getProfileByEmail);
router.post("/", createProfile);
router.put("/:id", updateProfile);
router.put("/profile-edit/:id", profileEditPermission);
router.put("/appointment-permission/:id", appointmentPermission);
router.delete("/:id", deleteProfile);



export default router;