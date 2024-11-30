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
      res.send({ individualDonor, findIndividualDonor })
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
      res.send({ businessDonor, findBusinessDonor })
    })

    app.get('/activeDonations/donors', async (req, res) => {
      console.log(req.query.email);
      const email = req.query.email;
      const query = {
        created_by: email,
        creation_status: "available"
      };
      const result = await donationCollection.find(query).toArray();
      res.send(result);
    });

    app.put('/updateRecipientProfile/:id', async (req, res) => {
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

    app.put('/updateDonorsProfile/individual/:id', async (req, res) => {
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
      const result = await individualDonorsCollection.updateOne(filter, product, options);
      res.send(result)

    });
    app.put('/updateDonorsProfile/business/:id', async (req, res) => {
      const ids = req.params.id;
      const filter = { _id: new ObjectId(ids) };
      const options = { upsert: true };
      const updatedProfile = req.body;
      const product = {
        $set: {
          businessName: updatedProfile.businessName,
          contactName: updatedProfile.contactName,
          email: updatedProfile.email,
          phone: updatedProfile.phone,
          website: updatedProfile.website,
          address: updatedProfile.address,
          role: updatedProfile.role
        }
      }
      const result = await businessDonorsCollection.updateOne(filter, product, options);
      res.send(result)

    });

    app.get('/foodRequest', async (req, res) => {
      console.log("Food Request For each", req.query.email);
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
    app.delete('/donation/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await donationCollection.deleteOne(query);
      res.send(result);
    });

    app.get('/donations/nearby/:recipientAddress', async (req, res) => {
      const recipientAddress = req.params.recipientAddress
        ?.split(/[\s,]+/) // Split on spaces or commas
        .map(word => word.trim()) || [];

      console.log("Recipient nearby", recipientAddress);
      const query = {
        $or: recipientAddress.map(word => ({
          location: { $regex: word, $options: 'i' }
        })),
        creation_status: "available"
      };

      const nearbyDonations = await donationCollection.find(query).toArray();
      res.send(nearbyDonations);
    });

    app.get('/foodRequest/nearby/:donorsAddress', async (req, res) => {
      const donorsAddress = req.params.donorsAddress
        ?.split(/[\s,]+/) // Split on spaces or commas
        .map(word => word.trim()) || [];

      console.log(donorsAddress);

      const query = {
        $or: donorsAddress.map(word => ({
          location: { $regex: word, $options: 'i' }
        })),

        request_status: "pending"
      };

      const nearbyFoodRequests = await foodRequestCollection.find(query).toArray();
      res.send(nearbyFoodRequests);
    });

    app.get('/acceptedRequests/:email', async (req, res) => {
      const email = req.params.email;
      const query = { accepted_by: email }

      const acceptedRequests = await foodRequestCollection.find(query).toArray();
      res.send(acceptedRequests);
    });

    app.patch('/foodRequest/accept/:id', async (req, res) => {
      const id = req.params.id;
      const acceptByMail = req.body.acceptedBy; // Read acceptedBy from the body
      console.log("Accepted by:", acceptByMail);

      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {

          request_status: 'accepted',
          accepted_by: acceptByMail
        }
      };

      const result = await foodRequestCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    app.patch('/foodRequest/decline/:id', async (req, res) => {
      const id = req.params.id;

      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          request_status: 'pending',
          accepted_by: 'N/A'
        }
      };

      const result = await foodRequestCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.patch('/donation/accept/:id', async (req, res) => {
      console.log("Received Body:", req.body); // Log the entire body
      console.log("Accepted By:", req.body.acceptedBy); // Log specific field
      const id = req.params.id;
      const acceptByMail = req.body.acceptedBy; // Ensure this is being sent correctly

      console.log("Donation Accepted by:", acceptByMail);

      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          accepting_status: 'accepted',
          accepted_by: acceptByMail,
        },
      };

      const result = await donationCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.patch('/donation/decline/:id', async (req, res) => {
      const id = req.params.id;

      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          accepting_status: 'pending',
          accepted_by: 'N/A'
        }
      };

      const result = await donationCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.patch('/donation/confirm/:id', async (req, res) => {
      const id = req.params.id;

      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          accepting_status: 'confirm',
        }
      };

      const result = await donationCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.patch('/donation/reject/:id', async (req, res) => {
      const id = req.params.id;

      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          accepting_status: 'pending',
          accepted_by: 'N/A'
        }
      };

      const result = await donationCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    app.patch('/donation/complete/:id', async (req, res) => {
      const id = req.params.id;

      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          accepting_status: 'completed'
        }
      };

      const result = await donationCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    app.patch('/donation/close/:id', async (req, res) => {
      const id = req.params.id;

      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          creation_status: "close"
        }
      };

      const result = await donationCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.get('/closedDonations/donors', async (req, res) => {
      const email = req.query.email; // Use query parameter
      const query = {
        created_by: email,
        creation_status: 'close'
      };

      const acceptedRequests = await donationCollection.find(query).toArray();
      res.send(acceptedRequests);
    });

   
    app.post('/notification/add', async (req, res) => {
      const newNotification = req.body;
      console.log("Notification Added",newNotification);
      const result = await notificationCollection.insertOne(newNotification);
      res.send(result);
    });

    app.get('/notifications/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const query = { sent_to: email };
        const notifications = await notificationCollection.find(query).toArray();
        
        console.log('Fetched Notifications for:', email, notifications);
        res.send({ notifications }); 
      } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).send({ message: 'Failed to fetch notifications', error });
      }
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