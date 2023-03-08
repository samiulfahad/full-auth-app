const { MongoClient } = require("mongodb");

// Connection URI
const uri = "mongodb://127.0.0.1:27017/auth";

// Create a new MongoClient
const client = new MongoClient(uri);

async function dbConnect() {
  try {
    const db = await client.db();
    console.log("Connected to DB successfully");
    return db
  } catch (err) {
    console.log('dB Connection Error');
    console.log(err);
  }
}
module.exports = dbConnect
