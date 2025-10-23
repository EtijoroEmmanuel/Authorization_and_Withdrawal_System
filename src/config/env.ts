export enum Environment {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
}

import * as dotenv from "dotenv";
import {IENVIRONMENT} from "../interface";

dotenv.config();

export const env: IENVIRONMENT = {
  APP: {
    NAME: process.env.APP_NAME!,
    PORT: parseInt(process.env.PORT!, 10),
    ENV: (process.env.NODE_ENV as Environment) || Environment.DEVELOPMENT,
    CLIENT: process.env.CLIENT,
  },

  DB: {
    URL: process.env.MONGO_URL!,
  },

  AUTH: {
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES: process.env.JWT_EXPIRES!,
    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS!, 10),
  },

  REDIS_URL: process.env.REDIS_URL!,
};
