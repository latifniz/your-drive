import { AuthProvider } from "../enums/authProvider.enum";

export interface OAuthAccount {
    authAccountId?: bigint;
    userId: bigint;  // Reference to the Users table
    provider: AuthProvider; // Auth provider
    externalId: string;  // External provider's user ID
    accessToken: string;
    refreshToken: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  