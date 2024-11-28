import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { StorageEngine } from 'multer';
import { UploadService } from '../services/upload.service';
import { ReadStream } from 'fs';
import path from 'path';
import fs from 'fs';
// Assuming GitHubAccountModel and UserModel are defined elsewhere in your project
import { GitHubAccountModel, UserModel } from '../models'; // Adjust the import path as needed
import directoryExists from '../utils/helper.functions';
import { FileService } from '../services/file.service';
import { ApiResponse } from '../utils/ApiResponse';

export type UploadRequest = {
  githubAccount: GitHubAccountModel;
  folderPath: string;
  user: UserModel;
  folderId: bigint;
  chunkSize: number;
  fileSize: bigint
};

class CustomMulterStorage implements StorageEngine {
  private uploadRequest: UploadRequest;

  constructor(uploadRequest: UploadRequest) {
    this.uploadRequest = uploadRequest;
  }

  // Handle file method to process the upload
  async _handleFile(req: Request, _file: Express.Multer.File, _cb: (error?: any, info?: Partial<Express.Multer.File>) => void): Promise<void> {
    try {
      // Call uploadFile method to upload the file using the provided UploadService
      await this.uploadFile(_file,req);

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
  private async uploadFile(file: Express.Multer.File, req:Request): Promise<void> {
    try {
      // Initialize UploadService and pass required params
      const fileDirName =  `${file.originalname}_${new Date().getTime()}`;
      this.uploadRequest.folderPath = path.join(this.uploadRequest.folderPath, fileDirName);

      // create this dir if not exists.
      if(!await directoryExists(this.uploadRequest.folderPath)) {
          await fs.promises.mkdir(this.uploadRequest.folderPath, { recursive: true });  
   
      } 
      // for file resuming, if req.param have file id means its resuming.
      const fileId = req.params['fileId'] as unknown as bigint;
      let chunkIndex:number | undefined = 0;
      if(fileId) {
          chunkIndex = await FileService.getTotalUploadedChunks(fileId);
      }
   
      await new UploadService({
        ...this.uploadRequest,
        fileStream: file.stream as ReadStream,
        fileName: file.originalname,
        mimeType: file.mimetype,
        folderId: this.uploadRequest.folderId,
        chunkIndex: chunkIndex ? chunkIndex: 0,
        fileId: fileId, // if its resuming then fileId is passed.
      }).uploadFile(req);
      

    } catch (err) {
      // Handle and log any errors during upload
      console.error('Error uploading file:', err);

      // Throw an error to propagate to the Multer callback
      throw err;  // Make sure this is properly caught by the try-catch in `_handleFile`
    }
  }
}

// Export the storage engine factory
function customMulterStorage(uploadRequest: UploadRequest) {
  return new CustomMulterStorage(uploadRequest);
}

// Middleware to handle file uploads
export const upload = async (req: Request, res: Response, next: NextFunction) => {
  try {
  
   req.setTimeout(1000*60*60*24, () => {
     console.log("request timeout");
   });
   
    // Call getData to retrieve the user and GitHub account details
    const { user, githubAccount } = req.body;
    const folderId = req.query['folderId'] as unknown as number;
    // create folder with username 
    const rootUploadPath = process.env['DESTINATION_DIR']!;
    const uploadPath = `${rootUploadPath}/${user?.username}`;
 
    // Create an UploadRequest object
    const uploadRequest = {
      githubAccount: githubAccount!,
      folderPath: uploadPath, // Specify the desired folder path
      user: user!,
      folderId: BigInt(folderId),
      chunkSize: parseInt(process.env['CHUNK_SIZE']!,10), // Set the desired chunk size (10MB in this case)
      fileSize: req.body.fileSize
    };

    // Initialize custom storage with the uploadRequest
    const storage = customMulterStorage(uploadRequest);

    // Initialize multer with the custom storage
    const multerUpload = multer({ storage });


    // Call multer's upload function for the file upload process
    multerUpload.single('file')(req, res, (err: any) => {
      if (err) {
        // return next(err); // Pass any errors to the next middleware
        console.log(err);
        res.status(500).json(new ApiResponse(500, {
          message: 'File Upload Failed. Retry',
          fileId: req.body.fileId
        }));
        return;
      }
       next(); // Proceed to the next middleware or route handler
     
    });
    
  } catch (error) {
    console.error('Error in upload middleware:', error);
    next(error); // Pass any errors to the next middleware
  }
};
