import { NextFunction, Request, Response } from "express";
import { ApiResponseService } from "../services/response.service.js";

export const requireAdmin = (
  req: Request & { context: { user: any } },
  res: Response,
  next: NextFunction
) => {
  if (!req.context?.user) {
    return ApiResponseService.error(res, "Authentication required", 401);
  }

  // console.log("role : ", req.context.user.role);

  if (
    req.context.user.role !== "ADMIN" &&
    req.context.user.role !== "SUPER_ADMIN"
  ) {
    return ApiResponseService.error(
      res,
      "Admin Or SuperAdmin access required",
      403
    );
  }

  next();
};
