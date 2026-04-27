const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
  try {
    console.log(`Connecting to: ${config.mongoUri}`);
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
