const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    if (mongoUri.includes('<username>') || mongoUri.includes('<password>')) {
      throw new Error('MONGO_URI still contains placeholder values. Update server/.env with real MongoDB credentials or a local Mongo URI.');
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
