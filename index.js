const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r44bh6t.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const coffeeCollection = client.db("ProductDB").collection("coffees");
    const userCollection = client.db("ProductDB").collection("user");

    // get method

    app.get("/", async (req, res) => {
      res.send("App is running....");
    });

    app.get("/coffee", async (req, res) => {
      const data = req.body;
      console.log(data);
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    });

    //Post method
    app.post("/coffee", async (req, res) => {
      const newCoffee = req.body;
      console.log(newCoffee);
      const result = await coffeeCollection.insertOne(newCoffee);
      res.send(result);
    });

    //Update Method(PUT )
    app.put("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const updatedCoffee = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const coffee = {
        $set: {
          name: updatedCoffee.name,
          suppliler: updatedCoffee.suppliler,
          category: updatedCoffee.category,
          chef: updatedCoffee.chef,
          taste: updatedCoffee.taste,
          price: updatedCoffee.price,
          photo: updatedCoffee.photo,
        },
      };
      const result = await coffeeCollection.updateOne(query, coffee, options);
      res.send(result);
      // console.log(id, updatedCoffee, query);
    });

    app.delete("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    // Users apis

    app.get("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    app.get("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      console.log(user.lastLoggedAt);
      const filter = { email: user.email };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name: user?.name,
          email: user?.email,
          photo: user?.photo,
          lastLoggedAt: user.lastLoggedAt,
        },
      };
      const result = await userCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.listen(port, () => {
  console.log(`Example app listening on port : ${port}`);
});
