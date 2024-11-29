import { Request, Response } from "express";
import { FileService } from "../services/file.service"; // Adjust path based on your structure
import { ApiResponse } from "../utils/ApiResponse";
import { DownloadService } from "../services/download.service";
import { DownloadRequest } from "../types/downloadRequest";
import { GitHubAccountService } from "../services/github_account.service";
import { UserModel } from "../models";
import { RepositoryService } from "../services/repository.service";

export class FileController {
  static async upload(req: Request, res: Response) {
    res.status(200).json(
      new ApiResponse(200, {
        message: "File uploaded successfully!",
        fileId: req.body.fileId,
      })
    );
  }
  static async resume(req: Request, res: Response) {
    try {
      const fileId = req.params["fileId"] as unknown as bigint;

      const fileName = req.headers["x-file-name"] as string;
      const bytes = await FileService.getFileBytesIfExists(fileId, fileName);
      if (bytes) {
        res.status(200).json(new ApiResponse(200, { bytesUploaded: bytes }));
        return;
      }
      res.status(404).json(new ApiResponse(404, { bytesUploaded: 0 }));
    } catch (err) {
      console.error("Error in file resume route:", err);
      res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to retrieve file resume"));
    }
  }
  static async download(req: Request, res: Response) {
    const { fileId, folderId } = req.params;

    try {
      if (!fileId || !folderId) {
        res
          .status(400)
          .json(new ApiResponse(400, {}, "Missing userId or fileId"));
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
      await downloadService.downloadFile(res, req);
    } catch (error) {
      console.error("Error in file download route:", error);
      //   res.status(500).json({ message: "Failed to download file", error });
      res.end(
        JSON.stringify({
          success: false,
          message: "File transfer failed",
          error,
        })
      );
    }
  }

  static async delete(req: Request, res: Response) {
    const fileIds = req.body.fileIds as bigint[];
    const userId = req.body.userId;
    try {
      // fetch the github account of user we need to delete repos
      const githubAccount = await GitHubAccountService.findAccountById(
        (
          await UserModel.findByPk(userId)
        )?.dataValues.githubAccountId!
      );
      // here delete everything from the server
      const allRepos = await RepositoryService.getRepositoriesByFileIds(
        fileIds
      );
      // most expensive task make it to background
      RepositoryService.deleteAllRepos(
        allRepos.map((repo) => repo.repositoryName),
        githubAccount?.dataValues.githubUsername!,
        githubAccount?.dataValues.accessToken!
      );
      // now delete all the files from db
      FileService.deleteMultipleFiles(fileIds);
      res
        .status(200)
        .json(new ApiResponse(200, {}, "Files deleted successfully"));
    } catch (err) {
      console.error("Error in file delete route:", err);
      res.status(500).json(new ApiResponse(500, {}, "Failed to delete file"));
    }
  }
}
