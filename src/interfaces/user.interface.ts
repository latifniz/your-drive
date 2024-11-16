export interface User {
    userId?: bigint;
    username: string;
    email: string;
    passwordHash?: string;
    oauth_authenticated? : boolean;
    githubAccountId?: bigint; // Reference to the GitHubAccount table, if the user is authenticated via GitHub
    createdAt?: Date; // Timestamp when the user registered
    updatedAt?: Date; // Timestamp when the user information was last updated
  }