import { User } from './user.model';
import { File } from './file.model';
import  { Chunk } from './chunk.model';
import { Folder } from './folder.model';
import { GitHubAccount } from './githubAccount.model'
import { OAuthAccount } from './oAuthAccount.model';
import { Plan } from './plan.model';
import { Subscription } from './subscription.model';
import { Repository } from './repository.model';
import { Download } from './download.model';
import { UserStorage } from './userStorage.model';

// Initialize the models
GitHubAccount.initialize();
User.initialize();
Folder.initialize();
File.initialize();
Chunk.initialize();
OAuthAccount.initialize();
Subscription.initialize();
Plan.initialize();
Repository.initialize();
Download.initialize();
UserStorage.initialize();


// User-to-Folder: A user owns multiple folders.
User.hasMany(Folder, { foreignKey: 'userId', onDelete: 'CASCADE' });
Folder.belongsTo(User, { foreignKey: 'userId' });

// Folder-to-Folder (Hierarchical Folders): A folder can contain subfolders.
Folder.hasMany(Folder, { as: 'subfolders', foreignKey: 'parentId', onDelete: 'CASCADE' });
Folder.belongsTo(Folder, { as: 'parent', foreignKey: 'parentId', onDelete: 'CASCADE' });

// Folder-to-File: A folder contains multiple files.
Folder.hasMany(File, { foreignKey: 'folderId', onDelete: 'CASCADE' });
File.belongsTo(Folder, { foreignKey: 'folderId' });

// File-to-Chunk: A file consists of multiple chunks (e.g., for large files).
File.hasMany(Chunk, { foreignKey: 'fileId', onDelete: 'CASCADE' });
Chunk.belongsTo(File, { foreignKey: 'fileId' });

// Download-to-File: A download references a file.
File.hasMany(Download, { foreignKey: 'fileId', onDelete: 'CASCADE' });
Download.belongsTo(File, { foreignKey: 'fileId' });

// (Optional) Download-to-User: If tracking which user initiated the download.
User.hasMany(Download, { foreignKey: 'userId', onDelete: 'CASCADE' });
Download.belongsTo(User, { foreignKey: 'userId' });

// User-to-GitHubAccount: A user can have one GitHub account.
User.belongsTo(GitHubAccount, { foreignKey: 'githubAccountId' });

// OAuthAccount-to-User: A user can have one OAuth account (e.g., Google login).
User.hasOne(OAuthAccount, { foreignKey: 'userId', onDelete: 'SET NULL' });
OAuthAccount.belongsTo(User, { foreignKey: 'userId' });

// User-to-Subscription: A user can have one subscription plan.
User.hasOne(Subscription, { foreignKey: 'userId', onDelete: 'CASCADE' });
Subscription.belongsTo(User, { foreignKey: 'userId' });

// Plan-to-Subscription: A subscription references a specific plan.
Plan.hasMany(Subscription, { foreignKey: 'planId', onDelete: 'CASCADE' });
Subscription.belongsTo(Plan, { foreignKey: 'planId' });

// GitHubAccount-to-Repository: A GitHub account owns multiple repositories.
GitHubAccount.hasMany(Repository, { foreignKey: 'githubAccountId', onDelete: 'CASCADE' });
Repository.belongsTo(GitHubAccount, { foreignKey: 'githubAccountId' });

// User-to-UserStorage: A user has a single storage allocation.
User.hasOne(UserStorage, { foreignKey: 'userId', onDelete: 'CASCADE' });
UserStorage.belongsTo(User, { foreignKey: 'userId' });


export  {
    User,
    File,
    Chunk,
    Folder,
    Repository,
    GitHubAccount,
    OAuthAccount,
    Subscription,
    Plan,
    Download,
    UserStorage,
}
