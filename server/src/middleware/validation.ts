import { RequestHandler } from "express";
import { ZodError, ZodSchema } from "zod";
import { StatusCodes } from "../config/constants.js";
import { HttpResponse } from "../utils/service-response.js";

type ValidationSchema = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

export const validateRequest = (schemas: ValidationSchema): RequestHandler => {
  return async (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        HttpResponse.error(res, "Validation Error", StatusCodes.BAD_REQUEST, {
          type: "ValidationError",
          details: error.errors,
          exposeStack: false,
        });
      } else {
        next(error);
      }
    }
  };
};
