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