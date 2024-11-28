import { FileUploadStatus } from "../enums/uploadStatus.enum";
import { DownloadModel } from "../models";

export class DownloadingService {

    static async createDownloadIfNotExists(fileId:bigint,userId:bigint,totalChunks:number) {
        try {
            const existingDownload = await DownloadModel.findOne({ where: { fileId } });
            if (existingDownload) {
                return existingDownload;
            }
            const newDownload = await DownloadModel.create({
                fileId,
                userId: userId,
                totalChunks: totalChunks, 
                downloadedChunks: 0,
                status: FileUploadStatus.IN_PROGRESS,
            });
            return newDownload;
        } catch (err) {
            throw new Error(`Error creating download for file ID ${fileId}: ${err}`);
        }
    }
    
    static async updateDownloadStatus(downloadId:bigint, status: FileUploadStatus) {
        try {
            const download = await DownloadModel.findByPk(downloadId);
            if (!download) {
                throw new Error(`Download not found for ID ${downloadId}`);
            }
            download.status = status;
            await download.save();
            return download;
        } catch (err) {
            throw new Error(`Error updating download status for ID ${downloadId}: ${err}`);
        }
    }

    static async incrementDownloadedChunks(downloadId:bigint) {
        try {
            const download = await DownloadModel.findByPk(downloadId);
            if (!download) {
                throw new Error(`Download not found for ID ${downloadId}`);
            }
            await DownloadModel.increment('downloadedChunks',{where: {downloadId}});
            return download;
        } catch (err) {
            throw new Error(`Error incrementing downloaded chunks for ID ${downloadId}: ${err}`);
        }
    }
    static async getTotalDownloadedChunks(downloadId: bigint) {
        try {
            const download = await DownloadModel.findByPk(downloadId);
            if (!download) {
                throw new Error(`Download not found for ID ${downloadId}`);
            }
            return download.downloadedChunks;
        } catch (err) {
            throw new Error(`Error retrieving total downloaded chunks for ID ${downloadId}: ${err}`);
        }
    }
    
}