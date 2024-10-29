import express from 'express';
import {
    addLeaveRequest,
    deleteLeaveRequestById,
    getAllLeaveRequests,
    getLeaveRequestById,
    updateLeaveRequestById
} from '../controllers/leaveController.js';

const router = express.Router();

// Get all leave requests
router.get('/', getAllLeaveRequests);

// Get a leave request by ID
router.get('/:id', getLeaveRequestById);

// Add a new leave request
router.post('/', addLeaveRequest);

// Update a leave request by ID
router.put('/:id', updateLeaveRequestById);

// Delete a leave request by ID
router.delete('/:id', deleteLeaveRequestById);

export default router;