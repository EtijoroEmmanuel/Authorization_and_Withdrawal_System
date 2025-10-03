import pino from "pino";

export const logger = pino({
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty" } // human-friendly logs in dev
      : undefined,                // JSON logs in prod
  level: process.env.LOG_LEVEL || "info",
});
