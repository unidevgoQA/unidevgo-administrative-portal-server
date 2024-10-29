
import express from "express";

import {
    createSupportTicket,
    deleteSupportTicketById,
    getAllSupportTickets,
    getSupportTicketById,
    replyToSupportTicket,
    updateSupportTicketStatus
} from "../controllers/supportTicketController.js";

const router = express.Router();

// Get all support tickets
router.get("/", getAllSupportTickets);

// Get a support ticket by ID
router.get("/:id", getSupportTicketById);

// Create a new support ticket
router.post("/", createSupportTicket);

// Add a reply to a support ticket by ID (update support ticket)
router.post("/reply/:id",replyToSupportTicket );

// update support ticket by ID (update support ticket)
router.put("/:id", updateSupportTicketStatus);

// Delete a support ticket by ID
router.delete("/:id", deleteSupportTicketById);

export default router;
