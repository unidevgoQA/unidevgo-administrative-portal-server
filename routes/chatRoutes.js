import express from "express";
import {
    getMessages
} from "../controllers/chatController.js";

const router = express.Router();

//Get chats
router.get("/messages", getMessages);


export default router;
