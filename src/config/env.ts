import * as dotenv from "dotenv";
import { IENVIRONMENT } from "../interface";

dotenv.config();

export const env: IENVIRONMENT = {
  APP: {
    NAME: process.env.APP_NAME!,
    PORT: parseInt(process.env.PORT!),
    ENV: process.env.APP_ENV!,
    CLIENT: process.env.CLIENT,
  },

  DB: {
    URL:
      process.env.APP_ENV === "production"
        ? process.env.MONGO_URL_PROD || ""
        : process.env.MONGO_URL_DEV || "",
  },

  AUTH: {
    JWT_SECRET: process.env.JWT_SECRET!, 
    JWT_EXPIRES: parseInt(process.env.JWT_EXPIRES_IN!),
    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS!),
  },
    REDIS_URL: process.env.REDIS_URL!
};
