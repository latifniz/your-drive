import { UserModel } from "../models";
import { GitHubAccountService } from "../services/github_account.service";


export async function getData() {
     try  {

   const user =  await UserModel.findOne({where:{userId:1}});
   const github_account = await GitHubAccountService.findAccountById(user?.githubAccountId!);

   const folderId = 1;

   return {
     user,
     github_account,
     folderId
   } 
}    catch(err) {
    console.error(err);
    throw new Error('Failed to get data');
}

}