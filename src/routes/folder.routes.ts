import express from "express";
import { FolderController } from "../controllers/folder.controller";
import auth from "../middlewares/auth.middleware";
import {
  CreateFolderRules,
  DeleteFolderRules,
  getFoldersRules,
  RenameFolderRules,
  validateRequest,
} from "../validators/folder.validator";
import { asyncHandler } from "../utils/asyncHandler";
import { authorizeFolderAccess } from "../middlewares/folder.middleware";
// import { FolderController } from '../controllers/folder.controller';

const router = express.Router();

// ==================================
//          FOLDER ROUTES
// ==================================

/**
 * @swagger
 * components:
 *   schemas:
 *     Folder:
 *       type: object
 *       properties:
 *         folderId:
 *           type: integer
 *         folderName:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         trashedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     File:
 *       type: object
 *       properties:
 *         fileId:
 *           type: integer
 *         folderId:
 *           type: integer
 *         originalFilename:
 *           type: string
 *         totalSize:
 *           type: integer
 *           format: int64
 *         createdAt:
 *           type: string
 *           format: date-time
 *         trashedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 */

/**
 * @swagger
 * /folders/{parentId}:
 *   get:
 *     summary: Retrieve folders and files
 *     description: Get folders and files for the given parent folder.
 *     tags:
 *       - Folders
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *     responses:
 *       '200':
 *         description: A list of folders and files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 folders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Folder'
 *                 files:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/File'
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Not Found
 *       '500':
 *         description: Internal Server Error
 */

router.get(
  "/folders/:parentId",
  auth,
  getFoldersRules,
  validateRequest,
  authorizeFolderAccess,
  asyncHandler(FolderController.getAllFoldersByParentId)
);

/**
 * @swagger
 * /folder/create:
 *   post:
 *     summary: Create a new folder
 *     description: Create a new folder for the authenticated user.
 *     tags:
 *        - Folders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *               parentId:
 *                 type: integer
 *                 format: int64
 *                 required: true
 *     responses:
 *       '201':
 *         description: Folder created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Folder'
 *       '400':
 *         description: Invalid folder name or parent folder ID
 *       '401':
 *         description: Unauthorized access
 *       '409':
 *         description: Folder already exists in the parent folder
 *       '500':
 *         description: Internal server error
 */
// needs parent id in req.body
router.post(
  "/folder/create",
  auth,
  CreateFolderRules,
  validateRequest,
  authorizeFolderAccess,
  asyncHandler(FolderController.createFolder)
);

/**
 * @swagger
 * /folder/rename:
 *   put:
 *     summary: Update a folder (Rename folder)
 *     description: Update a single folder by ID.
 *     tags:
 *       - Folders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newName:
 *                 type: string
 *                 required: true
 *               folderId:
 *                 type: integer
 *                 format: int64
 *                 required: true
 *     responses:
 *       '200':
 *         description: Folder updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Folder'
 *       '400':
 *         description: Invalid folder name or parent folder ID
 *       '401':
 *         description: Unauthorized access
 *       '404':
 *         description: Folder not found
 *       '500':
 *         description: Internal server error
 */
router.put(
  "/folder/rename",
  auth,
  RenameFolderRules,
  validateRequest,
  authorizeFolderAccess,
  asyncHandler(FolderController.renameFolder)
);

/**
 * @swagger
 * /folder/delete/{folderId}:
 *   delete:
 *     summary: Delete a folder and children folders and their files
 *     description: Delete a single folder by ID. (all files inside will be deleted)
 *     tags:
 *       - Folders
 *     parameters:
 *       - in: path
 *         name: folderId
 *         description: Unique folder ID.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *     responses:
 *       204:
 *         description: Folder deleted successfully
 *       '401':
 *         description: Unauthorized access
 *       '404':
 *         description: Folder not found
 *       '500':
 *         description: Internal server error
 */
router.delete(
  "/folder/delete/:folderId",
  auth,
  DeleteFolderRules,
  validateRequest,
  authorizeFolderAccess,
  asyncHandler(FolderController.deleteFolderById)
);

export default router;
