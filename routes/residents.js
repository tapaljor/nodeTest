const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");

router.get("/", async (req, res) => {
    const db = req.app.locals.db;
    try {
        const result = await db.collection("main").find({}).toArray();
        if ( result) { 
            res.render('residentsList', { result });
        } else {
            res.send(`<h1 style="color: red;">No data.</h1>`);
        }
    } catch (err) {
        console.error(err);
    }
});
router.get("/add", async(req, res)=> {
    res.render('residentsAdd');
});
router.get("/:id", async (req, res) => {
    const db = req.app.locals.db;
    try {
        const result = await db.collection("main").findOne({
            _id: new ObjectId(req.params.id)
        });
        const carBrands = await db.collection("carBrands").find({}).toArray();
        const parkingIssued = await db.collection("parking").find(
            { unit: result.unit }
        ).toArray();
        const totalHours = parkingIssued.reduce((sum, parking) => sum + Number(parking.hours), 0)
        if ( result ) {
            res.render('residentsDetail', { result, carBrands, parkingIssued, totalHours });
        } else {
            res.status(404).send("Resident not found");
        }
    } catch (err) {
        console.log(err);
    }
});
router.get("/edit/:id", async (req, res) => {
    const db = req.app.locals.db;
    try {
        const result = await db.collection("main").findOne({
            _id: new ObjectId(req.params.id)
        });
        res.render('residentsEdit', { result });
    } catch (err) {
        console.log(`Error: ${err}`);
    }
});
router.get("/searchName/:key", async (req, res) => {
    const db = req.app.locals.db;
    try {
        const regex = new RegExp(req.params.key, 'i');//case not sensitive
        const result = await db.collection("main").find({
            name: { $regex: regex }
        }).toArray();
        res.json(result);
    } catch (err) {
        console.log(`Error: ${err}`);
        res.status(500).send("Error fetching data.");
    }
});
router.delete("/delete/:id", async(req, res)=>{
    const db = req.app.locals.db;
    try {
        let deletedName = await db.collection("main").findOne(
            { _id: new ObjectId(req.params.id)},
            { projection: { name: 1, _id: 0 }}
        ); 
        const delR = await db.collection("main").deleteOne({
            _id: new ObjectId(req.params.id)
        });
        if ( delR.deletedCount > 0) {
            const result = await db.collection("main").find({}).toArray();
            res.render('residentsList', {result, "message": "Resident "+deletedName.name+" deleted.", color: "green"});
        }
    } catch(err) {
        console.log(`Error: ${err}`);
    }
});
router.post("/add", async(req, res)=> {
    const db = req.app.locals.db;
    try {
        const re = await db.collection("main").insertOne(req.body);
        if ( re.insertedId) {
            const result = await db.collection("main").findOne({ _id: re.insertedId });
            res.render('residentsDetail', { result });
        } else {
            res.send(`<h1 style="color: red;">No data found.</h1>`);
        }
    } catch(err) {
        console.log(err);
    }
});
router.patch("/update/:id", async (req, res) => {
    const db = req.app.locals.db;
    try {
        const updateR = await db.collection("main").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
        );
        if (updateR.modifiedCount > 0) {
            const result = await db.collection("main").findOne(
                {_id: new ObjectId(req.params.id)}
            );
            res.render('residentsDetail', { result });
        }
    } catch (err) {
        console.log(`Error: ${err}`);
    }
});

module.exports = router;