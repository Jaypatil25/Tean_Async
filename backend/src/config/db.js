const mongoose = require('mongoose');
const { setDatabaseMode } = require('./runtime');

const connectionOptions = {
  serverSelectionTimeoutMS: 8000,
  family: 4
};

const connectWithUri = async (uri) => {
  await mongoose.connect(uri, connectionOptions);
};

const connectDB = async () => {
  try {
    await connectWithUri(process.env.MONGO_URI);
    setDatabaseMode('mongo');
    console.log('MongoDB connected');
  } catch (err) {
    if (process.env.MONGO_URI_FALLBACK) {
      try {
        await connectWithUri(process.env.MONGO_URI_FALLBACK);
        setDatabaseMode('mongo');
        console.log('MongoDB connected using fallback URI');
        return;
      } catch (fallbackErr) {
        console.warn(`MongoDB fallback connection error: ${fallbackErr.message}`);
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      setDatabaseMode('file');
      console.warn('MongoDB connection failed, using local file storage instead.');
      console.warn(`MongoDB connection error: ${err.message}`);
      return;
    }

    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
