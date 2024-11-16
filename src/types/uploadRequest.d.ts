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
}