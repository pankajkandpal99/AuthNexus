import { NextFunction, Request, RequestHandler, Response } from "express";
import { RequestContext } from "../middleware/context.js";
import { ParsedQs } from "qs";
import { ZodSchema } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { HttpResponse } from "../utils/service-response.js";
import { TransactionHooks } from "../hooks/transactions.js";
import {
  EnhancedUploadOptions,
  FileUploadHooks,
} from "../hooks/file-upload-hook.js";
import { requireAdmin } from "../middleware/admin-auth.js";
import { paramExtractorMiddleware } from "../middleware/param-extractor.middleware.js";
import { requireSuperAdmin } from "@/middleware/super-admin-auth.js";

export type ApiHandlerOptions = {
  bodySchema?: ZodSchema;
  querySchema?: ZodSchema;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  useTransaction?: boolean;
  auditLog?: boolean;
  fileUpload?: {
    enabled: boolean;
    options?: Partial<EnhancedUploadOptions>;

    // Add multipart-specific options
    convertTextToJson?: boolean;
    validateBeforeAuth?: boolean;
  };
};

export function createApiHandler(
  handler: (context: RequestContext) => Promise<any>,
  options: ApiHandlerOptions = {}
): RequestHandler[] {
  const middlewares: RequestHandler[] = [];
  middlewares.push(paramExtractorMiddleware() as RequestHandler);

  middlewares.push((req, res, next) => {
    req.params = req.params || {};
    next();
  });

  middlewares.push((req, res, next) => {
    if (!req.params) {
      req.params = {};
    }

    next();
  });

  if (options.fileUpload?.enabled && options.fileUpload?.validateBeforeAuth) {
    middlewares.push(
      async (req: Request, res: Response, next: NextFunction) => {
        const context = (req as any).context;

        try {
          const uploadOptions = {
            ...options.fileUpload?.options,
            convertTextToJson: options.fileUpload?.convertTextToJson !== false, // Default to true
          };

          await FileUploadHooks.processFileUpload(context, uploadOptions);
          next();
        } catch (error) {
          HttpResponse.error(
            res,
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
            400,
            {
              type: "FileUploadError",
              details:
                process.env.NODE_ENV === "production" ? undefined : error,
            }
          );
        }
      }
    );
  }

  if (options.requireAuth !== false) {
    middlewares.push(requireAuth as RequestHandler);
  }

  if (options.requireAdmin) {
    middlewares.push(requireAdmin as RequestHandler);
  }

  // Handle file uploads after auth if validateBeforeAuth is false
  if (options.fileUpload?.enabled && !options.fileUpload?.validateBeforeAuth) {
    middlewares.push(
      async (req: Request, res: Response, next: NextFunction) => {
        const context = (req as any).context;

        try {
          const uploadOptions = {
            ...options.fileUpload?.options,
            convertTextToJson: options.fileUpload?.convertTextToJson !== false, // Default to true
          };

          await FileUploadHooks.processFileUpload(context, uploadOptions);
          next();
        } catch (error) {
          HttpResponse.error(
            res,
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
            400,
            {
              type: "FileUploadError",
              details:
                process.env.NODE_ENV === "production" ? undefined : error,
            }
          );
        }
      }
    );
  }

  if (options.bodySchema || options.querySchema) {
    middlewares.push(
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          if (options.bodySchema) {
            req.body = await options.bodySchema.parseAsync(req.body);
          }
          if (options.querySchema) {
            req.query = (await options.querySchema.parseAsync(
              req.query
            )) as ParsedQs;
          }
          next();
        } catch (error) {
          HttpResponse.error(res, "Validation failed", 400, {
            type: "ValidationError",
            details: error,
          });
        }
      }
    );
  }

  middlewares.push(async (req: Request, res: Response) => {
    const context = (req as unknown as { context: RequestContext }).context;
    let transactionStarted = false;

    try {
      if (options.useTransaction) {
        await TransactionHooks.startTransaction(context);
        transactionStarted = true;
      }

      const result = await handler(context);

      if (!res.headersSent) {
        if (result && typeof result === "object" && "success" in result) {
          if (result.success) {
            HttpResponse.send(res, result.data, result.code);
          } else {
            HttpResponse.error(res, result.error.message, result.code || 500, {
              type: result.error.name,
              details:
                process.env.NODE_ENV === "production"
                  ? undefined
                  : { stack: result.error.stack },
            });
          }
        } else if (result !== undefined) {
          HttpResponse.send(res, result);
        } else {
          HttpResponse.send(res, { success: true });
        }
      }

      if (transactionStarted) {
        await TransactionHooks.commitTransaction(context);
      }
    } catch (error) {
      if (transactionStarted) {
        await TransactionHooks.rollbackTransaction(context);
      }

      if (!res.headersSent) {
        if (error instanceof Error) {
          const statusCode = "statusCode" in error ? error.statusCode : 500;
          HttpResponse.error(res, error.message, statusCode as number, {
            type: error.name,
            details:
              process.env.NODE_ENV === "production"
                ? undefined
                : { stack: error.stack },
          });
        } else {
          HttpResponse.error(res, "An unknown error occurred", 500, {
            type: "UnknownError",
            details:
              process.env.NODE_ENV === "production"
                ? undefined
                : { message: String(error) },
          });
        }
      }
    }
  });

  return middlewares;
}
