import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import ErrorResponse from "../utils/errorResponse";

export const validate =
  (schema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      return next(
        new ErrorResponse(
          error.details.map((d) => d.message).join(", "),
          400
        )
      );
    }

    req.body = value;
    next();
  };
