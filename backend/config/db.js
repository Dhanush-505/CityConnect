import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

const connectToMongo = async (uri) => {
  const connection = await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log(`MongoDB connected: ${connection.connection.host}`);
};

const connectDB = async () => {
  let mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn('No MONGO_URI found; starting in-memory MongoDB instance for development.');
  }

  try {
    if (!mongoUri) {
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
    }

    await connectToMongo(mongoUri);
    return;
  } catch (error) {
    console.warn('MongoDB connection failed:', error.message);
    console.warn('Falling back to in-memory MongoDB instance.');

    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    await connectToMongo(mongoUri);
  }
};

export default connectDB;
