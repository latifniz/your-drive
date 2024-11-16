import { Request } from 'express';
import { Readable } from 'stream';
import { Express } from 'express';
import { GitHubAccountModel, UserModel } from '../models';

export interface UploadRequest extends Request {
  fileStream: Readable; // Specific to upload routes
  userId: string; // Specific to upload routes
  file: Express.Multer.File,
  files?: Express.Multer.File[],
  body: {
    userId: number
  }
  error: Error,  // upload may fail
}

export interface DownloadRequest extends Request {
   githubAccount: GitHubAccountModel;
   user: UserModel;

  //  body: {
  //    fileId: bigint,
  //    userId: bigint
  //  };
}