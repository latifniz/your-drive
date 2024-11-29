import { Request, Response, NextFunction } from "express";
import { FileModel, UserStorageModel } from "../models";
import { ApiResponse } from "../utils/ApiResponse";
import { config } from "../config/config";
import { PlanService } from "../services/plan.service";
import { SubscriptionService } from "../services/subscription.service";
import { PlanType } from "../enums/planType.enum";
import { SubscriptionStatus } from "../enums/subscription.enum";

export async function canUploadThisFile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Check if the file size is within the allowed limit
    const fileSize = req.headers["x-file-size"]
      ? BigInt(req.headers["x-file-size"] as string)
      : null;
    if (!fileSize) {
      res.status(400).json(
        new ApiResponse(400, {
          message: "File size not provided or invalid.",
        })
      );
      return;
    }

    // Fetch user storage details
    const userStorage = await UserStorageModel.findOne({
      where: { userId: req.body.user.userId },
    });

    if (userStorage) {
      const totalStorage = userStorage.totalStorage;
      const usedStorage = userStorage.usedStorage;
      const remainingStorage = totalStorage - usedStorage;

      if (fileSize > remainingStorage) {
        // User has enough storage available
        res
          .status(400)
          .json(
            new ApiResponse(400, {}, "Not enough storage space available.")
          );
        return;
      }
    }

    // If user storage is not found, check subscription plan
    const userSubscription = await SubscriptionService.getSubscriptionByUserId(
      req.body.user.userId
    );

    if (!userSubscription) {
      res.status(400).json(
        new ApiResponse(400, {
          message: "No subscription found for the user.",
        })
      );
      return;
    } else if (
      userSubscription.dataValues.status === SubscriptionStatus.INACTIVE
    ) {
      res.status(400).json(
        new ApiResponse(400, {
          message: "User subscription is inactive.",
        })
      );
      return;
    }

    const userPlan = await PlanService.getPlanById(
      userSubscription.dataValues.planId
    );

    if (!userPlan) {
      res.status(400).json(
        new ApiResponse(400, {
          message: "Invalid plan for the user.",
        })
      );
      return;
    }

    const allowedFileSize =
      userPlan.dataValues.name === PlanType.FREE
        ? BigInt(config.fileSizes.free_plan_size)
        : userPlan.dataValues.name === PlanType.PREMIUM
        ? BigInt(config.fileSizes.premmium_plan_size)
        : BigInt(0); // You can handle other plan types here as needed

    // Check if file size exceeds the allowed limit for the user's plan
    if (fileSize > allowedFileSize) {
      res.status(400).json(
        new ApiResponse(400, {
          message: "File size exceeds the allowed limit for the current plan.",
        })
      );
      return;
    }
    // attach the fileSize to req object
    req.body.fileSize = fileSize;
    next();
  } catch (err) {
    console.error("Error in canUploadThisFile middleware:", err);
    res.status(500).json(
      new ApiResponse(500, {
        message: "Internal Server Error.",
      })
    );
  }
}

// Middleware to check if the user has access to the requested file

export async function authorizeFileAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const folderId =
      req.params["parentId"] ||
      req.params["folderId"] ||
      req.body.folderId ||
      req.body.parentId ||
      (req.query["folderId"] as unknown as bigint);
    const fileIds = (req.body.fileIds || req.params["fileId"]) as bigint[]; // Array of file IDs from the request body

    // Fetch files within the folder that belong to the user
    const files = await FileModel.findAll({
      where: {
        fileId: fileIds,
        folderId: folderId, // Ensure files are in the correct folder
      },
    });

    // Check if the number of files found matches the number of requested fileIds
    if (files.length !== fileIds.length) {
      res.status(404).json(new ApiResponse(404, {}, "File not found"));
      return;
    }

    // Proceed to the next middleware or route handler if access is valid
    next();
  } catch (error) {
    console.error("Error in file access authorization:", error);
    res.status(500).json(new ApiResponse(500, {}, "Internal Server Error"));
  }
}
