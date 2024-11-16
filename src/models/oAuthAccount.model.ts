import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';
import { OAuthAccount as OAuthAccountInterface } from '../interfaces/oAuthAccount.interface';
import { AuthProvider } from '../enums/authProvider.enum';

type OAuthAccountCreationAttributes = Optional<OAuthAccountInterface, 'authAccountId' | 'createdAt' | 'updatedAt'>;

export class OAuthAccount extends Model<OAuthAccountInterface, OAuthAccountCreationAttributes> implements OAuthAccountInterface {
    public authAccountId!: bigint;
    public userId!: bigint;
    public provider!: AuthProvider;
    public externalId!: string;
    public accessToken!: string;
    public refreshToken!: string;
    public createdAt!: Date;
    public updatedAt!: Date;

    static override tableName = 'oauth_accounts';

    static initialize() {
        return this.init({
            authAccountId: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            provider: {
                type: DataTypes.ENUM(...Object.values(AuthProvider)),
                allowNull: false,
            },
            externalId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            accessToken: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            refreshToken: {
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
            tableName: OAuthAccount.tableName,
            modelName: 'OAuthAccount',
            timestamps: true,
        });
    }
}

// // Initialize the model after the class definition
// OAuthAccount.initialize();
