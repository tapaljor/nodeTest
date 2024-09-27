const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { authenticateToken } = require('../server');

router.get("/", (req, res) => {
    res.send('Hello from parking.');
});
router.get("/carModels/:brand", async(req, res)=> {
    const db = req.app.locals.db;
    try {
        const carModels = await db.collection("carModels").find(
            { brand: req.params.brand }
        ).toArray();
        res.json(carModels);
    } catch(err) {
        console.error(err);
    }
});
router.get("/checkPlate/:plateNumber", async(req, res)=> {
    const db = req.app.locals.db;
    try {
        const parkingInfo = await db.collection("parking").findOne(
            { plateNumber: req.params.plateNumber }
        );
        res.json(parkingInfo);
    } catch(err) {
        console.error(err);
    }
});
router.post("/add", authenticateToken, async(req, res) => {
    const db = req.app.locals.db;

    let now = new Date();
    // Format date as YYYY-MM-DD HH:MM
    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, '0'); // Add 1 because months are zero-indexed
    let day = String(now.getDate()).padStart(2, '0');
    let hours = String(now.getHours()).padStart(2, '0');
    let minutes = String(now.getMinutes()).padStart(2, '0');

    // Combine date and time in the desired format
    req.body.issuedAt = `${year}-${month}-${day} ${hours}:${minutes}`;
    req.body.issuedBy = req.user.username;
    try {
        const parkingInfo = await db.collection("parking").insertOne(req.body);
        if ( parkingInfo) {  //after adding parking reload the page
            const result = await db.collection("main").findOne({
                unit: req.body.unit
            });
            const carBrands = await db.collection("carBrands").find({}).toArray();
            const parkingIssued = await db.collection("parking").find(
                { unit: result.unit }
            ).toArray();
            const totalHours = parkingIssued.reduce((sum, parking) => sum + Number(parking.hours), 0)
            if ( result ) {
                res.render('residentsDetail', { result, carBrands, parkingIssued, totalHours });
            }
        }
    } catch(err) {
        console.error(err);
    }
});

module.exports = router;