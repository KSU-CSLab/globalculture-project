const app = require('../src/app');
const connectDB = require('../src/config/db');

// Connect to MongoDB Atlas
connectDB().catch((err) => {
  console.error('MongoDB connection error:', err);
});

module.exports = app;
