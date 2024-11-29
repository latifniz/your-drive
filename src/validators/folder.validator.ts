const { body, param ,validationResult} = require('express-validator');
import { Request, Response, NextFunction } from "express";

export const CreateFolderRules = [
  body('name')
    .isString()
    .withMessage('Folder name must be a string.')
    .notEmpty()
    .withMessage('Folder name is required.')
    .isLength({ max: 255 })
    .withMessage('Folder name must be less than 255 characters.'),
  
  body('parentId')
    .notEmpty()
    .withMessage('ParentId is required.')
    .isInt({ min: 0 })
    .withMessage('Parent folder ID must be a valid integer.')
];

export const RenameFolderRules = [
    body('newName')
      .isString()
      .withMessage('New folder name must be a string.')
      .notEmpty()
      .withMessage('New folder name is required.')
      .isLength({ max: 255 })
      .withMessage('New folder name must be less than 255 characters.'),
  
    body('folderId')
      .isInt({ min: 1 })
      .withMessage('Folder ID must be a valid positive integer.')
];

export const DeleteFolderRules = [
    param('folderId')
      .isInt({ min: 1 })
      .withMessage('Folder ID must be a valid positive integer.')
      .notEmpty()
      .withMessage('FolderId is required.')
];

export const getFoldersRules = [
    param('parentId')
      .isInt({ min: 1 })
      .withMessage('Parent folder ID must be a valid integer.')
      .notEmpty()
      .withMessage('ParentId is required.')
];


export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     res.status(400).json({
      errors: errors.array()
    });
    return;
  }
  next();
};
