const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();

const cors = require("cors");
const port = process.env.PORT || 5000;

//Middleware
app.use(cors({
  credentials : true
}));

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@clusterunidevgo.2nk4dzo.mongodb.net/?retryWrites=true`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    await client.connect();
    console.log("db connected");
    const database = client.db("unidevgo-administrative-portal");
    const profileCollection = database.collection("profile");
    const workStatusCollection = database.collection("work-status");
    const leaveManagementCollection = database.collection("leave-management");
    const eventManagementCollection = database.collection("event-management");
    const attendenceManagementCollection = database.collection("attendence-management");

    //Get All Profile
    app.get("/profile", async (req, res) => {
      const cursor = profileCollection.find({});
      const profiles = await cursor.toArray();
      res.send({ status: true, data: profiles });
    });
    //Get All work status
    app.get("/work-status", async (req, res) => {
      const cursor = workStatusCollection.find({});
      const workStatus = await cursor.toArray();
      res.send({ status: true, data: workStatus });
    });
    //Get All work status
    app.get("/calender-events", async (req, res) => {
      const cursor = eventManagementCollection.find({});
      const AllEvents = await cursor.toArray();
      res.send({ status: true, data: AllEvents });
    });
    //Get All attendence 
    app.get("/attendence", async (req, res) => {
      const cursor = attendenceManagementCollection.find({});
      const AllAttendence = await cursor.toArray();
      res.send({ status: true, data: AllAttendence });
    });
    //Get All work status
    app.get("/leave-management", async (req, res) => {
      const cursor = leaveManagementCollection.find({});
      const allLeaves = await cursor.toArray();
      res.send({ status: true, data: allLeaves });
    });
    //Get single profile
    app.get("/profile/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await profileCollection.findOne(query);
      res.send({ status: true, data: result });
    });
    //Add Profile
    app.post("/profile", async (req, res) => {
      const profile = req.body;
      const result = await profileCollection.insertOne(profile);
      res.send({ status: true, data: result });
    });
    //Add work status
    app.post("/work-status", async (req, res) => {
      const singleWorkStatus = req.body;
      const result = await workStatusCollection.insertOne(singleWorkStatus);
      res.send({ status: true, data: result });
    });
    //Add Event
    app.post("/calender-events", async (req, res) => {
      const singleEvent = req.body;
      console.log('Event' , singleEvent)
      const result = await eventManagementCollection.insertOne(singleEvent);
      res.send({ status: true, data: result });
    });
    //Add Attendence
    app.post("/attendence", async (req, res) => {
      const singleAttendence = req.body;
      console.log('Event' , singleAttendence)
      const result = await attendenceManagementCollection.insertOne(singleAttendence);
      res.send({ status: true, data: result });
    });
    //Add leave management
    app.post("/leave-management", async (req, res) => {
      const leaveApply = req.body;
      const result = await leaveManagementCollection.insertOne(leaveApply);
      res.send({ status: true, data: result });
    });
    //Get profile by email
    app.get("/register-user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await profileCollection.findOne({ email });
      if (result?.email) {
        return res.send({ status: true, data: result });
      }
      res.send({ status: false });
    });
    //Delete single item from work status Api
    app.delete("/work-status/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await workStatusCollection.deleteOne(query);
      res.json({ status: true, data: result });
    });
    //Delete single item from calender-events Api
    app.delete("/calender-events/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await eventManagementCollection.deleteOne(query);
      res.json({ status: true, data: result });
    });
    //Delete single item from leave-management Api
    app.delete("/leave-management/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await leaveManagementCollection.deleteOne(query);
      res.json({ status: true, data: result });
    });
    //Delete single item from profile Api
    app.delete("/profile/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await profileCollection.deleteOne(query);
      res.json({ status: true, data: result });
    });
    //Update Work Status
    app.put("/work-status/:id", async (req, res) => {
      const id = req.params.id;
      const updatedTaskStatus = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateTask = {
        $set: {
          workStatus: updatedTaskStatus.workStatus,
        },
      };
      const result = await workStatusCollection.updateOne(
        filter,
        updateTask,
        options
      );
      res.send({ status: true, data: result });
    });
    //Update leave Status
    app.put("/leave-management/:id", async (req, res) => {
      const id = req.params.id;
      const updatedLeaveStatus = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateLeave = {
        $set: {
          status: updatedLeaveStatus.leaveStatus,
        },
      };
      const result = await leaveManagementCollection.updateOne(
        filter,
        updateLeave,
        options
      );
      res.send({ status: true, data: result });
    });
    //Update profile
    app.put("/profile/:id", async (req, res) => {
      const id = req.params.id;
      const profile = req.body.updateProfile;

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updateProfile = {
        $set: {
          ...profile,
        },
      };
      // Remove _id from the update, as it is immutable
      delete updateProfile.$set._id;

      const result = await profileCollection.updateOne(
        filter,
        updateProfile,
        options
      );
      res.send({ status: true, data: result });
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("UnidevGO Server Running");
});

app.listen(port, () => {
  console.log("UnidevGO Server Running", port);
});
