// server/socket.js
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import { Server as SocketIOServer } from "socket.io";
dotenv.config();

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@clusterunidevgo.2nk4dzo.mongodb.net/?retryWrites=true`;

const client = new MongoClient(uri);
let db;

const setupSocket = async (server) => {
  try {
    await client.connect();
    db = client.db("unidevgo-portal");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    return;
  }

  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const updateUserStatus = () => {
    const onlineUsers = Array.from(userSocketMap.keys());
    io.emit("onlineUsers", onlineUsers);
  };

  const disconnect = (socket) => {
    console.log(`Client Disconnected: ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        io.emit("userStatus", { userId, status: "offline" });
        updateUserStatus();
        break;
      }
    }
  };

  io.on("connection", (socket) => {
    const { userId, userName } = socket.handshake.query;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(
        `${userName} connected: ${userId} with socket ID: ${socket.id}`
      );
      io.emit("userStatus", { userId, status: "online" });
      updateUserStatus(); // Emit updated list of online users
    } else {
      console.log("User ID not provided during connection.");
    }

    // Handle sending and receiving messages
    socket.on("sendMessage", async (message) => {
      try {
        const messagesCollection = db.collection("chat-management");

        const newMessage = {
          sender: new ObjectId(message.sender),
          senderName: message.senderName,
          recipient: message.recipient ? new ObjectId(message.recipient) : null,
          messageType: message.messageType,
          content: message.content || null,
          fileUrl: message.fileUrl || null,
          timestamp: new Date(),
        };

        await messagesCollection.insertOne(newMessage);

        const updatedMessages = await messagesCollection
          .find({
            $or: [
              {
                sender: new ObjectId(message.sender),
                recipient: new ObjectId(message.recipient),
              },
              {
                sender: new ObjectId(message.recipient),
                recipient: new ObjectId(message.sender),
              },
            ],
          })
          .sort({ timestamp: 1 })
          .toArray();

        const recipientSocketId = userSocketMap.get(message.recipient);
        const senderSocketId = userSocketMap.get(message.sender);

        if (recipientSocketId) {
          console.log("recipientSocketId", recipientSocketId);
          io.to(recipientSocketId).emit("receiveMessage", updatedMessages);
        }

        if (senderSocketId) {
          console.log("senderSocketId", senderSocketId);
          io.to(senderSocketId).emit("receiveMessage", updatedMessages);
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    // Call a user
    socket.on("callUser", ({ from }) => {
      io.emit("caller", { from });
    });

    // Answer the call
    socket.on("answerCall", ({ to, signal }) => {
      io.to(to).emit("callAccepted", signal);
    });

    // End the call
    socket.on("endCall", ({ userId }) => {
      io.emit("callEnded", { userId });
    });

    // Emit the current list of online users to the newly connected client
    socket.emit("onlineUsers", Array.from(userSocketMap.keys()));

    socket.on("disconnect", () => disconnect(socket));
  });
};

export default setupSocket;
