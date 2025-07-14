import { Response } from "express";

export class ApiResponseService {
  static success(
    res: Response,
    data: any,
    message: string = "Success",
    statusCode: number = 200
  ) {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(
    res: Response,
    message: string = "Error occurred",
    statusCode: number = 500,
    errors?: any[]
  ) {
    res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  static unauthorized(res: Response, message: string = "Unauthorized") {
    this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = "Forbidden") {
    this.error(res, message, 403);
  }
}
