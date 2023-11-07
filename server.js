const express = require("express");
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
require("dotenv").config();
const cors = require("cors");

const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());




const uri =`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@clusterunidevgo.2nk4dzo.mongodb.net/?retryWrites=true&w=majority"`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const run = async () => {
    try {
      await client.connect();
      console.log("db connected");
      const database = client.db("unidevgo-administrative-portal");
      const profileCollection = database.collection("profile");

      app.get("/profile", async (req, res) => {
        const cursor = profileCollection.find({});
        const profiles = await cursor.toArray();
        res.send({ status: true, data: profiles });
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