import express from "express";
import {
    addWorkStatus,
    deleteWorkStatus,
    getAllWorkStatuses,
    getWorkStatusById,
    updateWorkStatus
} from "../controllers/workStatusController.js";

const router = express.Router();

router.get("/", getAllWorkStatuses);
router.get("/:id", getWorkStatusById);
router.post("/", addWorkStatus);
router.put("/:id", updateWorkStatus);
router.delete("/:id", deleteWorkStatus);

// Define other work status routes here

export default router;