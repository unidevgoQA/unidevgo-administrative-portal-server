import { ObjectId } from "mongodb";

// Function to handle file upload
export const uploadFileAndSaveMessage = async (req, res) => {
  try {
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
    const message = JSON.parse(req.body.message);

    const newMessage = {
      ...message,
      fileUrl, // Add the file URL to the message
    };

    const messagesCollection = req.app.locals.db.collection("chat-management");
    const result = await messagesCollection.insertOne(newMessage);
    const savedMessage = await messagesCollection.findOne({
      _id: result.insertedId,
    });

    res.json(savedMessage);
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

//Get Messages
export const getMessages = async (req, res) => {
  try {
    const { sender, recipient } = req.query;

    if (!sender || !recipient) {
      return res
        .status(400)
        .json({ error: "Sender and recipient are required" });
    }

    const messagesCollection = req.app.locals.db.collection("chat-management");

    const messages = await messagesCollection
      .find({
        $or: [
          { sender: new ObjectId(sender), recipient: new ObjectId(recipient) },
          { sender: new ObjectId(recipient), recipient: new ObjectId(sender) },
        ],
      })
      .sort({ timestamp: 1 }) // Sort by timestamp ascending
      .toArray();

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Failed to retrieve messages:", error);
    return res.status(500).json({ error: "Failed to retrieve messages" });
  }
};
