import { RepositoryModel } from '../models/index';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { GitHubAccount } from '../interfaces/githubaAccount.interface';
import simpleGit, { SimpleGit } from 'simple-git';

export class RepositoryService {
  private githubAccount: GitHubAccount;
  private folderPath: string;
  private repositoryInstance: RepositoryModel | null;
  private localGitRepository: null | string;
  private uploadCountOnThisRepository: number;
  private git: SimpleGit; // Initialize simple-git instance

  constructor(githubAccount: GitHubAccount, folderPath: string) {
    this.githubAccount = githubAccount;
    this.folderPath = folderPath;
    this.repositoryInstance = null;
    this.uploadCountOnThisRepository = 0;
    this.localGitRepository = null;

    // Initialize simple-git instance
    this.git = simpleGit();
  }

  // Create a new repository with retry logic and delay
private async createRepository(): Promise<void> {
    try {
      const repositoryName = this.generateUniqueRepositoryName();
      const repositoryURL = await this.createGithubRepository(repositoryName);
      const repository = await RepositoryModel.create({
        repositoryName,
        repositoryURL: repositoryURL!,
        githubAccountId: this.githubAccount.githubAccountId!,
        size: 0,
      });
      this.repositoryInstance = repository;
    } catch (error) {
      console.error('Failed to create repository', error);
      throw new Error('Failed to create repository');
    }
  }

