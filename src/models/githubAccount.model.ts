import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';
import { GitHubAccount as GitHubAccountInterface } from '../interfaces/githubaAccount.interface';

type GitHubAccountCreationAttributes = Optional<GitHubAccountInterface, 'githubAccountId' | 'createdAt' | 'updatedAt'>;

export class GitHubAccount extends Model<GitHubAccountInterface, GitHubAccountCreationAttributes> implements GitHubAccountInterface {
    public githubAccountId!: bigint;
    public isAssigned?: boolean;
    public githubUsername!: string;
    public githubUserEmail!: string;
    public githubUserPassword!: string;
    public accessToken!: string;
    public createdAt!: Date;
    public updatedAt!: Date;

    static override tableName = 'github_accounts';

    static initialize() {
        return this.init({
            githubAccountId: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            isAssigned: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,  // empty github account can also exist
            },
            githubUsername: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            githubUserEmail: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            githubUserPassword: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            accessToken: {
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
        }, {
            sequelize,
            tableName: GitHubAccount.tableName,
            modelName: 'GitHubAccount',
            timestamps: true,
        });
    }
}

// // Initialize the model after the class definition
// GitHubAccount.initialize();
