import {  Response, NextFunction, Request } from "express";
import { UserModel } from "../models/index";
import { GitHubAccountService } from "../services/github_account.service";
// import { DownloadRequest } from "../types/downloadRequest";

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;
    console.log(req.body);
   

    // Validate that userId is provided
    if (!userId) {
      res.status(400).json({ error: "Missing userId in request body" });
      return;
    }

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
    req.body.githubAccount = githubAccount ;

    // Proceed to the next middleware
    next();
  } catch (err) {
    console.error("Error in auth middleware:", err);
    res.status(500).json({ error: "Internal server error" });
  }
  
};

export default auth;
