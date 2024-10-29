import express from "express";
import {
    addEvent,
    deleteEvent,
    getAllEvents,
} from "../controllers/eventController.js";

const router = express.Router();

// Get all events
router.get("/", getAllEvents);

// Add a new event
router.post("/", addEvent);

// Delete a event
router.delete("/:id", deleteEvent);

export default router;
