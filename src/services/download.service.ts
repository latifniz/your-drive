import { RepositoryService } from "./repository.service";
import { FileService } from "./file.service";
import { ChunkService } from "./chunk.service";
import { GitHubAccount } from "../models/githubAccount.model";
import { DownloadRequest } from "../types/downloadRequest";
// import stream from "stream";
import axios from "axios";
import { Response } from "express";
import { Readable } from "stream";
// import { Readable } from "stream";

export class DownloadService {
  private fileId: bigint;
  private userId: bigint;
  private githubAccount: GitHubAccount;

  constructor(downloadRequest: DownloadRequest) {
    this.fileId = downloadRequest.fileId;
    this.userId = downloadRequest.userId;
    this.githubAccount = downloadRequest.githubAccount;
  }

  /**
   * Download file as a single stream combining all chunks sequentially.
   * Streams directly from GitHub to the client.
   */
  public async downloadFile(res: Response): Promise<void> {
    try {
      // Step 1: Get file details and verify user access
      const file = await FileService.getFileModel(this.fileId, this.userId);
      if (!file) throw new Error("File not found or access denied");

      // Step 2: Retrieve chunk IDs (sorted in order)
      const chunkIds = await ChunkService.getAllChunkIdsByFileId(this.fileId);
      
       // Step 3: Send the headers once, before streaming any data
       res.writeHead(200, {
        "Content-Disposition": `attachment; filename="file-${this.fileId}.bin"`,
        "Content-Type": "application/octet-stream",
      });

      // Step 4: Stream chunks from GitHub to client one by one
      for (const chunkId of chunkIds) {
        await this.downloadChunk(chunkId!, res);
      }
      // End the response after all chunks are streamed
      res.end(JSON.stringify({ success: true, message: 'File transfer completed successfully' }));
    //   res.status(200).json({"message" : "File Downloaded successfully"});
    } catch (error) {
      console.error("Error in downloadFile:", error);
      throw new Error("Failed to download file");
    }
  }

  /**
   * Download and stream a single chunk from GitHub to the client.
   */
  private async downloadChunk(chunkId: bigint, res: Response): Promise<void> {
    try {
      // Step 1: Get repository and chunk details
      const { repoId, chunkFileName } = await ChunkService.getChunkDetails(chunkId);
      const repoUrl = await RepositoryService.findRepoUrl(repoId);

      if (!repoUrl || !chunkFileName) {
        throw new Error(`Chunk or repository not found for chunkId ${chunkId}`);
      }

      // Convert GitHub repository URL to API URL
      const apiUrl = repoUrl
        .replace("https://github.com/", "https://api.github.com/repos/") // Convert to API base
        .concat(`/contents/${chunkFileName}`); // Append the file path
      
      // Step 2: Fetch the chunk from the GitHub repository
      const headers = {
        Authorization: `Bearer ${this.githubAccount.accessToken}`,
        Accept: "application/vnd.github.v3.raw", // Fetch raw file content
      };

      const response = await axios.get(apiUrl, {
        headers,
        responseType: "stream", // This is where the chunk is streamed directly
      });

      // Step 3: Pipe the chunk directly to the client response stream
      
      (response.data as Readable).pipe(res, { end: false });

      // Wait for the chunk to finish sending before moving to the next one
      await new Promise((resolve, reject) => {
        (response.data as Readable).on("end", resolve);
        (response.data as Readable).on("error", reject);
      });
    } catch (error) {
      console.error(`Error downloading chunk ${chunkId}:`, error);
      throw new Error(`Failed to download chunk ${chunkId}`);
    }
  }
}
