import express, { NextFunction, Request, Response } from "express";
import { UserController } from "../controllers/user.controller";
import {
  loginUserValidator,
  createUserValidator,
  validateRequest,
} from "../validators/user.validator";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *           format: int64
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         githubAccountId:
 *           type: integer
 *           format: int64
 *         folderId:
 *           type: integer
 *           format: int64
 */

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: User signup
 *     description: Create a new user and return an access token.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       '201':
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "jwt_token_here"
 *                 userId:
 *                   type: integer
 *                   format: int64
 *                   example: 1
 *                 totalStorage:
 *                   type: number
 *                   example: 0
 *                 usedStorage:
 *                   type: number
 *                   example: 0
 *                 folderId:
 *                   type: integer
 *                   format: int64
 *                   example: 1
 *       '409':
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User already exists"
 *       '503':
 *         description: Service unavailable (GitHub account creation limit reached)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account creation limit reached. Please try again in a few days."
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */
router.post(
  "/signup",
  createUserValidator, // Custom middleware for validation
  validateRequest, // Custom middleware to handle request validation errors
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Call the actual user creation method
      await UserController.createUser(req, res);
    } catch (err) {
      next(err); // If an error occurs, pass it to the global error handler
    }
  }
);
/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user and return an access token.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       '200':
 *         description: Login successful, returns an access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "jwt_token_here"
 *                 userId:
 *                   type: integer
 *                   format: int64
 *                   example: 1
 *                 totalStorage:
 *                   type: number
 *                   example: 10
 *                 usedStorage:
 *                   type: number
 *                   example: 5
 *                 folderId:
 *                   type: integer
 *                   format: int64
 *                   example: 1
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       '401':
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid Email or Password"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */
router.post(
  "/login",
  loginUserValidator, // Custom middleware for login validation
  validateRequest, // Custom middleware to handle validation errors
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Call the actual login method
      await UserController.login(req, res);
    } catch (err) {
      next(err); // If an error occurs, pass it to the global error handler
    }
  }
);
export default router;
