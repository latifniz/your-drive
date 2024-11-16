// File Status Enum
export enum FileUploadStatus {
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

// Chunk Upload Status Enum
export enum ChunkUploadStatus {
    PENDING = 'pending',
    UPLOADED = 'uploaded',
    FAILED = 'failed'
}