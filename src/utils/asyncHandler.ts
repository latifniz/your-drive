import { Request, Response, NextFunction } from "express";

/**
 * @description Middleware to handle asynchronous request handlers.
 * This middleware ensures that any errors thrown in the async request handler 
 * are caught and passed to the next error handler.
 *
 * @param requestHandler - The request handler function that may return a Promise or void.
 * @returns A function that handles the request, response, and optionally the next middleware.
 */
const asyncHandler = (
  requestHandler: (req: Request, res: Response, next: NextFunction) => void
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Wrap the request handler in a Promise and catch any errors
    Promise.resolve(requestHandler(req, res, next)).catch(err => next(err));
  };
};

export { asyncHandler };
