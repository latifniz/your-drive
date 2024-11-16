import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';
import { Chunk as ChunkInterface } from '../interfaces/chunk.interface';
import { ChunkUploadStatus } from '../enums/uploadStatus.enum';


type ChunkCreationAttributes = Optional<ChunkInterface, 'chunkId' | 'createdAt' | 'updatedAt'>;


export class Chunk extends Model<ChunkInterface, ChunkCreationAttributes> implements ChunkInterface {
    public chunkId!: bigint;
    public fileId!: bigint;
    public repoId!: bigint;
    public chunkNumber!: number;
    public chunkFilename!: string;
    public chunkSize!: number;
    public uploadStatus!: ChunkUploadStatus;
    public createdAt!: Date;
    public updatedAt!: Date;

    static override tableName = 'chunks';

    static initialize() {
       return this.init({
            chunkId: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            fileId: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            repoId: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            chunkNumber: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            chunkFilename: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            chunkSize: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            uploadStatus: {
                type: DataTypes.ENUM(...Object.values(ChunkUploadStatus)),
                defaultValue: ChunkUploadStatus.PENDING,
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false,
            },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false,
            },
        }, {
            sequelize,
            tableName: Chunk.tableName,
            modelName: 'Chunk',
            timestamps: true,
            updatedAt: true, // Sequelize will automatically handle `updatedAt`
        });
    }
}

// // Initialize the model after the class definition
// export default Chunk.initialize();
