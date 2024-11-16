import express, { Request, Response } from 'express';
// import { FileController } from '../controllers/file.controller';
// import { FolderController } from '../controllers/folder.controller';
import { DownloadService } from '../services/download.service';
import { DownloadRequest } from '../types/downloadRequest';
import auth from '../middlewares/auth.middleware';

// async function getFile(downloadRequest: DownloadRequest) {
//     return new DownloadService(downloadRequest)
// }
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


router.get("/file",auth, async (req: Request, res: Response) => {
    const { userId, fileId } = req.body;
  
    try {
      if(!userId || !fileId) {
        res.status(400).json({ message: "Missing userId or fileId" });
        return;
      }
      // Create a download request object
      const downloadRequest: DownloadRequest = {
        userId: BigInt(userId),
        fileId: BigInt(fileId),
        githubAccount: req.body.githubAccount,
      };
  
      // Initialize the DownloadService
      const downloadService = new DownloadService(downloadRequest);
  
  
      // Get the file stream from the service and pipe it to the response
       await downloadService.downloadFile(res);
     
    } catch (error) {
      console.error("Error in file download route:", error);
    //   res.status(500).json({ message: "Failed to download file", error });
      res.end(JSON.stringify({ success: false, message: 'File transfer failed', error }));
    }
  });
/**
 * @swagger
 * /files:
 *   get:
 *     summary: Retrieve multiple files in a folder
 *     description: Get a list of all files in folder for the authenticated user.
 *     tags:
 *       - Files
 *     parameters:
 *       - in: query
 *         name: folderId
 *         description: Unique ID of the folder to find files.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *     responses:
 *       '200':
 *         description: A list of files
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/File'
 *       '401':
 *         description: Unauthorized access
 *       '500':
 *         description: Internal server error
 */
//  router.get('/files', FileController.getFiles);



/**
 * @swagger
 * /files:
 *   post:
 *     summary: Upload a single or multiple files
 *     description: Upload one or more files for the authenticated user.
 *     tags:
 *       - Files
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               folderId:
 *                 type: integer
 *                 format: int64
 *                 required: true
 *               size:
 *                 type: integer
 *                 format: int64
 *                 required: true
 *     responses:
 *       '201':
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadedFiles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/File'
 *       '400':
 *         description: Invalid file type or size
 *       '401':
 *         description: Unauthorized access
 *       '500':
 *         description: Internal server error
 */
// router.post('/files', FileController.uploadFiles);

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
// router.delete('/files', FileController.deleteFiles);

/**
 * @swagger
 * /files/{fileId}:
 *   put:
 *     summary: Update a file
 *     description: Update the content of a file (resume) for the authenticated user.
 *     tags:
 *       - Files
 *     parameters:
 *       - in: path
 *         name: fileId
 *         description: Unique ID of the file to update.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *     requestBody:
 *       required: true
 *       content:
 *         binary:
 *           schema:
 *             type: string
 *             format: binary
 *     responses:
 *       '200':
 *         description: File updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updatedFile:
 *                   $ref: '#/components/schemas/File'
 *       '400':
 *         description: Invalid file content
 *       '401':
 *         description: Unauthorized access
 *       '404':
 *         description: File not found
 *       '500':
 *         description: Internal server error
 */
// router.put('/files/:fileId', FileController.updateFile);


export default router;