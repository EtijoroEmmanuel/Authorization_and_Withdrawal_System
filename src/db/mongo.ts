import mongoose from "mongoose";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export const connectMongo = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.DB.URL);
    logger.info(
      `MongoDB Connected: ${conn.connection.name} (${env.APP.ENV} environment)`
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Unable to connect to MongoDB: ${error.message}`);
    } else {
      logger.error(
        { error: String(error) },
        "Unable to connect to MongoDB: Unknown error"
      );
    }
  }
};
