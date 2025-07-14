import { NextFunction, Request, Response } from "express";
import { ApiResponseService } from "../services/response.service.js";

export const requireSuperAdmin = (
  req: Request & { context: { user: any } },
  res: Response,
  next: NextFunction
) => {
  if (!req.context?.user) {
    return ApiResponseService.error(res, "Authentication required", 401);
  }

  if (req.context.user.role !== "SUPER_ADMIN") {
    return ApiResponseService.error(res, "Super Admin access required", 403);
  }

  next();
};
