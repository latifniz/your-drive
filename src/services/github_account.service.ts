import { GitHubAccountModel } from "../models";


export class GitHubAccountService  {
    
    static async findAccountById(id:bigint) {
        try {
            return await GitHubAccountModel.findByPk(id);
        } catch (err) {
            throw new Error(`Error finding GitHub account by ID: ${err}`);
        }
    }
    
   
}