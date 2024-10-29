import express from "express";
import {
    addLeaveEmail,
    deleteLeaveEmail,
    getAllLeaveEmailList,
} from "../controllers/leaveEmailListController.js";

const router = express.Router();

router.get("/", getAllLeaveEmailList);
router.post("/", addLeaveEmail);
router.delete("/:id", deleteLeaveEmail);

export default router;
