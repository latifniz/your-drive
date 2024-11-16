
import { FileUploadStatus } from '../enums/uploadStatus.enum';
import { FileModel, UserModel } from '../models';
import path from 'path';
import { FileType } from '../types/fileType';



export class FileService {

   private user: UserModel; 
   private file: FileType;
   private fileInstance: FileModel | null;
   private folderId: bigint | null; // if root folder

   constructor(
     user:UserModel,file:FileType, folderId:bigint
    ) {
     // Initialize any necessary variables or services here
     this.user = user;
     this.file = file;
     this.fileInstance = null;
     this.folderId = folderId;
   }

public async createFile() {
       try {
          const file = await FileModel.create({
              userId: this.user.userId!,
              folderId: this.folderId, 
              originalFilename: this.file.originalName,
              uniqueFilename: this.generateUniqueFileName(this.file.originalName),
              totalSize: BigInt(0),
              totalChunks: 0, 
              status: FileUploadStatus.IN_PROGRESS,
              mimeType: this.file.mimetype,
              fileExtension: path.extname(this.file.originalName),
          });
          this.fileInstance = file;
        console.log("file created successfully");
       } catch (err) {
         console.log(`Error creating file instance ${err} `)
         throw new Error(`Error creating file instance ${err} `);
       }
}

public async updateFileTotalChunks() {
     try {
        const file = await this.fileInstance!.increment('totalChunks');
 
        await file.save();
     } catch (err) {
       throw new Error(`Error updating file instance total chunks ${err} `);
     }
}

public async updateFileUploadStatus(uploadStatus:FileUploadStatus) {
       try {
         if(this.fileInstance) {
          this.fileInstance!.status = uploadStatus;

          await this.fileInstance!.save();
         }
        else {
          throw new Error('File instance not found');
 
        }
       } catch (err) {
         throw new Error(`Error updating file instance upload status ${err} `);
       }
}

public async updateTotalSize(newBytes:number) {
    try {
        this.fileInstance!.totalSize = BigInt(this.fileInstance?.totalSize!) + BigInt(newBytes);

        await this.fileInstance!.save();
    } catch (err) {
        throw new Error(`Error updating file instance total size ${err} `);
    }
}

private generateUniqueFileName(originalFilename: string): string {
    const timestamp = Date.now();
    const fileExtension = path.extname(originalFilename);
    const filenameWithoutExtension = path.basename(originalFilename, path.extname(originalFilename));

    const uniqueFilename = `${filenameWithoutExtension}_${timestamp}${fileExtension}`;
    return uniqueFilename;
}

public getFileInstanceId() {
   return this.fileInstance?.fileId;
}

public static async getFileModel(fileId:bigint,userId:bigint) {
     try {
         // Get the file if exits
         const file = await FileModel.findOne({
           where: { fileId, userId },
         });
         return file?.dataValues;
     } catch (err) {
       console.error(err);
       throw new Error('Failed to retrieve file model');
     }
}
}
