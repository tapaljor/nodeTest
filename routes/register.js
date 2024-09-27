const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const { authenticateToken } = require('../server');

router.get("/", authenticateToken, async (req, res) => {
    const db = req.app.locals.db;
    if (req.user.privilege == 1) {
        try {
            const staff = await db.collection("login").find({}).toArray();
            res.render('registerList', { staff });
        } catch (err) {
            console.error(err);
        }
    } else {
        res.render('login', { message: "You have no permission to access this page.", color: "red"} );
    }
});
router.get("/add", authenticateToken, (req, res) => {
    if ( req.user.privilege == 1) {
    res.render('registerAdd');
    } else {
        res.render('login', { message: "You have no permission to access this page.", color: "red"});
    }
});
router.get("/edit/:id", async (req, res) => {
    const db = req.app.locals.db;
    try {
        const staff = await db.collection("login").findOne({ _id: new ObjectId(req.params.id) });
        res.render('registerEdit', { staff });
    } catch (err) {
        console.error(err);
    }
});
router.post("/add", async (req, res) => {
    const db = req.app.locals.db;
    let checkUsername = await db.collection("login").findOne(
        { username: req.body.username }
    );
    if (checkUsername) {
        return res.render('registerAdd', { message: "Username is already there.", color: "red" });
    } else {
        let hashedPassword = await bcrypt.hash(req.body.password, 10);
        const result = await db.collection("login").insertOne({
            username: req.body.username,
            password: hashedPassword,
            privilege: req.body.privilege
        });
        if (result) {
            const staff = await db.collection("login").find({}).toArray();
            res.render('registerList', { staff });
        }
    }
});
router.patch("/update/:id", async (req, res) => {
    const db = req.app.locals.db;
    let hashedPassword = await bcrypt.hash(req.body.password, 10);
    delete req.body.password2;
    try {
        const result = await db.collection("login").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { password: hashedPassword, privilege: req.body.privilege } }
        );
        if (result) {
            const staff = await db.collection("login").find({}).toArray();
            res.render('registerList', { staff });
        }
    } catch (err) {
        console.error(err);
    }
});
router.delete("/delete/:id", async (req, res) => {
    const db = req.app.locals.db;
    try {
        const result = await db.collection("login").deleteOne(
            { _id: new ObjectId(req.params.id) }
        )
        if (result) {
            const staff = await db.collection("login").find({}).toArray();
            res.render('registerList', { staff });
        }
    } catch (err) {
        console.error(err);
    }
});
router.get("/searchUsername/:username", async (req, res) => {
    const db = req.app.locals.db;
    try {
        const result = await db.collection("login").find(
            { username: req.params.username }
        ).toArray();
        res.json(result);
    } catch (err) {
        console.log(err);
    }
});
module.exports = router;