import express, { Request, Response } from 'express';
import { upload } from '../middlewares/multer.middleware';
import { DownloadService } from '../services/download.service';
import { DownloadRequest } from '../types/downloadRequest';
import auth from '../middlewares/auth.middleware';
import { FileService } from '../services/file.service';
import { downloadFileValidator, resumeFileValidator, uploadFileValidator, validateRequest } from '../validators/file.validator';
import { canUploadThisFile } from '../middlewares/file.middleware';
import { ApiResponse } from '../utils/ApiResponse';

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
 * /file/download/{fileId}:
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

router.get("/file/download/:folderId/:fileId",auth, downloadFileValidator,validateRequest, async (req: Request, res: Response) => {
   
    const { fileId, folderId } = req.params;
  
    try {
      if(!fileId || !folderId ) {
        res.status(400).json({ message: "Missing userId or fileId" });
        return;
      }
      // Create a download request object
      const downloadRequest: DownloadRequest = {
        userId: BigInt(req.body.user.userId),
        fileId: BigInt(fileId),
        folderId: BigInt(folderId),
        githubAccount: req.body.githubAccount,
      };
  
      // Initialize the DownloadService
      const downloadService = new DownloadService(downloadRequest);
  
  
      // Get the file stream from the service and pipe it to the response
       await downloadService.downloadFile(res,req);
     
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
 *       '206':
 *        description: Sending partial file content (stream) 
 *       '401':
 *         description: Unauthorized access
 *       '406':
 *          'description': Requested Range Not Satisfiable 
 *       '404':
 *         description: Account not found
 *       '500':
 *         description: Internal server error
 */
//  router.get('/files', FileController.getFiles);



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


router.post('/file/upload/:fileId?',auth, uploadFileValidator,validateRequest,canUploadThisFile,upload, (req: Request, res: Response) => {
  res.status(200).json(new ApiResponse(200, {
     message: 'File uploaded successfully!',
     fileId: req.body.fileId
  }))
});



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


router.get("/file/resume/:fileId",auth, resumeFileValidator,validateRequest, async(req: Request, res: Response) => {
      try {
         const fileId = req.params['fileId'] as unknown as bigint;
        
         const fileName = req.headers['x-file-name'] as string;
         const bytes =  await FileService.getFileBytesIfExists(fileId,fileName);
         if(bytes) {
            res.status(200).json({bytesUploaded : bytes});
            return;
         }
          res.status(404).json({bytesUploaded : 0});
      } catch(err) {
        console.error('Error in file resume route:', err);
        res.status(500).json({ message: 'Failed to retrieve file resume', });
      }
})

export default router;