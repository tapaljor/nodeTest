const { MongoClient} = require("mongodb");
const uri = "mongodb+srv://tapaljor:A81Z6ZvQjnhud1Xx@tpcluster.pmqosjh.mongodb.net/?retryWrites=true&w=majority&appName=TPCluster";

const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to database.");
        return client.db('resident');
    } catch(err) {
        console.error(err);
        process.exit(1);//exit if there is a connection error
    }
}
module.exports = connectDB;