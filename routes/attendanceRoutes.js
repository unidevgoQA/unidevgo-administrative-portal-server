import express from "express";
import {
    addAttendance,
    deleteAttendanceById,
    getAllAttendanceRecords,
    getAttendanceByEmail,
    getAttendanceById,
} from "../controllers/attendanceController.js";

const router = express.Router();

// Get all attendance records
router.get("/", getAllAttendanceRecords);

// Get an attendance record by ID
router.get("/:id", getAttendanceById);
// Route to get attendance by email
router.get("/:email", getAttendanceByEmail);

// Add a new attendance record
router.post("/", addAttendance);

// Delete an attendance record by ID
router.delete("/:id", deleteAttendanceById);

export default router;
