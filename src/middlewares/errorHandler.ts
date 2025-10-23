import { Request, Response, NextFunction } from "express";
import ErrorResponse from "../utils/errorResponse";
import {ExtendedError} from "../interface";

function errorHandler(
  err: ErrorResponse | ExtendedError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const error: ErrorResponse =
    err instanceof ErrorResponse
      ? err
      : new ErrorResponse(
          err.message || "Server Error",
          500,
          "errors" in err ? err.errors : undefined
        );

  res.status(error.statusCode ?? 500).json({
    success: false,
    error: {
      message: error.message,
      statusCode: error.statusCode ?? 500,
      errors: error.getErrors<unknown>() ?? [],
    },
  });
}

export default errorHandler;
