import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';
import { User as UserInterface } from '../interfaces/user.interface';
// import bcrypt from 'bcrypt'


type UserCreationAttributes = Optional<UserInterface, 'userId' | 'createdAt' | 'updatedAt'>;

export class User extends Model<UserInterface, UserCreationAttributes> implements UserInterface {
    public userId!: bigint;
    public username!: string;
    public email!: string;
    public passwordHash?: string;
    public oauth_authenticated?: boolean;
    public githubAccountId?: bigint; // Reference to the GitHubAccount table, if the user is authenticated via GitHub
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
                allowNull:true
            },
            oauth_authenticated: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            githubAccountId: {
                type: DataTypes.BIGINT,
                allowNull: false, // Users without GitHub authentication don't have a reference to a GitHubAccount
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


// // Instance method for password comparison
// export const comparePassword = async (user: User, password: string): Promise<boolean> => {
//     if (!user.passwordHash) {
//         return false; // No password to compare against (OAuth user)
//     }
    
//     return await bcrypt.compare(password, user.passwordHash);
// };

// // Hooks for password hashing
// const hashPassword = async (user: User) => {
//     if (user.passwordHash) {
//         user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
//     }
// };

// const onBeforeCreate = async (user: User) => {
//     if (user.passwordHash) {
//         await hashPassword(user);
//     }
// };

// const onBeforeUpdate = async (user: User) => {
//     if (user.changed('passwordHash') && user.passwordHash) {
//         return await hashPassword(user);
//     }
//     return Promise.resolve(); // Ensure a promise is returned
// };

// // Add hooks to the User model
// User.addHook('beforeCreate', onBeforeCreate);
// User.addHook('beforeUpdate', onBeforeUpdate);

// // Initialize the model after the class definition
// User.initialize();