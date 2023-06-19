
const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config();
const port = process.env.PORT || 5000


app.use(express.json())
app.use(cors())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DBUser}:${process.env.DBPass}@cluster0.qmhrwse.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();


        const postsCollection = client.db('easy-rent').collection('posts')


        app.get('/posts', async (req, res) => {
            const type = req.query.type
            const beds = req.query.beds
            const baths = req.query.baths
            const otherFacilities = req.query.otherFacilities


            const query = {}

            if (!type && !beds && !baths && !otherFacilities) {
                const result = await postsCollection.find().limit(12).toArray()
                res.send(result)
            }
            else {
                if (type) {
                    query.type = type
                    console.log(type);
                }

                if (beds && Array.isArray(beds)) {
                    query.rooms = { $in: beds.map(Number) };
                }

                if (baths && Array.isArray(baths)) {
                    query.bathrooms = { $in: baths.map(Number) };
                }

                if (otherFacilities) {
                    if (otherFacilities.includes('lift') && otherFacilities.includes('garage')) {
                        query.hasLift = true
                        query.hasParking = true
                    }
                    else if (otherFacilities.includes('lift')) {
                        query.hasLift = true
                    }
                    else if (otherFacilities.includes('garage')) {
                        query.hasParking = true
                    }
                }
                console.log(query);

                const result = await postsCollection.find(query).limit(12).toArray()
                res.send(result)
            }

        })

        app.get('/post/:id', async (req, res) => {
            const id = req.params.id;
            const result = await postsCollection.findOne({ _id: new ObjectId(id) })
            res.send(result)
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('easy-rent')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
// easyRent
// CymIdzEsySiKaWb1