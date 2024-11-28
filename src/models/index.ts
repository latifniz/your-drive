// Import all models from their respective files with the model naming convention
import { User as UserModel } from './associations';
import { File as FileModel } from './associations';
import { Repository as RepositoryModel } from './associations';
import { Chunk as ChunkModel } from './associations';
import { GitHubAccount as GitHubAccountModel } from './associations';
import { Folder as FolderModel } from './associations';
import { Plan as PlanModel } from './associations';
import { Subscription as SubscriptionModel } from './associations';
import { OAuthAccount as OAuthAccountModel } from './associations';
import { Download as DownloadModel } from './associations';
import { UserStorage as UserStorageModel} from './associations';

// UserModel.initialize();
// FileModel.initialize();
// RepositoryModel.initialize();
// ChunkModel.initialize();
// FolderModel.initialize();
// OAuthAccountModel.initialize();
// GitHubAccountModel.initialize();
// PlanModel.initialize();
// SubscriptionModel.initialize();
// DownloadModel.initialize();

// Exporting the models
export {
    UserModel,
    FileModel,
    RepositoryModel,
    ChunkModel,
    GitHubAccountModel,
    FolderModel,
    PlanModel,
    SubscriptionModel,
    OAuthAccountModel,
    DownloadModel,
    UserStorageModel
};

