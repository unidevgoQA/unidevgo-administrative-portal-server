import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer"; // Add this import for handling file uploads
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import attendanceRoutes from "./routes/attendanceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import leaveEmailListRoutes from "./routes/leaveEmailListRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import supportTicketRoutes from "./routes/supportTicketRoutes.js";
import workStatusRoutes from "./routes/workStatusRoutes.js";
// Import the chatController functions

import { uploadFileAndSaveMessage } from "./controllers/chatController.js";
import setupSocket from "./socket.js";
import client from "./utils/db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Set destination folder for uploads
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Middlewares

app.use(
  cors({
    origin: process.env.ORIGIN || "*", 
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(express.json());

// DB Connection
client
  .connect()
  .then(() => {
    console.log("Database Connected");
    app.locals.db = client.db("unidevgo-portal");
    const server = app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
    setupSocket(server);
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });

// Routes
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/send-email", emailRoutes);
app.use("/email-list", leaveEmailListRoutes);
app.use("/work-status", workStatusRoutes);
app.use("/leave-management", leaveRoutes);
app.use("/attendence", attendanceRoutes);
app.use("/support-tickets", supportTicketRoutes);
app.use("/calender-events", eventRoutes);
app.use("/chat", chatRoutes);

// File upload endpoint using the controller function
app.post("/chat/upload", upload.single("file"), uploadFileAndSaveMessage);

// Serve static files (for file URLs)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("UnidevGO Portal Server Running");
});
