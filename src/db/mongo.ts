import mongoose from 'mongoose';
import { env } from '../config/env';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.DB.URL);
    console.log(`✅ MongoDB Connected: ${conn.connection.name} (${env.APP.ENV} environment)`);
  } catch (error: unknown) {
    if (error instanceof Error) {
    console.error(`❌ Unable to connect to the database: ${error.message}`);
  } else {
    console.error("❌ Unable to connect to the database: Unknown error", error);
  }
  process.exit(1);
}
}
export default connectDB;
