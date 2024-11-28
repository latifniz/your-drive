import { ChunkUploadStatus } from '../enums/uploadStatus.enum';
import { Chunk } from '../interfaces/chunk.interface';
import { ChunkModel } from '../models/index';
import { Op } from 'sequelize';

export class ChunkService {
  // Create a new chunk
  static async createChunk(chunkData: Chunk): Promise<ChunkModel | null> {
      try {
          return await ChunkModel.create(chunkData);
      } catch (err) { 
        throw new Error(`Error creating chunk: ${err}`);
      }
  }

  // Get a chunk by ID
  static async getChunkById(chunkId: number): Promise<ChunkModel | null> {
      try {
          return await ChunkModel.findByPk(chunkId);
      } catch (err) {
          throw new Error(`Error finding chunk by ID: ${err}`);
      }
  }

  static async updateChunkUploadStatus(chunkId: number, uploadStatus: ChunkUploadStatus) {
      try {
          const chunk = await ChunkModel.findByPk(chunkId);

          if (!chunk) {
              throw new Error('Chunk not found');
          }

          chunk.uploadStatus = uploadStatus;
          await chunk.save();

          return chunk;
      } catch (err) {
          throw new Error(`Error updating chunk upload status: ${err}`);
      }
  }
 
  // Get all chunksIds with FileId
  static async getChunksFromIndexByFileId(fileId: bigint, index: number) {
    try {
        // Get all chunks where chunkNumber is >= index
        const chunks = await ChunkModel.findAll({
            where: { fileId, chunkNumber: { [Op.gte]: index } }, // Filter by chunkNumber >= index
            order: [['chunkNumber', 'ASC']], // Ensure the chunks are sorted by chunkNumber
        });

        return chunks;
    } catch (err) {
        throw new Error(`Error finding chunks by file ID from index ${index}: ${err}`);
    }
}


  // Get RepoId from ChunkId 
  static async getRepoIdByChunkId(chunkId: bigint) { 
     try {
         const chunk = await ChunkModel.findByPk(chunkId);

         if (!chunk) {
             throw new Error('Chunk not found');
         }

         return chunk.dataValues.repoId;
     } catch (err) {
         throw new Error(`Error finding repo ID by chunk ID: ${err}`);
     }
  }

  /**
   * Retrieves details about a specific chunk.
   */
  public static async getChunkDetails(chunkId: bigint): Promise<{ repoId: bigint; chunkFileName: string }> {
    const chunk = await ChunkModel.findOne({
      where: { chunkId: chunkId },
      attributes: ["repoId", "chunkFilename"], // Assuming these are column names
    });

    if (!chunk) {
      throw new Error(`Chunk with ID ${chunkId} not found`);
    }

    return { repoId: chunk.dataValues.repoId, chunkFileName: chunk.dataValues.chunkFilename };
  }

} 
