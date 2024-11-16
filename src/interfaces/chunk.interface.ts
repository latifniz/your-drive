import { ChunkUploadStatus } from "../enums/uploadStatus.enum";

export interface Chunk {
    chunkId?: bigint;
    fileId: bigint; // Reference to the Files table
    repoId: bigint; // Reference to the Repositories table
    chunkNumber: number; // The sequence number of the chunk
    chunkFilename: string; // Name of the compressed chunk file
    chunkSize: number; // Size of the chunk in bytes
    uploadStatus: ChunkUploadStatus; // Status of the chunk upload
    createdAt?: Date; // Timestamp when the chunk was created
    updatedAt?: Date; // Timestamp when the chunk information was last updated
  }
  