import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';
import { File as FileInterface } from '../interfaces/file.interface';
import { FileUploadStatus } from '../enums/uploadStatus.enum';

type FileCreationAttributes = Optional<FileInterface, 'fileId' | 'createdAt' | 'updatedAt' | 'trashedAt' | 'deletedAt'>;

export class File extends Model<FileInterface, FileCreationAttributes> implements FileInterface {
    public fileId!: bigint;
    public folderId!: bigint;
    public originalFilename!: string;
    public uniqueFilename!: string;
    public totalSize!: bigint;
    public totalChunks!: number;
    public status!: FileUploadStatus;
    public mimeType!: string;
    public fileExtension!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
    public trashedAt?: Date;
    public deletedAt?: Date;

    static override tableName = 'files';

    static initialize() {
        return this.init({
            fileId: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            folderId: {
                type: DataTypes.BIGINT,
                allowNull: true,  // for root folder
            },
            originalFilename: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            uniqueFilename: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            totalSize: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            totalChunks: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM(...Object.values(FileUploadStatus)),
                defaultValue: FileUploadStatus.IN_PROGRESS,
            },
            mimeType: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            fileExtension: {
                type: DataTypes.STRING,
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
            trashedAt: {
                type: DataTypes.DATE,
            },
            deletedAt: {
                type: DataTypes.DATE,
            },
        }, {
            sequelize,
            tableName: File.tableName,
            modelName:'File',
            timestamps: true,
            paranoid: true, // Enable soft delete (trashedAt and deletedAt)
        });
    }
}

// // Initialize the model after the class definition
// File.initialize();
