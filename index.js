const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const businessDonorsCollection = client.db("donateFoodDB").collection("businessDonors");
    const individualDonorsCollection = client.db("donateFoodDB").collection("individualDonors");
    const recipientCollection = client.db("donateFoodDB").collection("recipients");
    const notificationCollection = client.db("donateFoodDB").collection("notifications");
    const foodRequestCollection = client.db("donateFoodDB").collection("foodRequest");
    const donationCollection = client.db("donateFoodDB").collection("donations");

    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    app.get('/businessDonors', async (req, res) => {
      const result = await businessDonorsCollection.find().toArray();
      res.send(result);
    });
    app.get('/recipients', async (req, res) => {
      const result = await recipientCollection.find().toArray();
      res.send(result);
    });
    app.get('/individualDonors', async (req, res) => {
      const result = await individualDonorsCollection.find().toArray();
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

    //adding recipient account related api
    app.post('/add-recipient', async (req, res) => {
      const user = req.body;
      // insert email if user doesn't exist
      const query = { email: user?.email };
      console.log("The User Email is:", query);
      const existingUser = await recipientCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'User already exists', insertedId: null })
      }
      const result = await recipientCollection.insertOne(user);
      res.send(result);
    });

    //adding donors account related api
    app.post('/add-business-donors', async (req, res) => {
      const user = req.body;
      // insert email if user doesn't exist
      const query = { email: user?.email };
      console.log("The User Email is:", query);
      const existingUser = await businessDonorsCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'User already exists', insertedId: null })
      }
      const result = await businessDonorsCollection.insertOne(user);
      res.send(result);
    });

    app.post('/add-individual-donors', async (req, res) => {
      const user = req.body;
      // insert email if user doesn't exist
      const query = { email: user?.email };
      console.log("The User Email is:", query);
      const existingUser = await individualDonorsCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'User already exists', insertedId: null })
      }
      const result = await individualDonorsCollection.insertOne(user);
      res.send(result);
    });
    app.post('/add-donation', async (req, res) => {
      const review = req.body;
      const result = await donationCollection.insertOne(review);
      res.send(result);
    });
    app.post('/add-food-request', async (req, res) => {
      const review = req.body;
      const result = await foodRequestCollection.insertOne(review);
      res.send(result);
    });


    app.get('/recipient/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const findRecipient = await recipientCollection.findOne(query);
      let recipient = false;
      if (findRecipient) {
        recipient = findRecipient?.role === 'recipient';
      }
      console.log('Recipient', recipient, findRecipient);
      res.send({ recipient, findRecipient })
    })
    app.get('/individualDonor/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const findIndividualDonor = await individualDonorsCollection.findOne(query);
      let individualDonor = false;
      if (findIndividualDonor) {
        individualDonor = findIndividualDonor?.role === 'donors';
      }
      console.log('IndividualDonor', individualDonor);
      res.send({ individualDonor,findIndividualDonor })
    })
    app.get('/businessDonor/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const findBusinessDonor = await businessDonorsCollection.findOne(query);
      let businessDonor = false;
      if (findBusinessDonor) {
        businessDonor = findBusinessDonor?.role === 'donors';
      }
      console.log('businessDonor', businessDonor);
      res.send({ businessDonor,findBusinessDonor  })
    })

    app.get('/donations/donors', async (req, res) => {
      console.log(req.query.email);
      const email = req.query.email;
      const query = { created_by: email };
      const result = await donationCollection.find(query).toArray();
      res.send(result);
    });

    app.put('/updateProfile/:id', async (req, res) => {
      const ids = req.params.id;
      const filter = { _id: new ObjectId(ids) };
      const options = { upsert: true };
      const updatedProfile = req.body;
      const product = {
        $set: {
          name: updatedProfile.name,
          email: updatedProfile.email,
          phone: updatedProfile.phone,
          address: updatedProfile.address,
          role: updatedProfile.role

        }
      }

      const result = await recipientCollection.updateOne(filter, product, options);
      res.send(result)

    });

    app.get('/foodRequest', async (req, res) => {
      console.log("Food Request For each",req.query.email);
      const email = req.query.email;
      const query = { requested_by: email };
      const result = await foodRequestCollection.find(query).toArray();
      res.send(result);
    });

    app.delete('/foodRequest/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await foodRequestCollection.deleteOne(query);
      res.send(result);
    });

    app.get('/donations/nearby/:recipientAddress', async (req, res) => {
      const recipientAddress = req.params.recipientAddress
          ?.split(/[\s,]+/) // Split on spaces or commas
          .map(word => word.trim()) || [];
  
      const query = {
          $or: recipientAddress.map(word => ({
              location: { $regex: word, $options: 'i' }
          })),
          status: "available"
      };
  
      const nearbyDonations = await donationCollection.find(query).toArray();
      res.send(nearbyDonations);
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