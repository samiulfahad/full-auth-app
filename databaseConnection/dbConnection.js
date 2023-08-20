const { MongoClient } = require("mongodb");
const dotenv = require('dotenv');

dotenv.config()

// Connection URI
const uri = process.env.MONGODB_URL

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
