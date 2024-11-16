import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';
import { Plan as PlanInterface } from '../interfaces/plan.interface';
import { BillingCycle } from '../enums/billingCycle.enum';
import { PlanType } from '../enums/planType.enum';

type PlanCreationAttributes = Optional<PlanInterface, 'planId' | 'createdAt' | 'updatedAt'>;

export class Plan extends Model<PlanInterface, PlanCreationAttributes> implements PlanInterface {
    public planId!: bigint;
    public name!: PlanType;
    public description!: string;
    public storageLimit!: bigint;
    public price!: number;
    public billingCycle!: BillingCycle;
    public createdAt!: Date;
    public updatedAt!: Date;

    static override tableName = 'plans';

    static initialize() {
        return this.init({
            planId: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.ENUM(...Object.values(PlanType)),
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            storageLimit: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            price: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            billingCycle: {
                type: DataTypes.ENUM(...Object.values(BillingCycle)),
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
            tableName: Plan.tableName,
            modelName: 'Plan',
            timestamps: true,
        });
    }
}


// // Initialize the model after the class definition
// User.initialize();