import express from 'express';
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
 *         id:
 *           type: integer
 *           format: int64
 *         name:
 *           type: string
 *         parentId:
 *           type: integer
 *           format: int64
 */ 

/**
 * @swagger
 * /folders:
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
 *       '500':
 *         description: Internal server error
 */
// router.get('/folders', FolderController.getAllFolders);

/**
 * @swagger
 * /folders:
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
 *       '500':
 *         description: Internal server error
 */
// router.post('/folders', FolderController.createFolder);

/**
 * @swagger
 * /folders/{folderId}:
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
// router.get('/folders/:folderId', FolderController.getFolderById);

/**
 * @swagger
 * /folders/{folderId}:
 *   put:
 *     summary: Update a folder
 *     description: Update a single folder by ID.
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
// router.put('/folders/:folderId', FolderController.updateFolder);

/**
 * @swagger
 * /folders/{folderId}:
 *   delete:
 *     summary: Delete a folder
 *     description: Delete a single folder by ID.
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
export default router