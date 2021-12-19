const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
var cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8qp7t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    const database = client.db("cleaningServices");
    const serviceCollection = database.collection("services");

    //load all data
    app.get('/services', async(req,res)=>{
        const cursor = serviceCollection.find({});
        const allServices = await cursor.toArray();
        res.send(allServices);
    })

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Cleaner!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
