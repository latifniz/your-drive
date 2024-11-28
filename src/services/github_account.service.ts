import { GitHubAccountModel } from "../models";


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
             const account = await GitHubAccountModel.findOne({
                where: {isAssigned:false},
                attributes: {
                    exclude:['userId']
                }
            });
             if(account) {
             account.isAssigned = true;
             await account.save();
             return account;
             }
             return null;
         } catch (err) {
             throw new Error(`Error assigning GitHub account to user: ${err}`);
         }
    }
    static async unassignAccount(accountId:bigint) {
         try {
             const account = await GitHubAccountModel.findByPk(accountId);
             if(account) {
             account.isAssigned = false;
             await account.save();
             }
         } catch (err) {
             throw new Error(`Error unassigning GitHub account from user: ${err}`);
         }
    }
    
   
}