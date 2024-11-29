import { RepositoryService } from "./repository.service";
import { FileService } from "./file.service";
import { ChunkService } from "./chunk.service";
import { GitHubAccount } from "../models/githubAccount.model";
import { DownloadRequest } from "../types/downloadRequest";
// import stream from "stream";
import { Request, Response } from "express";
import { Readable } from "stream";
// import { DownloadingService } from "./downloading.service";
// import { FileUploadStatus } from "../enums/uploadStatus.enum";
// import { FileModel } from "../models";
import { File } from "../interfaces/file.interface";
import axios from "axios";
import { ApiResponse } from "../utils/ApiResponse";

// import { Readable } from "stream";

export class DownloadService {
  private fileId: bigint;
  private folderId: bigint;  // Folder in which file is placed.
  private githubAccount: GitHubAccount;
  // private downloadId: bigint | null; // for file download resume

  constructor(downloadRequest: DownloadRequest) {
    this.fileId = downloadRequest.fileId;
    this.githubAccount = downloadRequest.githubAccount;
    this.folderId = downloadRequest.folderId;
    // this.downloadId = null;
  }

  /**
   * Download file as a single stream combining all chunks sequentially.
   * Streams directly from GitHub to the client.
   */
  public async downloadFile(res: Response, req: Request): Promise<void> {
    try {
        // Step 1: Get file details and verify user access
        const file = await FileService.getFileModel(this.fileId, this.folderId);
        if (!file) throw new Error("File not found or access denied");

        let chunkOffestMapping = {
           startChunkIndex: 0,
           startOffset: 0       
         };
        const range = req.headers.range;

        if (range) {
          const ranges = range.replace(/bytes=/, "").split("-"); // e.g., "1000-2000"
          const startByte = parseInt(ranges[0], 10);

          if (startByte >= file.totalSize) { // can't satisfy this request
              res.status(416).json(new ApiResponse(416,{},"Requested Range Not Satisfiable"))
              return;
          }
          
         // calculate chunk index and offset from file to send
         chunkOffestMapping = this.mapStartByteToChunks(startByte,parseInt(process.env['CHUNK_SIZE']!,10),file.totalChunks,this.getLastChunkSize(file))
         console.log(chunkOffestMapping);
          // Set the Content-Range header for the response
          const endByte = Number(file.totalSize) - 1; // End byte for this range
      res.setHeader(
        "Content-Range",
        `bytes ${startByte}-${endByte}/${file.totalSize}`
      );
          res.status(206); // Partial Content
      } else {
          // If no range header, send the full file
          res.writeHead(200, {
              "Content-Disposition": `attachment; filename="${file.originalFilename}"`,
              "Content-Type": "application/octet-stream",
          });
      }

        // Step 2: Retrieve chunk IDs (sorted in order)
        let chunks = await ChunkService.getChunksFromIndexByFileId(this.fileId,chunkOffestMapping.startChunkIndex);
        
        // Step 3: Handle range request if present

        // create downloading entry
        // const download = await DownloadingService.createDownloadIfNotExists(this.fileId, this.userId, chunkIds.length);
        // this.downloadId = download.downloadId;

        // Step 4: Stream chunks from GitHub to client one by one
        let startByte = chunkOffestMapping.startOffset;
        for (const chunk of chunks) {
            await this.downloadChunkWithRetry(chunk.chunkId!, res,startByte,1000,5);
            startByte = 0;
          //  await DownloadingService.incrementDownloadedChunks(this.downloadId);
        }

        // File Downloading completed successfully
       // await DownloadingService.updateDownloadStatus(this.downloadId, FileUploadStatus.COMPLETED);

        // End the response after all chunks are streamed
        res.end();
    } catch (error) {
       // await DownloadingService.updateDownloadStatus(this.downloadId!, FileUploadStatus.FAILED);
        console.error("Error in downloadFile:", error);
        throw new Error("Failed to download file");
    }
}


  /**
   * Download and stream a single chunk from GitHub to the client.
   */
  
    public async downloadChunkWithRetry(
      chunkId: bigint,
      res: Response,
      initialStartByte: number,
      retryIntervalMs: number,
      maxRetries: number
    ): Promise<void> {
      let currentStartByte = initialStartByte;
      let attempts = 0;
  
      while (attempts < maxRetries) {
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
            Range: `bytes=${currentStartByte}-`, // Fetch data starting from currentStartByte
          };
  
          const response = await axios.get(apiUrl, {
            headers,
            responseType: "stream", // This is where the chunk is streamed directly
            timeout: 30000
          });
  
          // Step 3: Pipe the chunk directly to the client response stream
          (response.data as Readable).pipe(res, { end: false });
  
          // Wait for the chunk to finish sending before moving to the next one
          await new Promise((resolve, reject) => {
            
            (response.data as Readable).on("end", resolve);
            (response.data as Readable).on("error", reject);
          });
  
          // If successful, exit the retry loop
          return;
        } catch (error) {
          attempts++;
          console.log(error);
          console.error(`Error downloading chunk ${chunkId}, attempt ${attempts}:`, error);
          
          // If max retries exceeded, throw the error
          if (attempts >= maxRetries) {
            throw new Error(`Failed to download chunk ${chunkId} after ${maxRetries} attempts`);
          }
  
          // Wait for the retry interval before attempting again
          await this.delay(retryIntervalMs);
        }
      }
    }
  
    private delay(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    

  private mapStartByteToChunks(
    startByte: number,
    chunkSize: number,
    totalChunks: number,
    lastChunkSize: number,
  ): { startChunkIndex: number; startOffset: number } {
    if (startByte < 0) {
      throw new Error("Invalid start byte");
    }
  
    const startChunkIndex = Math.floor(startByte / chunkSize); // Determine which chunk the startByte falls into
    const startOffset = 
      startChunkIndex === totalChunks - 1 // If it's the last chunk
        ? Math.min(startByte % chunkSize, lastChunkSize) // Ensure offset doesn't exceed last chunk size
        : startByte % chunkSize; // For regular chunks, calculate offset normally
  
    return { startChunkIndex, startOffset };
  }

  private getLastChunkSize(file:File) {
    const chunkSize = Math.floor(Number(file.totalSize) / file.totalChunks); // Size of each chunk except the last one
    const remainder = Number(file.totalSize) % file.totalChunks; // Remainder, which will be the size of the last chunk
  
    // If there is a remainder, the last chunk is smaller than the others
    const lastChunkSize = remainder > 0 ? remainder : chunkSize;
  
    return lastChunkSize;
  }
}
