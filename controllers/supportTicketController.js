// controllers/supportTicketController.js

import { ObjectId } from "mongodb";

// Get all support tickets
export const getAllSupportTickets = async (req, res) => {
  const ticketsCollection = req.app.locals.db.collection(
    "support-tickets-managements"
  );
  const cursor = ticketsCollection.find({});
  const ticketsList = await cursor.toArray();
  res.send({ status: true, data: ticketsList });
};

// Get a support ticket by ID
export const getSupportTicketById = async (req, res) => {
  const { id } = req.params;
  const ticketsCollection = req.app.locals.db.collection("support-tickets-managements");
  const ticket = await ticketsCollection.findOne({ _id: new ObjectId(id) });

  if (!ticket) {
    return res
      .status(404)
      .send({ status: false, message: "Support ticket not found" });
  }

  res.send({ status: true, data: ticket });
};

// Create a new support ticket
export const createSupportTicket = async (req, res) => {
  const newTicket = req.body;
  const ticketsCollection = req.app.locals.db.collection(
    "support-tickets-managements"
  );
  const result = await ticketsCollection.insertOne(newTicket);
  res.send({ status: true, data: result });
};

// Add a reply to a support ticket


export const replyToSupportTicket = async (req, res) => {
  const { parentId, reply, date, time, employeeEmail, employeeImg, employeeName } = req.body;

  console.log(req.body)

  const ticketsCollection = req.app.locals.db.collection("support-tickets-managements");
  const result = await ticketsCollection.updateOne(
    { _id: new ObjectId(parentId) },
    {
      $push: {
        replies: {
          reply,
          date,
          time,
          employeeEmail,
          employeeImg,
          employeeName,
        },
      },
    }
  );
  res.send({ status: true, data: result });
};

// Update the status of a support ticket by ID
export const updateSupportTicketStatus = async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  const ticketsCollection = req.app.locals.db.collection("support-tickets-managements");

  const filter = { _id: new ObjectId(id) };
  const updateTicket = {
    $set: { status },
  };

  try {
    const result = await ticketsCollection.updateOne(filter, updateTicket, {
      upsert: true,
    });

    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      return res
        .status(404)
        .send({ status: false, message: "Support ticket not found" });
    }

    res.send({ status: true, data: result });
  } catch (error) {
    console.error("Error updating support ticket status:", error);
    res.status(500).send({ status: false, message: "Internal Server Error" });
  }
};

// Delete a support ticket by ID
export const deleteSupportTicketById = async (req, res) => {
  const { id } = req.params;
  const ticketsCollection = req.app.locals.db.collection(
    "support-tickets-managements"
  );
  const query = { _id: new ObjectId(id) };
  const result = await ticketsCollection.deleteOne(query);
  res.send({ status: true, data: result });
};
