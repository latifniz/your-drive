import { GitHubAccountModel, UserModel } from "../models";


export async function getData() {
     try  {

   const user =  await UserModel.findOne({where:{userId:1}});
   const github_account = await GitHubAccountModel.findByPk(user?.githubAccountId);

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