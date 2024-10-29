import { ObjectId } from "mongodb";

//Get All calender events
export const getAllEvents = async (req, res) => {
  const eventManagementCollection =
    req.app.locals.db.collection("event-management");
  const cursor = eventManagementCollection.find({});
  const AllEvents = await cursor.toArray();
  res.send({ status: true, data: AllEvents });
};

//Add Event
export const addEvent = async (req, res) => {
  const event = req.body;
  const eventManagementCollection =
    req.app.locals.db.collection("event-management");
  const result = await eventManagementCollection.insertOne(event);
  res.send({ status: true, data: result });
};

//Delete event
export const deleteEvent = async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const eventManagementCollection =
    req.app.locals.db.collection("event-management");
  const result = await eventManagementCollection.deleteOne(query);
  res.json({ status: true, data: result });
};
