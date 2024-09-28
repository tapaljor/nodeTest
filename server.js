<<<<<<< HEAD
const HTTP_PORT = process.env.PORT || 3000;

const express = require("express");
const app = express();
const path = require("path");
const exphbs = require("express-handlebars");
const connectDB = require('./config/db');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()); //use cooking parser

const JWT_SECRET = "your_secret_key_here";

// Handlebars setup
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    defaultLayout: false,
    layoutsDir: path.join(__dirname, "/views")
}));
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "/views"));

//using REST, patch, delete, etc, out of default browser
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// JWT authentication middlware
function authenticateToken(req, res, next) {
    const token = req.cookies.token || req.header("Authorization")?.split(" ")[1];
    if ( !token) {
        res.locals.isLoggedIn = false;
        return res.render('login', { message: "Access denied.", color: "red"});
    }
    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified; // stroing user information in req.user for use in routes
        res.locals.isLoggedIn = true;
        next();
    } catch(err) {
        res.status(400).send("Invalid Token");
    }
}
module.exports = { authenticateToken };

const registerRouter = require("./routes/register");
const parkingRouter = require("./routes/parkings");
const residentRouter = require("./routes/residents");
const parcelRouter = require("./routes/parcels");

//connect to mongodb
async function startServer() {
    try {
        const db = await connectDB();//connection process function 
        app.locals.db = db;//making db connection accessible to the routers

        //mount routers
        app.use("/residents", authenticateToken, residentRouter);
        app.use("/parkings", authenticateToken, parkingRouter);
        app.use("/parcels", authenticateToken, parcelRouter);

        //when register login check not required
        app.use("/register", registerRouter);

        //when login to create token
        app.post("/login", async(req, res) => {
            try {
            const user = await db.collection("login").findOne({
                username: req.body.username
            });
            if (!user) {
                return res.render('login', { message: "Username not found.", color: "red" });
            } 
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                return res.render('login', { message: "Invalid password.", color: "red"});
            } 
            //if everything is correct
            const token = jwt.sign(
                {_id: user._id, username: user.username, privilege: user.privilege },
                JWT_SECRET,
                { expiresIn: '1h' }
            );
            res.cookie('token', token, {
                httpOnly: true, //ensures cookie not accissible iva JavaScript
                //secure: true, //ensures cookie is only send over HTTPS
                sameSite: 'Strict', //prevents cookie from being sent along with cross-site request
                maxAge: 3600000 //one hour in ms
            });
            res.redirect(301, '/residents');
        } catch(err) {
            console.error(err + " login error.");
        }
        });
        //logging out
        app.get("/logout", (req, res) => {
            res.clearCookie('token', {
                httpOnly: true,
                sameSite: 'Strict'
            });
            res.locals.isLoggedIn = false;
            res.render('login', { message: "Logout success", color: "red"});
        });
        //example root route
        app.get('/', (req, res) => {
            res.render('login');
        })
        app.listen(HTTP_PORT, () => {
            console.log(`Listening on port ${HTTP_PORT}`);
        });
    } catch (err) {
        console.error('Failed to connect to MongoDB: ', err);
    }
}
startServer();
=======
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
        collection = db.collection("main");
        
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
            const result = await db.collection("main").insertOne(data);
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
            const result = await db.collection("main").updateOne(
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
            result = await db.collection("main").find({
                _id: new ObjectId(req.query.id)
            }).toArray();
            res.render('profile', { result });
        } catch(err) {
            console.log(`Error: ${err}`);
        }
    });
    app.get("/displayAll", async (req, res) => {
        try {
            const result = await db.collection("main").find({}).toArray();
            res.render("search", { result });
        } catch(err) {
            console.log(`Error: ${err}`);
        }
    });
    app.get("/searchName", async (req, res) => {
        try {
            const regex = new RegExp(req.query.q, 'i');//case not sensitive
            const result = await db.collection("main").find( {
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
            const result = await db.collection("main").find({
                _id: new ObjectId(req.query.id)
            }).toArray();
            res.render( "update", { result } );
        } catch(err) {
            console.log(err);
        }
    });
    app.get("/delete", async (req, res) => {
        try {
            await db.collection("main").deleteOne({
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
>>>>>>> origin/main
