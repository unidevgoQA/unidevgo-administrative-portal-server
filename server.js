const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();

const cors = require("cors");
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@clusterunidevgo.2nk4dzo.mongodb.net/?retryWrites=true&w=majority"`;

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
    app.get("/leave-management", async (req, res) => {
      const cursor = leaveManagementCollection.find({});
      const allLeaves = await cursor.toArray();
      res.send({ status: true, data: allLeaves });
    });

    //Add Profile
    app.post("/profile", async (req, res) => {
      const profile = req.body;
      console.log(profile);
      const result = await profileCollection.insertOne(profile, {
        writeConcern: { w: 0 },
      });
      res.send({ status: true, data: result });
    });
    //Add work status
    app.post("/work-status", async (req, res) => {
      const singleWorkStatus = req.body;
      console.log(singleWorkStatus);
      const result = await workStatusCollection.insertOne(singleWorkStatus, {
        writeConcern: { w: 0 },
      });
      res.send({ status: true, data: result });
    });
    //Add leave management
    app.post("/leave-management", async (req, res) => {
      const leaveApply = req.body;
      console.log(leaveApply);
      const result = await leaveManagementCollection.insertOne(leaveApply, {
        writeConcern: { w: 0 },
      });
      res.send({ status: true, data: result });
    });
    //Get profile by email
    app.get("/profile/:email", async (req, res) => {
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
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await workStatusCollection.deleteOne(query, {
        writeConcern: { w: 0 },
      });
      res.json({ status: true, data: result });
    });
    //Delete single item from leave-management Api
    app.delete("/leave-management/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await leaveManagementCollection.deleteOne(query, {
        writeConcern: { w: 0 },
      });
      res.json({ status: true, data: result });
    });
    //Delete single item from profile Api
    app.delete("/profile/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await profileCollection.deleteOne(query, {
        writeConcern: { w: 0 },
      });
      res.json({ status: true, data: result });
    });
    //Update Work Status
    app.put("/work-status/:id", async (req, res) => {
      const id = req.params.id;
      const updatedTaskStatus = req.body;

      console.log(id, updatedTaskStatus);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateTask = {
        $set: {
          workStatus:updatedTaskStatus.workStatus,      
        },
      };
      const result = await workStatusCollection.updateOne(
        filter,
        updateTask,
        options,{
          writeConcern: { w:0}
        }
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
