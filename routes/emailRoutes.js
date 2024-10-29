import express from "express";
import {
    appointmentConfirmationEmail,
    sendEmail,
    sendLeaveEmail,
    uploadAttachments,
} from "../controllers/emailController.js";

const router = express.Router();

//Send Email
router.post("/", uploadAttachments, sendEmail);
//Send Leave Email
router.post("/leave-email", sendLeaveEmail);
//Send Appointment Confirmation Email
router.post("/appointment-confirmation-email", appointmentConfirmationEmail);

export default router;
