import { Response } from "express";
import { HttpResponse } from "./service-response.js";

export type Result<T, E = Error> =
  | { success: true; data: T; code?: number }
  | { success: false; error: E; code?: number };

export const tryCatch = async <T>(
  fn: () => Promise<T>,
  errorHandler?: (error: unknown) => Error
): Promise<Result<T>> => {
  try {
    const data = await fn();
    return { success: true, data, code: 200 };
  } catch (error) {
    return {
      success: false,
      error: errorHandler
        ? errorHandler(error)
        : error instanceof Error
          ? error
          : new Error(String(error)),
      code:
        error instanceof Error && "statusCode" in error
          ? (error.statusCode as number)
          : 500,
    };
  }
};

export const handleResult =
  (res: Response) =>
  async <T>(result: Result<T>) => {
    if (res.headersSent) {
      // console.log("⚠️ Response already sent, skipping duplicate response");
      return;
    }

    if (result.success) {
      // console.log("Sending success response...");
      return HttpResponse.send(res, result.data, result.code);
    } else {
      // console.log("Sending error response...");
      return HttpResponse.error(res, result.error.message, result.code || 500, {
        type: result.error.name,
        details:
          process.env.NODE_ENV === "production"
            ? undefined
            : { stack: result.error.stack },
      });
    }
  };

export const pipeAsync =
  (...fns: Function[]) =>
  async (x: any) => {
    return fns.reduce(async (v, f) => f(await v), Promise.resolve(x));
  };

export const tapAsync =
  (fn: (x: any) => Promise<void> | void) => async (x: any) => {
    await fn(x);
    return x;
  };
