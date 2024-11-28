// userStorage.interface.ts
export interface UserStorageInterface {
    userId: bigint;  // The user associated with this storage record
    storageId?: bigint; // 
    usedStorage: bigint;  // Amount of storage used by the user (in bytes)
    totalStorage: bigint; // Amount of total storage in bytes
    createdAt: Date;  // Timestamp when the record was created
    updatedAt: Date;  // Timestamp when the record was last updated
}
