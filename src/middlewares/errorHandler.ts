import { Request, Response, NextFunction } from "express";
import ErrorResponse from "../utils/errorResponse";
import { ExtendedError } from "../interface";

function errorHandler(
  err: ErrorResponse | ExtendedError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const error: ExtendedError =
    err instanceof ErrorResponse
      ? err
      : new ErrorResponse(err.message, err.statusCode!);

  res.status(error.statusCode ?? 500).json({
    success: false,
    error: {
      message: error.message,
      statusCode: error.statusCode ?? 500,
      errors: "errors" in error ? error.errors ?? [] : [],
    },
  });
}

export default errorHandler;