  // Creates a GitHub repository and returns the URL
  private async createGithubRepository(repositoryName: string): Promise<string | null> {
    const url = 'https://api.github.com/user/repos';
    const data = {
      name: repositoryName,
      private: true,
      description: 'This is a sample repository created via Node.js',
    };
    try {
      const response = await axios.post(url, data, {
        headers: {
          'Authorization': `Bearer ${this.githubAccount.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const repoUrl = `https://github.com/${this.githubAccount.githubUsername}/${repositoryName}`;
      if (response.status === 201) {
        console.log(`Repository created successfully: ${response.status}`);
        return repoUrl;
      }
      return null;
    } catch (error) {
      throw new Error(`Error creating repository: ${error}`);
    }
  }

  // Initializes a local git repository
private async createLocalGitRepository(): Promise<void> {
  const localRepositoryPath = this.folderPath;

  try {
    // Initialize a new Git repository
    await this.git.cwd(localRepositoryPath).init();

    // Set the user name and email for this repository (local only)
    await this.git.cwd(localRepositoryPath).addConfig('user.name', this.githubAccount.githubUsername);
    await this.git.cwd(localRepositoryPath).addConfig('user.email', `${this.githubAccount.githubUserEmail}`);

    // Check if the remote origin already exists
    const remotes = await this.git.cwd(localRepositoryPath).getRemotes(true);
    const originExists = remotes.some(remote => remote.name === 'origin');

    if (originExists) {
      // If 'origin' exists, update its URL
      await this.git.cwd(localRepositoryPath).remote(['set-url', 'origin', `https://github.com/${this.githubAccount.githubUsername}/${this.repositoryInstance?.repositoryName}`]);
    } else {
      // If 'origin' does not exist, add it
      await this.git.cwd(localRepositoryPath).addRemote('origin', `https://github.com/${this.githubAccount.githubUsername}/${this.repositoryInstance?.repositoryName}`);
    }

    // Set the branch to 'main'
    await this.git.cwd(localRepositoryPath).branch(['-M', 'main']);
    this.localGitRepository = localRepositoryPath;

  } catch (error) {
    throw new Error(`Failed to create local Git repository: ${error}`);
  }
}

  // Uploads a file/chunk to the specified repository
  public async uploadFileToRepository(fileName: string) {
    try {
      // Create repository instance if not exists
      if (this.repositoryInstance == null) {
        await this.createRepository();
      }
  
      // Create local repository if not exists
      if (this.localGitRepository == null) {
        await this.createLocalGitRepository();
      }
  
      const localRepositoryPath = this.folderPath;
      const filePath = path.join(this.folderPath, fileName);
  
      // Add files to the repository
      await this.git.cwd(localRepositoryPath).add(fileName);
  
      // Commit the changes
      await this.git.cwd(localRepositoryPath).commit(`Upload chunk ${fileName}`);
  
      // Push the changes to GitHub
      const pushCommand = `https://${this.githubAccount.githubUsername}:${this.githubAccount.accessToken}@github.com/${this.githubAccount.githubUsername}/${this.repositoryInstance!.repositoryName!}.git`;
      await this.pushWithRetry(localRepositoryPath,pushCommand,'main',5,1000);
  
      console.log(`Successfully uploaded ${fileName} to GitHub`);
      this.uploadCountOnThisRepository++;
  
      // Update the repository size
      await this.updateRepositorySize((await fs.promises.stat(filePath)).size);
  
      let repoId = this.repositoryInstance?.dataValues.repoId!;
      // Check repository file count and size
      if (this.repositoryInstance?.size! > 900*1024*1024) { // approx 950 MB
        // Delete local Git repository and remote repository
        repoId = this.repositoryInstance?.dataValues.repoId!;
        await this.deleteLocalGitRepository(localRepositoryPath);
        await this.deleteRepositoryInstance();
  
        // // Create a new repository
        // await this.createRepository();
        // await this.createLocalGitRepository();
        this.uploadCountOnThisRepository = 0; // Reset upload count
        return repoId;
      }

      return repoId;
    } catch (error) {
    
      // Attempt to delete local repo and instance if an error occurs
      try {
        await this.deleteLocalGitRepository(this.folderPath);
        await this.deleteRepositoryInstance();
      } catch (deleteError) {
        console.error(`Failed to clean up after error: ${deleteError}`);
      }
      console.error(`Error occurred during upload: ${error}`);
      throw new Error(`Failed to upload chunk: ${error}`);
    }
  }
  
  private generateUniqueRepositoryName(): string {
    return `dev_${Date.now()}`;
  }

  private async updateRepositorySize(newBytes: number) {
    try {
      const newSize = this.repositoryInstance?.size! + newBytes;
      await this.repositoryInstance!.update({ size: newSize});
    } catch (err) {
      throw new Error(`Failed to update repository size: ${err}`);
    }
  }

  public async deleteLocalGitRepository(localRepositoryPath?: string) {
    try {
      localRepositoryPath = localRepositoryPath || this.folderPath;
      // Remove the .git directory using fs
      await fs.promises.rm(path.join(localRepositoryPath, '.git'), { recursive: true, force: true });
      
      // Optionally, you can log or do something after deletion
      console.log(`Successfully deleted local Git repository at: ${localRepositoryPath}`);
      
      this.localGitRepository = null;
    } catch (error) {
      throw new Error(`Failed to delete local repository: ${error}`);
    }
  }
  

  private async deleteRepositoryInstance() {
    try {
      if (this.repositoryInstance) {
        this.repositoryInstance = null;
      }
    } catch (error) {
      throw new Error(`Failed to delete repository instance: ${error}`);
    }
  }

  public getRepositoryInstanceId() {
    return this.repositoryInstance?.repoId;
  }

private delay = (ms:number) => new Promise(resolve => setTimeout(resolve, ms));

private async  pushWithRetry(localRepositoryPath:string, pushCommand:string, branch = 'main', retries = 5, delayMs = 1000) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            await this.git.cwd(localRepositoryPath).push(pushCommand, branch);
            console.log(`Push successful on attempt ${attempt + 1}`);
            return; // Exit if successful
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed: ${error}`);
            if (attempt < retries - 1) {
                console.log(`Retrying in ${delayMs}ms...`);
                await this.delay(delayMs); // Wait before retrying
            } else {
                console.error('All retry attempts failed.');
                throw error; // Re-throw the error if all retries fail
            }
        }
    }
}

public static async findRepoUrl(repoId:bigint) {
  try {
    const repo = await RepositoryModel.findByPk(repoId);
    if (repo) {
      return repo.dataValues.repositoryURL;
    } else {
      throw new Error('Repository not found');
    }
  } catch (err) {
    throw new Error(`Failed to find repository URL by ID: ${err}`);
  }
}


}
