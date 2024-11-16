import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';
import { Repository as RepositoryInterface } from '../interfaces/repository.interface';

type RepositoryCreationAttributes = Optional<RepositoryInterface, 'repoId' | 'createdAt' | 'updatedAt'>;

export class Repository extends Model<RepositoryInterface, RepositoryCreationAttributes> implements RepositoryInterface {
    public repoId!: bigint;
    public githubAccountId!: bigint;
    public repositoryName!: string;
    public repositoryURL!: string;
    public size!: number;
    public createdAt!: Date;
    public updatedAt!: Date;

    static override tableName = 'repositories';

    static initialize() {
        return this.init({
            repoId: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            githubAccountId: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            repositoryName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            repositoryURL: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            size: {
                type: DataTypes.INTEGER, // in bytes
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
            tableName: Repository.tableName,
            modelName: 'Repository',
            timestamps: true,
        });
    }
}

// // Initialize the model after the class definition
// Repository.initialize();
