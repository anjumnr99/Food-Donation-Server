const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7nwjyzo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const userCollection = client.db("donateFoodDB").collection("users");
    const restaurantCollection = client.db("donateFoodDB").collection("restaurants");
    const recipientCollection = client.db("donateFoodDB").collection("recipients");
    const notificationCollection = client.db("donateFoodDB").collection("notifications");
    const foodRequestCollection = client.db("donateFoodDB").collection("foodRequest");
    const donationCollection = client.db("donateFoodDB").collection("donations");

    app.get('/users', async (req, res) => {
        const result = await userCollection.find().toArray();
        res.send(result);
      });
    app.get('/restaurants', async (req, res) => {
        const result = await restaurantCollection.find().toArray();
        res.send(result);
      });
    app.get('/recipients', async (req, res) => {
        const result = await recipientCollection.find().toArray();
        res.send(result);
      });
    app.get('/notifications', async (req, res) => {
        const result = await notificationCollection.find().toArray();
        res.send(result);
      });
    app.get('/foodRequests', async (req, res) => {
        const result = await foodRequestCollection.find().toArray();
        res.send(result);
      });
    app.get('/donations', async (req, res) => {
        const result = await donationCollection.find().toArray();
        res.send(result);
      });

        // user related api
        app.post('/users', async (req, res) => {
          const user = req.body;
          // insert email if user doesn't exist
          const query = { email: user?.email };
          console.log("The User Email is:", query);
          const existingUser = await userCollection.findOne(query);
          if (existingUser) {
            return res.send({ message: 'User already exists', insertedId: null })
          }
          const result = await userCollection.insertOne(user);
          res.send(result);
        });  


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Food Donation is running!')
  })
  
  app.listen(port, () => {
    console.log(`Food Donation is running on port ${port}`)
  })