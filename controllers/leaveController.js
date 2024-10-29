import { ObjectId } from "mongodb";

// Get all leave requests
export const getAllLeaveRequests = async (req, res) => {
  const leaveCollection = req.app.locals.db.collection("leave-management");
  const cursor = leaveCollection.find({});
  const leaveRequests = await cursor.toArray();
  res.send({ status: true, data: leaveRequests });
};

// Get a leave request by ID
export const getLeaveRequestById = async (req, res) => {
  const { id } = req.params;
  const leaveCollection = req.app.locals.db.collection("leave-management");
  const leaveRequest = await leaveCollection.findOne({ _id: new ObjectId(id) });

  if (!leaveRequest) {
    return res
      .status(404)
      .send({ status: false, message: "Leave request not found" });
  }

  res.send({ status: true, data: leaveRequest });
};

// Add a new leave request
export const addLeaveRequest = async (req, res) => {
  const leaveRequest = req.body;
  const leaveCollection = req.app.locals.db.collection("leave-management");
  const result = await leaveCollection.insertOne(leaveRequest);
  res.send({ status: true, data: result });
};

// Update a leave request by ID
export const updateLeaveRequestById = async (req, res) => {
  const id = req.params.id;
  const updatedLeaveStatus = req.body;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updateLeave = {
    $set: {
      status: updatedLeaveStatus?.leave?.leaveStatus,
    },
  };
  const leaveCollection = req.app.locals.db.collection("leave-management");
  const result = await leaveCollection.updateOne(filter, updateLeave, options);
  res.send({ status: true, data: result });
};

// Delete a leave request by ID
export const deleteLeaveRequestById = async (req, res) => {
  const { id } = req.params;
  const leaveCollection = req.app.locals.db.collection("leave-management");
  const query = { _id: new ObjectId(id) };
  const result = await leaveCollection.deleteOne(query);
  res.send({ status: true, data: result });
};
