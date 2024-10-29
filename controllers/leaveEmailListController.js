import { ObjectId } from "mongodb";

//Get all leave email list
export const getAllLeaveEmailList = async (req, res) => {
  const leaveEmailListCollection = req.app.locals.db.collection(
    "leave-email-list-management"
  );
  const cursor = leaveEmailListCollection.find({});
  const allEmailList = await cursor.toArray();
  res.send({ status: true, data: allEmailList });
};

//Add leave email
export const addLeaveEmail = async (req, res) => {
  const leaveEmailListCollection = req.app.locals.db.collection(
    "leave-email-list-management"
  );
  const email = req.body;
  console.log(email)
  const result = await leaveEmailListCollection.insertOne(email);
  res.send({ status: true, data: result });
};

//Delete leave email
export const deleteLeaveEmail = async (req, res) => {
  const { id } = req.params;
  const leaveEmailListCollection = req.app.locals.db.collection(
    "leave-email-list-management"
  );
  const result = await leaveEmailListCollection.deleteOne({
    _id: new ObjectId(id),
  });
  if (result.deletedCount > 0) {
    res.send({ status: true, message: "Email remove successfully" });
  } else {
    res.status(404).send({ status: false, message: "Email not found" });
  }
};
