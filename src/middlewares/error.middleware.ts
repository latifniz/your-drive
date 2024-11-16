import { Request, Response, NextFunction } from "express";
import { ValidationError } from "sequelize"; // Import Sequelize validation error
import { ApiError } from "../utils/ApiError"; // Adjust the path to your ApiError class
import logger from "../logger/winston.logger"; // Adjust the path to your logger
// import { removeUnusedMulterImageFilesOnError } from "../path/to/your/utils"; // Adjust the path to your utility function

/**
 *
 * @param {Error | ApiError} err
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @description This middleware is responsible to catch the errors from any request handler wrapped inside the {@link asyncHandler}
 */
const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error: ApiError; 

  // Check if the error is an instance of an ApiError class which extends native Error class
  if (!(err instanceof ApiError)) {
    // If not, create a new ApiError instance to keep the consistency

    // Assign an appropriate status code
    const statusCode = err instanceof ValidationError ? 400 : 500;

    // Set a message from native Error instance or a custom one
    const message = err.message || "Something went wrong";
    error = new ApiError(statusCode, message, (err as any).errors || [], err.stack);
  }
  else error = err;

  // Now we are sure that the `error` variable will be an instance of ApiError class
  const response = {
    ...error,
    message: error.message,
    ...(process.env["NODE_ENV"] === "development" ? { stack: error.stack } : {}), // Error stack traces should be visible in development for debugging
  };

  logger.error(`${error.message}`);

//   removeUnusedMulterImageFilesOnError(req);
  
  // Send error response
  return res.status(error.statusCode).json(response);
};

export { errorHandler };
