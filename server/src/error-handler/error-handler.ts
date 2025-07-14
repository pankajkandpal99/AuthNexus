import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { StatusCodes } from "../config/constants.js";
import { logger } from "../utils/logger.js";
import { HttpResponse } from "../utils/service-response.js";
import { AppError } from "./app-error.js";
import { ConflictError } from "./index.js";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(
    `[${req.method}] ${req.path} >> ${err instanceof Error ? err.stack : err}`
  );

  if (err instanceof ConflictError) {
    return HttpResponse.error(res, err.message, err.statusCode, {
      type: err.name,
      details: {
        ...err.details,
        ...(process.env.NODE_ENV !== "production" &&
          {
            // stack: err.stack,
          }),
      },
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return HttpResponse.error(
      res,
      "Validation Error",
      StatusCodes.BAD_REQUEST,
      {
        type: "ValidationError",
        details: err.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      }
    );
  }

  // Handle JWT errors
  if (err instanceof Error && err.name === "JsonWebTokenError") {
    return HttpResponse.error(res, "Invalid Token", StatusCodes.UNAUTHORIZED, {
      type: "AuthenticationError",
    });
  }

  // Handle custom AppErrors
  if (err instanceof AppError) {
    return HttpResponse.error(res, err.message, err.statusCode, {
      type: err.type || err.name,
      details: err.details,
    });
  }

  // Handle generic errors
  if (err instanceof Error) {
    return HttpResponse.error(
      res,
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        type: "InternalError",
        details: process.env.NODE_ENV === "production" ? undefined : err,
        exposeStack: true,
      }
    );
  }

  // Handle unknown error types
  return HttpResponse.error(
    res,
    "Unknown Error Occurred",
    StatusCodes.INTERNAL_SERVER_ERROR
  );
};
