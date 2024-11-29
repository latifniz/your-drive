import { FileUploadStatus } from "../enums/uploadStatus.enum";
import { FileModel } from "../models";
import path from "path";
import { FileType } from "../types/fileType";

export class FileService {
  private file: FileType;
  private fileInstance: FileModel | null;
  private folderId: bigint | null; // if root folder

  constructor(file: FileType, folderId: bigint) {
    // Initialize any necessary variables or services here
    this.file = file;
    this.fileInstance = null;
    this.folderId = folderId;
  }

  public async createFileIfNotExists(fileId?: bigint) {
    try {
      if (fileId) {
        const existingFile = await FileModel.findOne({ where: { fileId } });
        if (existingFile) {
          this.fileInstance = existingFile;
          console.log("File already exists");
          return;
        }
      }
      const file = await FileModel.create({
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
      console.log(`Error creating file instance ${err} `);
      throw new Error(`Error creating file instance ${err} `);
    }
  }

  public async updateFileTotalChunks() {
    try {
      const file = await this.fileInstance!.increment("totalChunks");

      await file.save();
    } catch (err) {
      throw new Error(`Error updating file instance total chunks ${err} `);
    }
  }

  public async updateFileUploadStatus(uploadStatus: FileUploadStatus) {
    try {
      if (this.fileInstance) {
        this.fileInstance!.status = uploadStatus;

        await this.fileInstance!.save();
      } else {
        throw new Error("File instance not found");
      }
    } catch (err) {
      throw new Error(`Error updating file instance upload status ${err} `);
    }
  }

  public async updateTotalSize(newBytes: number) {
    try {
      this.fileInstance!.totalSize =
        BigInt(this.fileInstance?.totalSize!) + BigInt(newBytes);

      await this.fileInstance!.save();
    } catch (err) {
      throw new Error(`Error updating file instance total size ${err} `);
    }
  }

  private generateUniqueFileName(originalFilename: string): string {
    const timestamp = Date.now();
    const fileExtension = path.extname(originalFilename);
    const filenameWithoutExtension = path.basename(
      originalFilename,
      path.extname(originalFilename)
    );

    const uniqueFilename = `${filenameWithoutExtension}_${timestamp}${fileExtension}`;
    return uniqueFilename;
  }

  public getFileInstanceId() {
    return this.fileInstance?.fileId;
  }

  public static async getFileModel(fileId: bigint, folderId: bigint) {
    try {
      // Get the file if exits
      const file = await FileModel.findOne({
        where: { fileId, folderId },
      });
      return file?.dataValues;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to retrieve file model");
    }
  }

  public static async getFileBytesIfExists(
    fileId: bigint,
    fileOriginalName: string
  ) {
    try {
      // Check if file exists
      const file = await FileModel.findOne({
        where: { fileId, originalFilename: fileOriginalName },
      });
      if (file) {
        return file.dataValues.totalSize;
      }
      return;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to retrieve file bytes");
    }
  }

  public static async getTotalUploadedChunks(fileId: bigint) {
    try {
      // Get the total chunks of the file
      const file = await FileModel.findOne({
        where: { fileId },
      });
      return file?.dataValues.totalChunks;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to retrieve total file chunks");
    }
  }

  static async deleteMultipleFiles(fileIds: bigint[]) {
    try {
      // Delete all files related to the given file IDs
      await FileModel.destroy({ where: { fileId: fileIds } });
    } catch (err) {
      console.error(err);
      throw new Error("Failed to delete multiple files");
    }
  }
}
