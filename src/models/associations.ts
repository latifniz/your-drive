import { User } from './user.model';
import { File } from './file.model';
import  { Chunk } from './chunk.model';
import { Folder } from './folder.model';
import { GitHubAccount } from './githubAccount.model'
import { OAuthAccount } from './oAuthAccount.model';
import { Plan } from './plan.model';
import { Subscription } from './subscription.model';
import { Repository } from './repository.model';

// Initialize the models
User.initialize();
File.initialize();
Chunk.initialize();
Folder.initialize();
GitHubAccount.initialize();
OAuthAccount.initialize();
Plan.initialize();
Subscription.initialize();
Repository.initialize();

// User associations
User.hasMany(File, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Folder, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasOne(GitHubAccount, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasOne(OAuthAccount, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasOne(Subscription, { foreignKey: 'userId', onDelete: 'CASCADE' });


// File associations
File.belongsTo(User, { foreignKey: 'userId' });
File.belongsTo(Folder, { foreignKey: 'folderId' });
File.hasMany(Chunk, { foreignKey: 'fileId', onDelete: 'CASCADE' });

// Chunk associations
Chunk.belongsTo(File, { foreignKey: 'fileId' });
Chunk.belongsTo(Repository, { foreignKey: 'repoId' });

// Folder associations
Folder.hasMany(File, { foreignKey: 'folderId', onDelete: 'CASCADE' });
Folder.hasMany(Folder, { as: 'subfolders', foreignKey: 'parentId', onDelete: 'CASCADE' });
Folder.belongsTo(User, { foreignKey: 'userId' });
Folder.belongsTo(Folder, { as: 'parent', foreignKey: 'parentId', onDelete: 'CASCADE' });

// GitHubAccount associations
GitHubAccount.belongsTo(User, { foreignKey: 'userId', onDelete: 'SET NULL' });


// OAuthAccount associations
OAuthAccount.belongsTo(User, { foreignKey: 'userId' });

// Plan associations
Plan.hasMany(Subscription, { foreignKey: 'planId' , onDelete: 'CASCADE'});

// Subscription associations
Subscription.belongsTo(User, { foreignKey: 'userId' });
Subscription.belongsTo(Plan, { foreignKey: 'planId' });

// Repository associations
Repository.belongsTo(GitHubAccount, { foreignKey: 'githubAccountId' });

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
}
