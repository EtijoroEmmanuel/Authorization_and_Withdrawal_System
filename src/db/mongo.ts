import mongoose from 'mongoose';
import { env } from '../config/env';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.DB.URL);
    console.log(`✅ MongoDB Connected: ${conn.connection.name} (${env.APP.ENV} environment)`);
  } catch (error: any) {
    console.error(`❌ Unable to connect to the database: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
