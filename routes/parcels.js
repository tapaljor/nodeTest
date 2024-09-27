const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");

router.get("/", async (req, res) => {
    const db = req.app.locals.db;
    try {
        const parcels = await db.collection("parcels").find({ status: 'open' }).toArray();
        if (parcels) {
            res.render('parcelsList', { parcels, currentUrl: "open"} );
        } else {
            res.send(`<h1 style="color: red;">No data.</h1>`);
        }
    } catch (err) {
        console.error(err);
    }
});
router.get("/closed", async (req, res) => {
    const db = req.app.locals.db;
    try {
        const parcels = await db.collection("parcels").find({ status: 'closed' }).toArray();
        if (parcels) {
            res.render('parcelsList', { parcels });
        } else {
            res.send(`<h1 style="color: red;">No data.</h1>`);
        }
    } catch (err) {
        console.error(err);
    }
});
router.get("/add", async (req, res) => {
    const db = req.app.locals.db;
    try {
        const carriers = await db.collection("carriers").find({}).toArray();
        res.render('parcelsAdd', { carriers });
    } catch (err) {
        console.error(err);
    }
});
router.get("/edit/:id", async (req, res) => {
    const db = req.app.locals.db;
    try {
        const parcel = await db.collection("parcels").findOne({
            _id: new ObjectId(req.params.id)
        });
        const carriers = await db.collection("carriers").find({}).toArray();
        res.render('parcelsEdit', { parcel, carriers });
    } catch (err) {
        console.log(`Error: ${err}`);
    }
});
router.get("/verifyUnit/:unit", async (req, res) => {
    const db = req.app.locals.db;
    try {
        const result = await db.collection("main").findOne(
            { unit: req.params.unit }
        );
        res.json(result);
    } catch (err) {
        console.error(err);
    }
});
router.get("/searchOpenParcel/:unit", async (req, res) => {
    const db = req.app.locals.db;
    try {
        const parcels = await db.collection("parcels").find({
            unit: req.params.unit,
            status: 'open'
        }).toArray();
        if (parcels.length > 0) {
            res.json(parcels);
        }
    } catch (err) {
        console.log(`Error: ${err}`);
        res.status(500).send("Error fetching data.");
    }
});
router.get("/searchClosedParcel/:unit", async (req, res)=> {
    const db = req.app.locals.db;
    try {
        const parcels = await db.collection("parcels").find({
            unit: req.params.unit,
            status: 'closed'
        }).toArray();
        if (parcels.length > 0) {
            res.json(parcels);
        }
    } catch (err) {
        console.log(`Error: ${err}`);
        res.status(500).send("Error fetching data.");
    }
});
router.get("/issue/:id", async (req, res) => {
    const db = req.app.locals.db;
    let now = new Date();
    // Format date as YYYY-MM-DD HH:MM
    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, '0'); // Add 1 because months are zero-indexed
    let day = String(now.getDate()).padStart(2, '0');
    let hours = String(now.getHours()).padStart(2, '0');
    let minutes = String(now.getMinutes()).padStart(2, '0');
    const timeDate = `${year}-${month}-${day} ${hours}:${minutes}`;
    try {
        const result = await db.collection("parcels").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status: 'closed',  issuedAt: timeDate, issuedBy: req.user.username } }
        );
        if (result) {
            const parcels = await db.collection("parcels").find({ status: 'open' }).toArray();
            res.render('parcelsList', { parcels });
        }
    } catch (err) {
        console.error(err);
    }
});
router.post("/add", async (req, res) => {
    const db = req.app.locals.db;

    let now = new Date();
    // Format date as YYYY-MM-DD HH:MM
    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, '0'); // Add 1 because months are zero-indexed
    let day = String(now.getDate()).padStart(2, '0');
    let hours = String(now.getHours()).padStart(2, '0');
    let minutes = String(now.getMinutes()).padStart(2, '0');

    const timeDate = `${year}-${month}-${day} ${hours}:${minutes}`;

    const { unit, carrier, location, description } = req.body;

    // Extract the arrays and common fields from req.body
    let transformedData = [];
    for (let a = 0; a < unit.length; a++) {
        let parcel = {
            unit: unit[a],
            carrier: carrier[a],
            location: location[a],
            description: description[a],
            loggedAt: timeDate,
            loggedBy: req.user.username,
            issuedAt: '',
            issuedBy: '',
            status: 'open' 
        };
        // Push the parcel object into the transformedData array
        transformedData.push(parcel);
    }
    try {
        const re = await db.collection("parcels").insertMany(transformedData);
        if (re) {
            res.render('parcelsAdd', { message: 'Parcel Added. Everyone will be notified.', color: 'green'});
        } else {
            res.send(`<h1 style="color: red;">No data found.</h1>`);
        }
    } catch (err) {
        console.log(err);
    }
});
router.patch("/update/:id", async (req, res) => {
    const db = req.app.locals.db;
    try {
        const updateR = await db.collection("parcels").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
        );
        if (updateR.modifiedCount > 0) {
            const parcels = await db.collection("parcels").find({ status: 'open' }).toArray();
            res.render('parcelsList', { parcels });
        }
    } catch (err) {
        console.log(`Error: ${err}`);
    }
});
module.exports = router;