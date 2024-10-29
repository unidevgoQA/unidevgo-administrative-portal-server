import { ObjectId } from "mongodb";

// Get all work statuses
export const getAllWorkStatuses = async (req, res) => {
  const workStatusCollection = req.app.locals.db.collection(
    "work-status-management"
  );
  const cursor = workStatusCollection.find({});
  const workStatuses = await cursor.toArray();
  res.send({ status: true, data: workStatuses });
};

export const getWorkStatusById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the ID is valid
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid work status ID" });
    }

    const workStatusCollection = req.app.locals.db.collection(
      "work-status-management"
    );

    // Convert the id to an ObjectId and find the work status
    const workStatus = await workStatusCollection.findOne({ _id: id });

    // Check if work status was found
    if (workStatus) {
      return res.send({ status: true, data: workStatus });
    } else {
      return res
        .status(404)
        .send({ status: false, message: "Work status not found" });
    }
  } catch (error) {
    console.error("Error fetching work status:", error);
    return res.status(500).send({ status: false, message: "Server error" });
  }
};

// Add a work status
export const addWorkStatus = async (req, res) => {
  const workStatusCollection = req.app.locals.db.collection(
    "work-status-management"
  );
  const newWorkStatus = req.body;
  const result = await workStatusCollection.insertOne(newWorkStatus);
  res.send({ status: true, data: result });
};

export const updateWorkStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedWorkStatus = req.body;

    // Validate the ID
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid work status ID" });
    }

    const workStatusCollection = req.app.locals.db.collection(
      "work-status-management"
    );

    // Prepare the filter and update data
    const filter = { _id: id };
    const options = { upsert: false };
    const updateTask = {
      $set: {
        task: updatedWorkStatus.task,
        date: updatedWorkStatus.date,
        hour: updatedWorkStatus.hour,
        workStatus: updatedWorkStatus.workStatus,
        description: updatedWorkStatus.description,
      },
    };

    // Update the document in the collection
    const result = await workStatusCollection.updateOne(
      filter,
      updateTask,
      options
    );

    // Check if any document was modified
    if (result.matchedCount === 0) {
      return res
        .status(404)
        .send({ status: false, message: "Work status not found" });
    }

    res.send({ status: true, data: result });
  } catch (error) {
    console.error("Error updating work status:", error);
    res.status(500).send({ status: false, message: "Server error" });
  }
};

// Delete a work status by ID
export const deleteWorkStatus = async (req, res) => {
  const { id } = req.params;
  const workStatusCollection = req.app.locals.db.collection(
    "work-status-management"
  );
  const result = await workStatusCollection.deleteOne({
    _id: new ObjectId(id),
  });
  if (result.deletedCount > 0) {
    res.send({ status: true, message: "Work status deleted successfully" });
  } else {
    res.status(404).send({ status: false, message: "Work status not found" });
  }
};
