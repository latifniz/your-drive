import { Request } from 'express';
import { StorageEngine } from 'multer';
import { UploadService } from '../services/upload.service';
import { ReadStream } from 'fs';
import path from 'path';
import fs from 'fs';
// Assuming GitHubAccountModel and UserModel are defined elsewhere in your project
import { GitHubAccountModel, UserModel } from '../models'; // Adjust the import path as needed
import directoryExists from '../utils/helper.functions';

export type UploadRequest = {
  githubAccount: GitHubAccountModel;
  folderPath: string;
  user: UserModel;
  folderId: bigint;
  chunkSize: number;
};

class CustomMulterStorage implements StorageEngine {
  private uploadRequest: UploadRequest;

  constructor(uploadRequest: UploadRequest) {
    this.uploadRequest = uploadRequest;
  }

  // Handle file method to process the upload
  async _handleFile(_req: Request, _file: Express.Multer.File, _cb: (error?: any, info?: Partial<Express.Multer.File>) => void): Promise<void> {
    try {
      // Call uploadFile method to upload the file using the provided UploadService
      await this.uploadFile(_file);

      // Call cb with success response (e.g., file size and path can be passed here)
      _cb(null);

    } catch (error) {
      // Log the error and pass it to the callback to continue the middleware flow
      console.error('Error occurred while uploading file:', error);

      // Pass the error to Multer callback
      _cb(error); // This ensures Multer's error handling kicks in and prevents app crashes.
    }
  }

  // Remove file method
  _removeFile(_req: Request, _file: Express.Multer.File, cb: (error: Error | null) => void): void {
    // Implement the logic for removing the file if necessary
    cb(null); // For simplicity, just call cb without error
  }

  // Custom upload method will use UploadService
  private async uploadFile(file: Express.Multer.File): Promise<void> {
    try {
      // Initialize UploadService and pass required params
      const fileDirName =  `${file.originalname}_${new Date().getTime()}`;
      this.uploadRequest.folderPath = path.join(this.uploadRequest.folderPath, fileDirName);

      // create this dir if not exists.
      if(!await directoryExists(this.uploadRequest.folderPath)) {
          await fs.promises.mkdir(this.uploadRequest.folderPath, { recursive: true });  
   
      } 
      await new UploadService({
        ...this.uploadRequest,
        fileStream: file.stream as ReadStream,
        fileName: file.originalname,
        mimeType: file.mimetype,
        folderId: this.uploadRequest.folderId,
      }).uploadFile();

    } catch (err) {
      // Handle and log any errors during upload
      console.error('Error uploading file:', err);

      // Throw an error to propagate to the Multer callback
      throw err;  // Make sure this is properly caught by the try-catch in `_handleFile`
    }
  }
}

// Export the storage engine factory
export function customMulterStorage(uploadRequest: UploadRequest) {
  return new CustomMulterStorage(uploadRequest);
}
