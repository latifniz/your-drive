import { Request, Response } from "express";
import { FolderModel, UserModel, UserStorageModel } from "../models";
import { ApiResponse } from "../utils/ApiResponse";
import { generateToken } from "../utils/jwt";
import { hashPassword, validatePassword } from "../utils/bcrypt";
import { GitHubAccountService } from "../services/github_account.service";
import { PlanService } from "../services/plan.service";
import { PlanType } from "../enums/planType.enum";
import { BillingCycle } from "../enums/billingCycle.enum";
import { SubscriptionService } from "../services/subscription.service";
import { bytesToGB } from "../utils/helper.functions";
import { sequelize } from "../config/database.config";


export class UserController  {

    static async createUser(req:Request,res:Response) {
      const transaction = await sequelize.transaction(); // Start a transaction
         try {
            // check if user already exists
           const existingUser = await UserController.findUserByEmail(req.body.email);
           if(existingUser) {
             res.status(409).json(new ApiResponse(409,{
                message: "User already exists"
             }));
             return;
           }
           // assign a github account for this user
           const githubAccount = await GitHubAccountService.assignGithubAccount();
           if(!githubAccount) {
            res.status(503).json(new ApiResponse(503,{
                message: "Account creation limit reached. Please try again in a few days."
              }));
              return;
           }
           const hashedPassword = await hashPassword(req.body.password);
           const user = await UserModel.create({
            username: req.body.username,
            email: req.body.email,
            passwordHash: hashedPassword,
            githubAccountId: githubAccount.dataValues.githubAccountId!
           });
           
           // create root folder entry
          const folder = await FolderModel.create({
             userId: user.dataValues.userId!,
             folderName: "root",
           });
           // create plan for user
           const plan = await PlanService.createPlan(PlanType.FREE,BillingCycle.MONTHLY);
           await SubscriptionService.createSubscription(user.dataValues.userId!,plan.dataValues.planId!);
           const storage = await UserStorageModel.create({
               userId: user.dataValues.userId!,
               totalStorage: plan.dataValues.storageLimit,
               usedStorage: BigInt(0),
           });
           // generate and send the access token to the user
           const accessToken = generateToken({
             username:user.dataValues.username,
             userId: user.dataValues.userId!
           },'72h');

           res.status(201).json(new ApiResponse(201, {
             accessToken: accessToken,
             userId: user.dataValues.userId!,
             totalStorage: bytesToGB(storage.dataValues.totalStorage),
             usedStorage: bytesToGB(storage.dataValues.usedStorage),
             folderId: folder.dataValues.folderId!
           }));
           
           await transaction.commit();
         } catch (err) {
           await transaction.rollback(); 
            console.error('Error in user creation:', err);
            res.status(500).json(new ApiResponse(500,{
                message: 'Internal Server Error',
            }));
         }
    }

    static async login(req: Request, res: Response) {
        try {
          const { email, password } = req.body;
    
          // Find user in the database
          const user = await UserModel.findOne({ where: { email } });
          if (!user) {
             res.status(404).json(new ApiResponse(404, {
                message: 'User not found'
  
            }));
            return;
          }
    
          // Validate password
          const isPasswordValid = await validatePassword(password,user.dataValues.passwordHash!);
          if (!isPasswordValid) {
            res.status(401).json(new ApiResponse(401,{
                message: 'Invalid Email or Password'
            }));
            return;
          }
          // get root folder 
          const folder = await FolderModel.findOne({
            where: { userId: user.dataValues.userId!, folderName: "root" },
          });
          if(!folder) {
            throw new Error(`Root folder not found for user ${user.dataValues.userId}`);
          }
          // get user storage
          // get total and used storage 
          const storage = await UserStorageModel.findOne({
            where: { userId: user.dataValues.userId! },
          });
          if(!storage) {
            throw new Error(`User Storage not found for user ${user.dataValues.userId}`);
          }
          // Generate JWT
          const accessToken = generateToken({
            username: user.dataValues.username,
            userId: user.dataValues.userId!
          },'72h');
    
          // Respond with the token
          res.status(200).json(new ApiResponse(200, {
            accessToken,
            userId: user.dataValues.userId!,
            totalStorage: bytesToGB(storage.dataValues.totalStorage),
            usedStorage: bytesToGB(storage.dataValues.usedStorage),
            folderId: folder.dataValues.folderId!
          }));
        } catch (err) {
          console.error(err);
          res.status(500).json(new ApiResponse(500, {
            message: 'Internal Server Error'
          }));
        }
    }
    static async findUserByEmail(email:string) {
        try { 
            return await UserModel.findOne({where: {email:email}});
            
        } catch(err) {
            console.log(err);
            throw new Error("Internal Server Error");
        }
    }
}