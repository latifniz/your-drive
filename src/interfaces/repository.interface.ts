export interface Repository {
  repoId?: bigint;
  githubAccountId: bigint; // Reference to the GitHubAccount table
  repositoryName: string;
  repositoryURL: string;
  size: number;
  createdAt?: Date; // Timestamp when the repository was created
  updatedAt?: Date; // Timestamp when the repository information was last updated
}