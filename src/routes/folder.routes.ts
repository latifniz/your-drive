import express from 'express';
import { FolderController } from '../controllers/folder.controller';
import auth from '../middlewares/auth.middleware';
import { CreateFolderRules, DeleteFolderRules, getFolderRules, getFoldersRules, RenameFolderRules, validateRequest } from '../validators/folder.validator';
import { asyncHandler } from '../utils/asyncHandler';
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
 *           format: int64
 *         userId:
 *           type: integer
 *           format: int64
 *         folderName:
 *           type: string
 *         parentId:
 *           type: integer
 *           format: int64
 *           nullable: true
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
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 */


/**
 * @swagger
 * /folders/{parentId}:
 *   get:
 *     summary: Retrieve multiple folders
 *     description: Get a list of all folders for the authenticated user.
 *     tags:
 *        - Folders
 *     parameters:
 *       - in: path
 *         name: parentId
 *         description: Unique ID of the parent folder to find folders.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *     responses:
 *       '200':
 *         description: A list of folders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Folder'
 *       '401':
 *         description: Unauthorized access
 *       '404':
 *         description: Folder not found
 *       '500':
 *         description: Internal server error
 */
 router.get('/folders/:parentId',
           auth,
           getFoldersRules, 
           validateRequest,
           FolderController.doParentFolderExitst,
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
router.post('/folder/create',
            auth,
            CreateFolderRules, 
            validateRequest,
            FolderController.doParentFolderExitst,
            asyncHandler(FolderController.createFolder)
);

/**
 * @swagger
 * /folder/{folderId}:
 *   get:
 *     summary: Retrieve a single folder
 *     description: Get a single folder by ID.
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
 *       '200':
 *         description: A single folder
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Folder'
 *       '401':
 *         description: Unauthorized access
 *       '404':
 *         description: Folder not found
 *       '500':
 *         description: Internal server error
 */
router.get('/folder/:folderId',
            auth,
            getFolderRules, 
            validateRequest,
            FolderController.doParentFolderExitst,
            asyncHandler(FolderController.getFolderById)
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
router.put('/folder/rename',
           auth,
           RenameFolderRules, 
           validateRequest,
           FolderController.doParentFolderExitst,
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
router.delete('/folder/delete/:folderId',
            auth,
            DeleteFolderRules, 
            validateRequest,
            FolderController.doParentFolderExitst,
            asyncHandler(FolderController.deleteFolderById)
);
export default router