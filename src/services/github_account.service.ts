import { GitHubAccountModel, UserModel } from "../models";

export class GitHubAccountService {
  static async findAccountById(id: bigint) {
    try {
      return await GitHubAccountModel.findByPk(id, {
        attributes: {
          exclude: ["userId"],
        },
      });
    } catch (err) {
      throw new Error(`Error finding GitHub account by ID: ${err}`);
    }
  }

  static async assignGithubAccount() {
    try {
      // Find the GitHub account with the least number of associated users
      const githubAccounts = await GitHubAccountModel.findAll();
      const userCountPromises = githubAccounts.map(async (account) => {
        const userCount = await UserModel.findAll({
          where: { githubAccountId: account.githubAccountId },
        });
        return { account, userCountLength: userCount.length };
      });

      const userCounts = await Promise.all(userCountPromises);

      // Find the GitHub account with the least number of users
      let github_account = null;
      let totalUsers = Infinity; // Start with a high number to find the minimum
      for (const { account, userCountLength } of userCounts) {
        if (userCountLength < totalUsers) {
          github_account = account;
          totalUsers = userCountLength;
        }
      }

      return github_account; // Return the account with the least users
    } catch (err) {
      throw new Error(`Error assigning GitHub account to user: ${err}`);
    }
  }
}
