import { StatusCodes } from "../config/constants.js";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = StatusCodes.BAD_REQUEST,
    public type?: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
