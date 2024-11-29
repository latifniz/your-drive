import { GitHubAccountModel, UserModel } from "../models";
import sequelize from "sequelize";

export class GitHubAccountService  {
    
    static async findAccountById(id:bigint) {
        try {
            return await GitHubAccountModel.findByPk(id,{
                attributes: {
                    exclude:['userId']
                }
            });
        } catch (err) {
            throw new Error(`Error finding GitHub account by ID: ${err}`);
        }
    }

    static async assignGithubAccount() {
        try {
            // Find the GitHub account with the least number of associated users
            const account = await GitHubAccountModel.findOne({
                attributes: {
                    include: [
                        [
                            sequelize.fn('COUNT', sequelize.col('Users.userId')), // Dynamically count users
                            'userCount', // Alias for the count
                        ],
                    ],
                },
                include: [
                    {
                        model: UserModel,
                        attributes: [], // Exclude user details
                    },
                ],
                group: ['GitHubAccount.githubAccountId'], // Group by account ID
                order: [[sequelize.literal('userCount'), 'ASC']], // Order by count
            });
    
            return account || null;
        } catch (err) {
            throw new Error(`Error assigning GitHub account to user: ${err}`);
        }
    }
       
}