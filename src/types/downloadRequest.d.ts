import { UserModel } from "../models"
import { GitHubAccount } from "../models/githubAccount.model"

export type DownloadRequest = {
    fileId: bigint,
    userId: bigint 
    githubAccount: GitHubAccount
}