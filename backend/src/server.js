const mongoose = require('mongoose');
const config = require('./config/env');
const connectDB = require('./config/db');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

// Connect logic wrapped in app requirement to ensure DB is up first if needed,
// but requiring app is fine
const app = require('./app');

// Connect to Database
connectDB();

const server = app.listen(config.port, () => {
  console.log(`App running on port ${config.port} in ${config.env} mode...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
