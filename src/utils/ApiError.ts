import { errorHandler } from "../middlewares/error.middleware"; // Adjust the path as necessary

/**
 * @description Common Error class to throw an error from anywhere.
 * The {@link errorHandler} middleware will catch this error at the central place and it will return an appropriate response to the client
 */
class ApiError extends Error {
  public statusCode: number;
  public data: any | null;
  public success: boolean;
  public error: any;
  
  /**
   * 
   * @param {number} statusCode
   * @param {string} message
   * @param {any} error
   * @param {string} stack
   */
  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    error: any = '',
    stack: string = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.error = error;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
