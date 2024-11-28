import { FileUploadStatus } from "../enums/uploadStatus.enum";

export interface File {
    fileId?: bigint;
    folderId: bigint | null; // Reference to the Folders table
    originalFilename: string;
    uniqueFilename: string;
    totalSize: bigint; // will be known after processing the file , maybe before
    totalChunks: number;
    status: FileUploadStatus; // Status of the upload process
    mimeType: string; // Mime type of the file (e.g., image/jpeg, application/pdf)
    fileExtension: string; // File extension (e.g., .jpg, .pdf)
    createdAt?: Date; // Timestamp when the file was uploaded
    updatedAt?: Date; // Timestamp when the file information was last updated
    trashedAt?: Date; // Timestamp when the file was moved to trash
    deletedAt?: Date; // Timestamp when the file was permanently deleted
  }