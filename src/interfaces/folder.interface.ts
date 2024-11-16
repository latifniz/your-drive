export interface Folder {
    folderId?: bigint;
    userId: bigint; // Reference to the Users table
    folderName: string;
    folders?: Folder[];
    parentId?: bigint; // Reference to the parent folder
    createdAt?: Date; // Timestamp when the file was uploaded
    updatedAt?: Date; // Timestamp when the file information was last updated
    trashedAt?: Date; // Timestamp when the file was moved to trash
    deletedAt?: Date; // Timestamp when the file was permanently deleted

}