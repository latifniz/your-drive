import express from "express";
import { upload as uploadMiddleware } from "../middlewares/multer.middleware";
import auth from "../middlewares/auth.middleware";
import {
  deleteFileValidator,
  downloadFileValidator,
  resumeFileValidator,
  uploadFileValidator,
  validateRequest,
} from "../validators/file.validator";
import {
  authorizeFileAccess,
  canUploadThisFile,
} from "../middlewares/file.middleware";
import { FileController } from "../controllers/file.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { authorizeFolderAccess } from "../middlewares/folder.middleware";
const router = express.Router();

// ==================================
//          FILE ROUTES
// ==================================

/**
 * @swagger
 * tags:
 *   - name: Files
 *     description: File management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     File:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *         name:
 *           type: string
 *         folderId:
 *           type: integer
 *           format: int64
 *         size:
 *            type: integer
 *            format: int64
 */

/**
 * @swagger
 * /file/download/{folderId}/{fileId}:
 *   get:
 *     summary: Download a file
 *     description: Download a file from the server based on the file ID.
 *     tags:
 *       - Files
 *     parameters:
 *       - in: path
 *         name: fileId
 *         description: Unique ID of the file to download
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: Authorization
 *         description: Bearer token for authentication
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer your-access-token"
 *     responses:
 *       '200':
 *         description: File downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       '400':
 *         description: Bad request, fileId is missing or invalid
 *       '401':
 *         description: Unauthorized access, invalid or missing access token
 *       '500':
 *         description: Internal server error
 */

router.get(
  "/file/download/:folderId/:fileId",
  auth,
  downloadFileValidator,
  validateRequest,
  authorizeFolderAccess,
  authorizeFileAccess,
  asyncHandler(FileController.download)
);

/**
 * @swagger
 * /file/upload/{fileId}:
 *   post:
 *     summary: Upload a single file
 *     description: Upload a file for the authenticated user.
 *     tags:
 *       - Files
 *     parameters:
 *       - in: path
 *         name: fileId
 *         description: Unique ID of the file to download (for resuming uploads)
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: folderId
 *         description: ID of the folder where the file should be uploaded
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *       - in: header
 *         name: Authorization
 *         description: Bearer token for authentication
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer your-access-token"
 *       - in: header
 *         name: X-File-Size
 *         description: Size of the file being uploaded (in bytes)
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '201':
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadedFile:
 *                   type: object
 *                   items:
 *                     $ref: '#/components/schemas/File'
 *       '400':
 *         description: Invalid request, such as missing folderId or X-File-Size
 *       '401':
 *         description: Unauthorized access
 *       '500':
 *         description: Internal server error
 */

router.post(
  "/file/upload/:fileId?",
  auth,
  uploadFileValidator,
  validateRequest,
  authorizeFolderAccess,
  canUploadThisFile,
  uploadMiddleware,
  asyncHandler(FileController.upload)
);

/**
 * @swagger
 * /files:
 *   delete:
 *     summary: Delete one or more files
 *     description: Deletes files based on the provided file IDs.
 *     tags:
 *       - Files
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   format: int64
 *               folderId:
 *                 type: integer
 *                 format: int64
 *     responses:
 *       204:
 *         description: Files deleted successfully
 *       400:
 *         description: Bad request, invalid input
 *
 *       404:
 *         description: No files found to delete
 *       500:
 *         description: Internal server error
 */

router.delete(
  "/files",
  auth,
  deleteFileValidator,
  validateRequest,
  authorizeFolderAccess,
  authorizeFileAccess,
  asyncHandler(FileController.delete)
);

/**
 * @swagger
 * /files/{fileId}/resume:
 *   get:
 *     summary: Resume file upload
 *     description: This route allows the client to resume the upload of a file by checking how many bytes have been uploaded so far.
 *     tags:
 *       - Files
 *     parameters:
 *       - in: path
 *         name: fileId
 *         description: Unique identifier of the file to resume upload for.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *       - in: header
 *         name: x-file-name
 *         description: The file name as part of the request headers. It is used to fetch the specific file's progress.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: File resume details including the bytes uploaded.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bytesUploaded:
 *                   type: integer
 *                   description: Number of bytes uploaded for the file.
 *       '404':
 *         description: File not found or file progress could not be determined.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bytesUploaded:
 *                   type: integer
 *                   description: Number of bytes uploaded (0 if no progress found).
 *       '500':
 *         description: Internal server error, possibly due to a failure in retrieving the file resume.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 */

router.get(
  "/file/resume/:fileId",
  auth,
  resumeFileValidator,
  validateRequest,
  authorizeFolderAccess,
  authorizeFileAccess,
  asyncHandler(FileController.resume)
);

export default router;
