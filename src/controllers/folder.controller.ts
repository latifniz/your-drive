import { FolderModel, FileModel, UserModel, } from "../models";
import { Request, Response,NextFunction } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { GitHubAccountService } from "../services/github_account.service";
import { RepositoryService } from "../services/repository.service";


export class FolderController {

 static async createFolder(req: Request, res: Response) { 
        try {
        const name = req.body.name as string;
        const parentId = req.body.parentId as unknown as bigint;
        const userId = req.body.user.userId as unknown as bigint;

       // check if folder name already exists in parent folder
        const existingFolder = await FolderController.getFolderByName(name, parentId);
        if(existingFolder) {
            res.status(409).json(new ApiResponse(409, {
                message: "Folder already exists in the parent folder."
            }));
            return;
        }
        const folder = await FolderModel.create({
            userId,
            folderName: name,
            parentId
        });
        res.status(201).json(new ApiResponse(201, folder));
    } catch (err) {
        console.error(err);
        res.status(500).json(new ApiResponse(500, { message: 'Failed to create folder.' }));
    }
}

  private static async getFolderByName(name: string,parentId:bigint){
    // check if same name folder exists in same parent folder
       try {
           return await FolderModel.findOne({
             where: { folderName: name, parentId: parentId }
          })
       } catch(err) {
         console.error(err);
         throw new Error('Failed to retrieve folder by name.');
       }
  }
  static async getAllFoldersByParentId(req:Request, res:Response) {
     try {
         const parentId = req.params["parentId"] as unknown as bigint;
         const userId = req.body.user.userId as unknown as bigint;

         const folders = await FolderModel.findAll({ where: { parentId , userId} });
         
         res.json(new ApiResponse(200, folders));
     } catch (err) {
         console.error(err);
         res.status(500).json(new ApiResponse(500, { message: 'Failed to get folders.' }));
     }
  }
  static async getFolderById(req:Request, res:Response) {
     try {
         const folderId = req.params["folderId"] as unknown as bigint;
         const userId = req.body.user.userId as unknown as bigint;
         const folder = await FolderModel.findOne({
            where:{folderId: folderId, userId}
         });
         if(!folder) {
             res.status(404).json(new ApiResponse(404, { message: 'Folder not found.' }));
             return;
         }
         res.json(new ApiResponse(200, folder));
     } catch (err) {
         console.error(err);
         res.status(500).json(new ApiResponse(500, { message: 'Failed to get folder.' }));
     }
  }
  static async renameFolder(req: Request, res: Response) {
     try {
         const folderId = req.body.folderId as unknown as bigint;
         const newName = req.body.newName as string;
         const userId = req.body.user.userId as unknown as bigint;
         const folder = await FolderModel.findOne({ where: { folderId, userId } });
         if (!folder) {
             res.status(404).json(new ApiResponse(404, { message: 'Folder not found.' }));
             return;
         }
         folder.folderName = newName;
         await folder.save();
         res.json(new ApiResponse(200, folder));
     } catch (err) {
         console.error(err);
         res.status(500).json(new ApiResponse(500, { message: 'Failed to rename folder.' }));
     }
  }
  
  static async deleteFolderById(req: Request, res: Response) {
    // delete all children folders and files
    // get all folders inside this
    const folderId = req.params["folderId"] as unknown as bigint;
    const userId = req.body.user.userId as unknown as bigint;
    // check if it's root folder , we can't delete root folder
    const isRootFolder = await FolderController.isRootFolder(folderId);
    if(isRootFolder) {
        res.status(400).json(new ApiResponse(400, {} ,'Cannot delete root folder.'));
        return;
    }
     // get the github account of user to delete repos from
     const githubAccount = await GitHubAccountService.findAccountById(
        (await UserModel.findByPk(userId))?.dataValues.githubAccountId!
     );
    
    const childFolderIds = await FolderModel.findAll({
        where: { parentId: folderId, userId },
        attributes: ['folderId']
    });
    // get all files inside all these folders;
    const fileIds = await FileModel.findAll({
        where: { folderId: childFolderIds.map(folder => folder.folderId) },
        attributes: ['fileId']
    });
    
    // here delete everything from the server 
    const allRepos = await RepositoryService.getRepositoriesByFileIds(fileIds.map(file => file.fileId))

    // most expensive task make it to background
     RepositoryService.deleteAllRepos(
        allRepos.map(repo => repo.repositoryName),
        githubAccount?.dataValues.githubUsername!,
        githubAccount?.dataValues.accessToken!
    )
   
    // delete the folder itself (it will cascade and delete all the files and chunks and repos)

    FolderModel.destroy({ where: { folderId, userId } });
    res.status(204).json(new ApiResponse(204, null));
  }

   static async doParentFolderExitst(req: Request, res: Response, next: NextFunction) {
     try {
        const folderId = (req.params["parentId"] || 
                          req.params["folderId"] ||
                          req.body.folderId ||
                          req.body.parentId) as unknown as bigint;
                          
        const folder = await FolderModel.findByPk(folderId);
        if(!folder) {
          res.status(404).json(new ApiResponse(404,{
            message: 'Folder With This Id Doesnt Exits.'
          }));
          return;
        }
        next();
     } catch(err) {
         console.error(err);
         next(err); 

     }
  }

  private static async isRootFolder(folderId:bigint) {
     try {
         const rootFolder = await FolderModel.findOne({ where: { folderId, parentId:undefined } });
         return rootFolder ? true : false;
     } catch(err) {
         console.error(err);
         throw new Error('Failed to retrieve root folder.');
     }
  }
}