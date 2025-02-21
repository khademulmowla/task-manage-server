const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iuytv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create MongoClient
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to MongoDB
        await client.connect();
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const db = client.db('taskmanagement');
        const taskCollection = db.collection('tasks');

        // Save a task in DB
        app.post('/add-task', async (req, res) => {
            const taskData = req.body;
            const result = await taskCollection.insertOne(taskData);
            res.send(result);
        });

        // Get all task data
        app.get('/all-task', async (req, res) => {
            const result = await taskCollection.find().toArray();
            res.send(result);
        });
        // Get tasks by category (To-Do, In Progress, Done)
        app.get('/tasks/:category', async (req, res) => {
            const category = req.params.category;
            const query = { category };
            const result = await taskCollection.find(query).toArray();
            res.send(result);
        });
        //get all task posted by a specific user
        app.get('/all-task/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const result = await taskCollection.find(query).toArray()
            res.send(result)

        })
        // get a single task data by id from db //
        app.get('/all-task/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.findOne(query)
            res.send(result)
        })
        // delete a single task data by id from db //
        app.delete('/all-task/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.deleteOne(query)
            res.send(result)
        })
        // update by put //
        app.put('/update/:id', async (req, res) => {
            const id = req.params.id;
            const updateData = req.body; // Get all updated fields

            const query = { _id: new ObjectId(id) };
            const updateDocument = { $set: updateData };

            try {
                const result = await taskCollection.updateOne(query, updateDocument);
                res.send(result);
            } catch (error) {
                console.error("Error updating task:", error);
                res.status(500).send({ error: "Failed to update task" });
            }
        });




    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

// Run the connection function (don't close the client)
run();

// Default route
app.get('/', (req, res) => {
    res.send('Task Management server is running');
});

// Start the server
app.listen(port, () => {
    console.log(`Task Management is running on port ${port}`);
});
