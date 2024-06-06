const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
var cors = require("cors");

require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-fpqkjij-shard-00-00.xbk29ye.mongodb.net:27017,ac-fpqkjij-shard-00-01.xbk29ye.mongodb.net:27017,ac-fpqkjij-shard-00-02.xbk29ye.mongodb.net:27017/cleaner-DB?ssl=true&replicaSet=atlas-qjfq6h-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    const database = client.db("cleaner-DB");
    const serviceCollection = database.collection("services");
    const appoinmentCollection = database.collection("appoinments");
    const orderCollection = database.collection("orders");

    //load all data
    app.get("/services", async (req, res) => {
      try {
        const searchTerm = req.query.searchTerm;
        if (searchTerm) {
          const searchRegex = new RegExp(searchTerm, "i");
          const cursor = serviceCollection.find({ tag: searchRegex });
          const services = await cursor.toArray();
          res.json(services);
        } else {
          const cursor = serviceCollection.find({});
          const allServices = await cursor.toArray();
          res.json(allServices);
        }
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Failed to fetch services" });
      }
    });

    // create services
    app.post("/services", async (req, res) => {
      try {
        const newServices = req.body;
        const result = await serviceCollection.insertOne(newServices);
        res.status(200).json({
          success: true,
          message: "Serivice create successfully",
          data: result,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Serivice creation failed",
          error,
        });
      }
    });
    //load single data
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const singleService = await serviceCollection.findOne(query);
      res.json(singleService);
    });
    //delete
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const oneDelete = await serviceCollection.deleteOne(query);
      res.json(oneDelete);
    });
    //order or purchase insert
    app.post("/orders", async (req, res) => {
      const newOrder = req.body;
      const result = await orderCollection.insertOne(newOrder);
      res.send(result);
    });
    //load all oreder
    app.get("/orders", async (req, res) => {
      const cursor = orderCollection.find({});
      const allorders = await cursor.toArray();
      res.send(allorders);
    });
    // create appoinment
    app.post("/appoinment", async (req, res) => {
      try {
        const newAppoinment = req.body;
        const result = await appoinmentCollection.insertOne(newAppoinment);
        res.status(200).json({
          success: true,
          message: "Appoinment create successfully",
          data: result,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Appoinment creation failed",
          error,
        });
      }
    });
    //load all appoinment
    app.get("/appoinment", async (req, res) => {
      const cursor = appoinmentCollection.find({});
      const allAppoinments = await cursor.toArray();
      res.send(allAppoinments);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server Cleaner!");
});

app.listen(port, () => {
  console.log(`Cleener server run on http://localhost:${port}`);
});
