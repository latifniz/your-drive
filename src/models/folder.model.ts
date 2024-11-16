import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';
import { Folder as FolderInterface } from '../interfaces/folder.interface';

type FolderCreationAttributes = Optional<FolderInterface, 'folderId' | 'createdAt' | 'updatedAt' | 'trashedAt' | 'deletedAt'>;

export class Folder extends Model<FolderInterface, FolderCreationAttributes> implements FolderInterface {
    public folderId!: bigint;
    public userId!: bigint;
    public folderName!: string;
    public parentId?: bigint;
    public createdAt!: Date;
    public updatedAt!: Date;
    public trashedAt?: Date;
    public deletedAt?: Date;

    static override tableName = 'folders';

    static initialize() {
        return this.init({
            folderId: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
               type: DataTypes.BIGINT,
               allowNull: false
            },
            folderName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            parentId: {
                type: DataTypes.BIGINT,
                allowNull: true // root folder will not have any parent
                
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
            tableName: Folder.tableName,
            modelName: 'Folder',
            timestamps: true,
            paranoid: true,
        });
    }
}

// // Initialize the model after the class definition
// Folder.initialize();
