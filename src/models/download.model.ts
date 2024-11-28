import { Model, DataTypes, } from 'sequelize';
import { sequelize } from '../config/database.config';
import { FileUploadStatus } from '../enums/uploadStatus.enum';

// save records of file downloads 
// need it for file download resuming 
export class Download extends Model {
    public downloadId!: bigint;
    public fileId!: bigint;
    public userId!: bigint;
    public totalChunks!: number;
    public downloadedChunks!: number;
    public status!: FileUploadStatus
    public createdAt!: Date;
    public updatedAt!: Date;

    static override tableName = 'downloads';
    
    static initialize() {
        return this.init({
            downloadId: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            fileId: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            userId: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            totalChunks: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            downloadedChunks: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM(...Object.values(FileUploadStatus)),
                defaultValue: FileUploadStatus.IN_PROGRESS,
                allowNull: false,
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
            tableName: Download.tableName,
            modelName: 'Download',
            timestamps: true,
        });
    }
}