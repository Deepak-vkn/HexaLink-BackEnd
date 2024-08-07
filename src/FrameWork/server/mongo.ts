import mongoose from 'mongoose';
import dotenv from 'dotenv';


dotenv.config();

const dburl: string = process.env.MongoUrl || '';

if (!dburl) {
  console.error('MongoDB connection string is not defined in the environment variables.');
  process.exit(1);
}

async function connectDB() {
  try {
    await mongoose.connect(dburl, { dbName: 'HexaLink' });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1); 
  }
}

export default connectDB;
