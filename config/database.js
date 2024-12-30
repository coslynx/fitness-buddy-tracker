const { MongoClient } = require('mongodb');
require('dotenv').config();

const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log("MongoDB Connected");
    return client.db();
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };