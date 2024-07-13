require('dotenv').config(); // Load environment variables

const HTTP_PORT = process.env.PORT || 3000;
const express = require("express");
const app = express();
const path = require("path");
const nodemailer = require("nodemailer");
const exphbs = require("express-handlebars");

const { MongoClient, ObjectId } = require("mongodb");
const uri = "mongodb+srv://tapaljor:A81Z6ZvQjnhud1Xx@tpcluster.pmqosjh.mongodb.net/?retryWrites=true&w=majority&appName=TPCluster";

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars setup
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    defaultLayout: false,
    layoutsDir: path.join(__dirname, "/views")
}));
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "/views"));

// Immediately Invoked Async Function Expression (IIFE)
(async () => {
    let connect, db, collection, data;
    try {
        // Connect to the database
        connect = await MongoClient.connect(uri);
        console.log(`Data connected.`);
        
        // Select the database and collection
        db = connect.db("resident");
        collection = db.collection("resident");
        
        // Optional: Fetch initial data or perform other setup operations
        data = await collection.find({}).toArray();
    } catch (err) {
        // Handle errors during the asynchronous setup
        console.error('Error during setup:', err);
        return; // Exit if the setup fails
    }
    // Define your routes after the setup is complete
    app.post("/submit", async (req, res) => {
        data = req.body;
        try {
            const result = await db.collection("resident").insertOne(data);
            res.render('home');
        } catch (err) {
            console.log(`Error: ${err}`);
            res.status(500).send("Error inserting data.");
        }
    });
    app.post("/update", async (req, res) => {
        data = req.body;
        const id = new ObjectId(data._id);
        delete data._id;

        try {
            const result = await db.collection("resident").updateOne(
                { _id: id },
                { $set: data }
            );
            res.redirect("/displayOne?id=" + id);
        } catch( err) {
            console.log(`Error: ${err}`);
        }
    });
    app.get("/displayOne", async(req, res) => {
        try {
            result = await db.collection("resident").find({
                _id: new ObjectId(req.query.id)
            }).toArray();
            res.render('search', { result });
        } catch(err) {
            console.log(`Error: ${err}`);
        }
    });
    app.get("/displayAll", async (req, res) => {
        try {
            const result = await db.collection("resident").find({}).toArray();
            res.render("search", { result });
        } catch(err) {
            console.log(`Error: ${err}`);
        }
    });
    app.get("/searchName", async (req, res) => {
        try {
            const regex = new RegExp(req.query.q, 'i');//case not sensitive
            const result = await db.collection("resident").find( {
                name: { $regex: regex }
            }).toArray();
            res.json(result);
        } catch (err) {
            console.log(`Error: ${err}`);
            res.status(500).send("Error fetching data.");
        }
    });
    app.get("/edit", async (req, res) => {
        try {
            const result = await db.collection("resident").find({
                _id: new ObjectId(req.query.id)
            }).toArray();
            res.render( "update", { result } );
        } catch(err) {
            console.log(err);
        }
    });
    app.get("/delete", async (req, res) => {
        try {
            await db.collection("resident").deleteOne({
                _id: new ObjectId(req.query.id)
            });
            res.redirect("/displayAll");
        } catch(err) {
            console.log(err);
        }
    });

    // Start the server only after the setup is complete
    app.get("/", (req, res) => {
        res.render('home');
    });
    app.get("/add", (req, res) => {
        res.render('home');
    });
    let server = app.listen(HTTP_PORT, () => {
        console.log(`Listening on port ${HTTP_PORT}`);
    });
})();
