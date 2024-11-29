export interface GitHubAccount {
    githubAccountId?: bigint;
    githubUsername: string;
    githubUserEmail: string;
    githubUserPassword: string;
    accessToken: string; // OAuth access token for the GitHub account
    createdAt?: Date; // When the account was created
    updatedAt?: Date; // When the account was last updated
}
