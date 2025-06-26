const mongoose = require("mongoose");

const DBConnection = async () => {
  try {
    console.log("Connecting to DB:", process.env.MONGO_DB); // Debug
    await mongoose.connect(process.env.MONGO_DB);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    throw new Error(`Could not connect to MongoDB: ${err}`);
  }
};

module.exports = DBConnection;
