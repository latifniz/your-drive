const { query, param, header,body, validationResult } = require('express-validator');
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/ApiResponse';

// File Upload Validator
export const uploadFileValidator = [
    query('folderId')
      .notEmpty().withMessage('folderId is required')
      .isNumeric().withMessage('folderId must be a number'),
  
    header('x-file-size')
      .notEmpty().withMessage('x-file-size header is required')
      .isNumeric().withMessage('x-file-size must be a number'),
];

// File Download Validator
export const downloadFileValidator = [
  param('fileId')
    .notEmpty().withMessage('fileId is required')
    .isNumeric().withMessage('fileId must be a number'),

  param('folderId')
    .notEmpty().withMessage('folderId is required')
    .isNumeric().withMessage('folderId must be a number'),
];

// File Resume Validator
export const resumeFileValidator = [
  param('fileId')
    .notEmpty().withMessage('fileId is required')
    .isNumeric().withMessage('fileId must be a number'),

  header('x-file-name')
    .notEmpty().withMessage('x-file-name header is required')
    .isString().withMessage('x-file-name must be a string'),
];

// Validator for deleting files
export const deleteFileValidator = [
  // Check if 'fileIds' is present in body
  body('fileIds')
    .exists({ checkFalsy: true })
    .withMessage('fileIds is required')
    .isArray()
    .withMessage('fileIds must be an array')
    .custom((fileIds:any[]) => {
      // Convert values in the array to numbers or bigints and validate
      const isValid = fileIds.every((id: any) => {
        // Try to convert to bigint or number
        const idAsNumber = Number(id);
        return !isNaN(idAsNumber);
      });

      if (!isValid) {
        throw new Error('Each fileId must be a valid number or bigint');
      }

      return true;
    })
    .withMessage('Each fileId must be a valid number or bigint')
    .notEmpty()
    .withMessage('fileIds array cannot be empty'),
];
// Validation result middleware
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json(
      new ApiResponse(400, {
        errors: errors.array(),
      })
    );
    return;
  }
  next();
};
