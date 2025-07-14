import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiResponseService } from "../services/response.service.js";
import { env } from "../config/env.js";
import { ROLE } from "../config/constants.js";

export const requireAuth = (
  req: Request & { context: { user: any } },
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return ApiResponseService.error(res, "Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];
  // console.log("token in server : ", token);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      email?: string;
      role?: ROLE;
    };

    // Add user to request context
    req.context.user = {
      id: decoded.userId,
      email: decoded.email || "",
      role: decoded.role || "USER",
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return ApiResponseService.error(res, "Token expired", 401);
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return ApiResponseService.error(res, "Invalid token", 403);
    }
    return ApiResponseService.error(res, "Authentication failed", 500);
  }
};
