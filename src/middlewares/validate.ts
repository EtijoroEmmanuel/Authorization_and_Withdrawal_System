import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import { BadRequestException } from "../utils/exceptions";

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
        new BadRequestException(error.details.map((d) => d.message).join(", "))
      );
    }

    req.body = value;
    next();
  };
