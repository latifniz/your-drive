import FileStreamUploader from "../utils/classes/fileStreamUploader";
import { RepositoryService } from "./repository.service";
import { FileService } from "./file.service";
import { UploadRequest } from "../types/uploadRequest";
import { ChunkService } from "./chunk.service";
import path from 'path';
import fs from "fs";
import { ChunkUploadStatus, FileUploadStatus } from "../enums/uploadStatus.enum";
import { Request } from "express";
import { UserStorageModel } from "../models";
export class UploadService {
    private repositoryService: RepositoryService;
    private fileService: FileService;
    private fileStreamUploader: FileStreamUploader;
    private chunkQueue: string[];
    private maxChunkQueueSize: number;
    private isChunkUploading: boolean;

    private fileId?: bigint; // if resuming file.
    private userId: bigint;
    private fileSize: bigint;

    constructor(uploadRequest: UploadRequest) {
        this.fileId = uploadRequest.fileId;
        this.repositoryService = new RepositoryService(uploadRequest.githubAccount, uploadRequest.folderPath);
        this.fileService = new FileService(
            {
                originalName: uploadRequest.fileName,
                mimetype: uploadRequest.mimeType,
                fileExtension: path.extname(uploadRequest.fileName),
            },
            uploadRequest.folderId
        );
        this.fileStreamUploader = new FileStreamUploader(
            uploadRequest.fileStream,
            uploadRequest.chunkSize,
            uploadRequest.folderPath,
            uploadRequest.chunkIndex
        );
        this.chunkQueue = [];
        this.maxChunkQueueSize = 5;
        this.isChunkUploading = false;
        this.userId = uploadRequest.user.userId;
        this.fileSize = uploadRequest.fileSize;
    }

    private async processUploads(chunkPath: string) {
      
        const repoId = await this.repositoryService.uploadFileToRepository(
            path.basename(chunkPath!)
        );

        // let repoId = this.repositoryService.getRepositoryInstanceId();
        const chunkSize = (await fs.promises.stat(chunkPath!)).size;
        await ChunkService.createChunk({
            fileId: this.fileService.getFileInstanceId()!,
            chunkNumber: this.fileStreamUploader.getCurretChunkNumber(),
            chunkSize: chunkSize,
            uploadStatus: ChunkUploadStatus.UPLOADED,
            chunkFilename: path.basename(chunkPath!),
            repoId: repoId!
        });
        
          // Asynchronously delete the file after upload
         await fs.promises.unlink(chunkPath!);
         console.log(`Successfully deleted file: ${chunkPath}`);
        // Update file
        await this.fileService.updateFileTotalChunks();
        await this.fileService.updateTotalSize(chunkSize);

    }

    // Handle chunk received and propagate errors if any occur
    private async onChunkReceived(chunk: Buffer) {
        try {
            const chunkPath = await this.fileStreamUploader.writeChunk(chunk);
            // push the chunk (it's path in the queue)
            this.chunkQueue.push(chunkPath!);
            if(!this.isChunkUploading && this.chunkQueue.length > 0) {
                this.isChunkUploading = true;
                await this.processUploads(this.chunkQueue[0]);
                this.chunkQueue.shift(); // remove the processed chunk from the queue
                this.isChunkUploading = false;
                this.fileStreamUploader.resumeFileStream(); // resume the file stream to process the next chunk in the queue.
             }

            // this.fileStreamUploader.pauseFileStream();
            if(this.chunkQueue.length >= this.maxChunkQueueSize) {
                this.fileStreamUploader.pauseFileStream();
            }
            else {
                this.fileStreamUploader.resumeFileStream();
            }
           

        } catch (err) {
            // Emit an error to be caught in the main flow
            console.log("error in onChunkUpload",err);
            this.fileStreamUploader.emit('error');
        }
    }

    private async onUploadComplete() {
        try {
            // // check and upload the last file chunk
            let lastChunkPath = this.fileStreamUploader.getCurrentChunkPath();
            await this.processUploads(lastChunkPath!);
            await this.repositoryService.deleteLocalGitRepository();  // delete the local repository
            // now update it as completed.
            await this.fileService.updateFileUploadStatus(FileUploadStatus.COMPLETED);
        } catch (err) {
            // Propagate error on completion
            console.log("error in onUploadComplete",err);
            this.fileStreamUploader.emit('error');
        }
    }

    private async onUploadError() {
        try {
            await this.fileService.updateFileUploadStatus(FileUploadStatus.FAILED);
        } catch (err) {
            // Emit error during upload error handling
            console.log("error in onUploadError",err);
            this.fileStreamUploader.emit('error');
        }
    }

    public async uploadFile(req: Request) {
        try {
            await this.fileService.createFileIfNotExists(this.fileId);
            // attach the created file to request so could be sent to user
            req.body.fileId = this.fileService.getFileInstanceId()
            // Track errors within the event listeners
            const uploadPromise = new Promise<void>((resolve, reject) => {
                this.fileStreamUploader.on('chunkReceived', async (chunk: Buffer) => {
                    try {
                        await this.onChunkReceived(chunk);
                      
                     
                    } catch (err) {
                        await this.fileService.updateFileUploadStatus(FileUploadStatus.FAILED);
                        reject(err); // Reject the main promise on error
                    }
                });
    
                this.fileStreamUploader.on('uploadCompleted', async () => {
                    try {
                        // wait for queue to complete
                        await this.completePendingUploads();
                        await this.onUploadComplete();
                        resolve(); // Resolve the main promise when upload completes
                    } catch (err) {
                        reject(err); // Reject if completion logic fails
                    }
                });
    
                this.fileStreamUploader.on('uploadError', async (err: Error) => {
                    try {
                        await this.onUploadError();
                    } catch (internalError) {
                        reject(internalError); // Reject with internal error if handling uploadError fails
                    }
                    reject(err); // Reject on upload error
                });
    
            });

           
            // Start the stream handler
            await this.fileStreamUploader.handleStream();
            await uploadPromise; // Await the combined promise
            
            console.log("File uploaded successfully");
            // when file upload is done update the user storage
            const storage = await UserStorageModel.findOne({where:{userId:this.userId}});
            storage!.usedStorage = storage?.usedStorage! + this.fileSize;
            await storage!.save();
    
        } catch (err) {
            await this.fileService.updateFileUploadStatus(FileUploadStatus.FAILED);
            console.error("Error in uploadFile:", err);
            throw new Error(`Error uploading file: ${err}`);
        }
    }
    
    // Helper to handle processing of queued uploads
private async completePendingUploads() {
    console.log("inside completePendingUploads", this.chunkQueue.length);
    while (this.chunkQueue.length > 0) {
        const chunkPath = this.chunkQueue[0];
        if (chunkPath) {
            await this.processUploads(chunkPath); // Process each chunk in sequence
            this.chunkQueue.shift(); // Remove the processed chunk from the queue
        }
    }
}
    
}
 