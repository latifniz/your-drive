import { Request, Response, NextFunction } from "express";
import { FolderModel } from "../models";
import { ApiResponse } from "../utils/ApiResponse";

// Middleware to check if the user has access to the requested folder
export async function authorizeFolderAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.body.user.userId as bigint; // Assuming user info is in req.body
    const folderId =
      req.params["parentId"] ||
      req.params["folderId"] ||
      req.body.folderId ||
      req.body.parentId ||
      (req.query["folderId"] as unknown as bigint);
    if (!folderId) {
      res.status(400).json(new ApiResponse(400, {}, "Folder ID is required"));
      return;
    }

    // Fetch the folder from the database and check if the folder belongs to the user
    const folder = await FolderModel.findOne({
      where: {
        folderId: folderId,
        userId: userId, // Check if the folder belongs to the current user
      },
    });

    // If the folder does not exist or does not belong to the user, return 403 or 404
    if (!folder) {
      res.status(404).json(new ApiResponse(404, {}, "Folder not found"));
      return;
    }

    // If folder exists and user has access, proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json(new ApiResponse(500, {}, "Internal Server Error"));
  }
}
