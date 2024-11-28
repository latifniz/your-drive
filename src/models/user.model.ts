import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';
import { User as UserInterface } from '../interfaces/user.interface';

type UserCreationAttributes = Optional<UserInterface, 'userId' | 'createdAt' | 'updatedAt'>;

export class User extends Model<UserInterface, UserCreationAttributes> implements UserInterface {
    public userId!: bigint;
    public username!: string;
    public email!: string;
    public passwordHash!: string;
    public oauth_authenticated?: boolean;
    public githubAccountId!: bigint; // Reference to the GitHubAccount table
    public createdAt!: Date;
    public updatedAt!: Date;

    static override tableName = 'users';

    static initialize() {
        return this.init({
            userId: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            passwordHash: {
                type: DataTypes.STRING,
                allowNull:false
            },
            oauth_authenticated: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            githubAccountId: {
                type: DataTypes.BIGINT,
                allowNull: false, // User requires a GitHubAccount
                references: {
                    model: 'github_accounts', // Name of the GitHubAccount model
                    key: 'githubAccountId'
                },
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
            tableName: User.tableName,
            modelName: 'User',
            timestamps: true,
        });
    }
}