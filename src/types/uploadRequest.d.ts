import { ReadStream } from "fs";
import { GitHubAccountModel, UserModel } from "../models";
export type UploadRequest = {
    githubAccount: GitHubAccountModel,
    folderPath: string,
    fileName: string,
    mimeType: string,
    fileStream: ReadStream,
    user: UserModel,
    folderId: bigint,
    chunkSize: number,
    fileId?: bigint, // if we are resuming file then request contains fileId
    chunkIndex?: number // if we are resuming 
    fileSize: bigint
}