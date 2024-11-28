import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';
import { UserStorageInterface } from '../interfaces/userStorage.interface';  // Import the interface

type UserStorageCreationAttributes = Optional<UserStorageInterface, 'userId' | 'usedStorage' | 'createdAt' | 'updatedAt'>;

export class UserStorage extends Model<UserStorageInterface, UserStorageCreationAttributes> implements UserStorageInterface {
    public userId!: bigint;
    public storageId!: bigint;
    public usedStorage!: bigint; // Storage usage in bytes
    public totalStorage!: bigint; // Total storage in bytes
    public createdAt!: Date;
    public updatedAt!: Date;

    static override tableName = 'user_storage';

    static initialize() {
        return this.init({
            storageId: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true
            },
            userId: {
                type: DataTypes.BIGINT,
                allowNull: false
            },
            usedStorage: {
                type: DataTypes.BIGINT,
                allowNull: false
            },
            totalStorage: {
                type: DataTypes.BIGINT,
                defaultValue: 0,  // Initialize with 0 total storage
                allowNull: false
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false
            },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false
            }
        }, {
            sequelize,
            tableName: UserStorage.tableName,
            modelName: 'UserStorage',
            timestamps: true,
        });
    }
}
