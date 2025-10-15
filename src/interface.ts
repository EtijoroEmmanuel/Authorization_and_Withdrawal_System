import { Environment } from "./config/env";

export interface IENVIRONMENT {
  APP: {
    NAME: string;
    PORT: number;
    ENV: Environment;
    CLIENT?: string;
  };
  DB: {
    URL: string;
  };
  AUTH: {
    JWT_SECRET: string;
    JWT_EXPIRES: string;
    BCRYPT_SALT_ROUNDS: number;
  };
  REDIS_URL: string;
}

export interface ExtendedError extends Error {
  statusCode?: number;
  errors?: any;
}
