const { body, validationResult } = require('express-validator');

import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/ApiResponse';

// Create User Validator
export const createUserValidator = [
  body('username')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .notEmpty().withMessage('Username is required'),

  body('email')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .notEmpty().withMessage('Password is required')
];

// Login User Validator
export const loginUserValidator = [
  body('email')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .notEmpty().withMessage('Password is required')
];

// Validation result middleware
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      res.status(400).json(new ApiResponse(400,{
      errors: errors.array(),
    }));
    return;
  }
  next();
};
