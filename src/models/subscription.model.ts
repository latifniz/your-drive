import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';
import { Subscription as SubscriptionInterface } from '../interfaces/subscription.interface';
import { SubscriptionStatus } from '../enums/subscription.enum';

type SubscriptionCreationAttributes = Optional<SubscriptionInterface, 'subscriptionId' | 'createdAt' | 'updatedAt'>;

export class Subscription extends Model<SubscriptionInterface, SubscriptionCreationAttributes> implements SubscriptionInterface {
    public subscriptionId!: bigint;
    public userId!: bigint;
    public planId!: bigint;
    public startDate!: Date;
    public endDate!: Date;
    public status!: SubscriptionStatus;
    public createdAt!: Date;
    public updatedAt!: Date;

    static override tableName = 'subscriptions';

    static initialize() {
        return this.init({
            subscriptionId: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            planId: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            startDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            endDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM(...Object.values(SubscriptionStatus)),
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
            tableName: Subscription.tableName,
            modelName: 'Subscription',
            timestamps: true,
        });
    }
}

// // Initialize the model after the class definition
// Subscription.initialize();
