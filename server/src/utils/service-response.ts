import { Response } from "express";
import { StatusCodes } from "../config/constants.js";

type SuccessResponse<T> = {
  success: true;
  code: number;
  data: T;
  timestamp: string;
};

type ErrorResponse = {
  success: false;
  code: number;
  error: string;
  type?: string;
  details?: any;
  timestamp: string;
};

export class HttpResponse {
  static send<T>(
    res: Response,
    data: T,
    code: number = StatusCodes.OK
  ): Response<SuccessResponse<T>> {
    return res.status(code).json({
      success: true,
      code,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static error(
    res: Response,
    message: string,
    code: number = StatusCodes.INTERNAL_SERVER_ERROR,
    options: {
      type?: string;
      details?: any;
      exposeStack?: boolean;
    } = {}
  ): Response<ErrorResponse> {
    const isProduction = process.env.NODE_ENV === "production";

    const response: ErrorResponse = {
      success: false,
      code,
      error: message,
      type: options.type,
      timestamp: new Date().toISOString(),
    };

    if (options.details) {
      response.details = { ...options.details };
      delete response.details.stack; // Explicitly remove stack
    }

    if (!isProduction && options.details) {
      response.details = options.details;
    }

    // Include stack trace only in development and if explicitly asked for
    if (!isProduction && options.exposeStack && options.details?.stack) {
      response.details = {
        ...response.details,
        stack: options.details.stack,
      };
    }

    return res.status(code).json(response);
  }

  static handleResult<T>(
    res: Response,
    result: T | Error,
    successCode: number = StatusCodes.OK
  ) {
    if (result instanceof Error) {
      const statusCode =
        "statusCode" in result
          ? result.statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;
      this.error(res, result.message, statusCode as number, {
        type: result.name,
        details: result,
        exposeStack: false,
      });
    } else {
      this.send(res, result, successCode);
    }
  }
}
