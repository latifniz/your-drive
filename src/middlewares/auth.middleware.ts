import { Response, NextFunction, Request } from "express";
import { UserModel } from "../models/index";
import { GitHubAccountService } from "../services/github_account.service";
import jwt from 'jsonwebtoken'; // Use jsonwebtoken for verifying and decoding the token
import { config } from "../config/config";

// Secret key for JWT (you should ideally store this in an environment variable)
const JWT_SECRET_KEY = config.jwt_secret;

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(' ')[1]; // Expected format: "Bearer <token>"

    // Validate token existence
    if (!token) {
      res.status(400).json({ error: "Missing authorization token" });
      return;
    }

    // Verify the token and extract the payload (which contains the user info)
    type tokenType  = {
      userId: bigint;
      userName: string;
    }
    const decoded = jwt.verify(token, JWT_SECRET_KEY) as tokenType;
    console.log(decoded);
    if (!decoded  && typeof decoded == "object" || !decoded.userId) {
       res.status(401).json({ error: "Invalid or expired token" });
       return;
    }

    // Extract userId from the decoded token
    const userId = decoded.userId;

    // Find the user by userId
    const user = await UserModel.findOne({ where: { userId } });

    if (!user) {
       res.status(404).json({ error: "User not found" });
       return;
    }

    // Find the GitHub account associated with the user
    const githubAccount = await GitHubAccountService.findAccountById(user!.dataValues.githubAccountId!);

    if (!githubAccount) {
       res.status(404).json({ error: "GitHub account not found" });
       return;
    }

    // Append user and GitHub account to the request object
    req.body.user = user;
    req.body.githubAccount = githubAccount;

    // Proceed to the next middleware
    next();
  } catch (err) {
    console.error("Error in auth middleware:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default auth;
