import {
    UserModel as User,
    FileModel as File,
    ChunkModel as Chunk,
    GitHubAccountModel as GitHubAccount,
    RepositoryModel as Repository,
    FolderModel as Folder,
    OAuthAccountModel as OAuthAccount,
    PlanModel as Plan,
    SubscriptionModel as Subscription,
    GitHubAccountModel
} from '../../models/index';
import { Chunk as ChunkInterface } from '../../interfaces/chunk.interface';
import { User as UserInterface } from '../../interfaces/user.interface';
import { Repository as RepositoryInterface } from '../../interfaces/repository.interface';
import { File as FileInterface } from '../../interfaces/file.interface';
import { GitHubAccount as GitHubAccountInterface } from '../../interfaces/githubaAccount.interface';
import { Folder as FolderInterface } from '../../interfaces/folder.interface';
import { OAuthAccount as OAuthAccountInterface } from '../../interfaces/oAuthAccount.interface';
import { Plan as PlanInterface } from '../../interfaces/plan.interface';
import { Subscription as SubscriptionInterface } from '../../interfaces/subscription.interface';

import { faker } from '@faker-js/faker';
import { ChunkUploadStatus, FileUploadStatus } from '../../enums/uploadStatus.enum';
import { AuthProvider } from '../../enums/authProvider.enum';
import { PlanType } from '../../enums/planType.enum';
import { BillingCycle } from '../../enums/billingCycle.enum';
import { SubscriptionStatus } from '../../enums/subscription.enum';

const clearDatabase = async () => {
    await User.destroy({ where: {} });
    await File.destroy({ where: {} });
    await Chunk.destroy({ where: {} });
    await GitHubAccount.destroy({ where: {} });
    await Repository.destroy({ where: {} });
    await Folder.destroy({ where: {} });
    await OAuthAccount.destroy({ where: {} });
    await Plan.destroy({ where: {} });
    await Subscription.destroy({ where: {} });
};

const seedUsers = async (github_accounts:GitHubAccountModel[]): Promise<UserInterface[]> => {
    const users: UserInterface[] = [];
    for (let i = 0; i < github_accounts.length; i++) {
        users.push({
            githubAccountId: github_accounts[i].githubAccountId,
            username: faker.internet.userName(),
            email: faker.internet.email(),
        });
    }

    return await User.bulkCreate(users);
};

const seedFolders = async (createdUsers: UserInterface[], count: number): Promise<FolderInterface[]> => {
    const folders: FolderInterface[] = [];
    let parentId = null;
    for (let i = 0; i < count; i++) {

        const userId = faker.helpers.arrayElement(createdUsers.map(user => user.userId)) ?? 0; // Provide a default value
        if(i == 0 ) { // root folder
           let folder = await Folder.create({
            userId:userId,
            folderName: faker.commerce.productName(),
            parentId: undefined
           });
           parentId = folder.folderId;
           continue;
        }
        folders.push({
            userId: userId,
            folderName: faker.commerce.productName(),
            parentId: parentId!,  // Top-level folder
        });
        
    }
    return await Folder.bulkCreate(folders);
};

const seedFiles = async (createdUsers: UserInterface[], createdFolders: FolderInterface[], count: number): Promise<FileInterface[]> => {
    const files: FileInterface[] = [];
    const userIds = createdUsers.map(user => user.userId);
    for (let i = 0; i < count; i++) {
        const userId = faker.helpers.arrayElement(userIds) ?? 0; // Provide a default value
        const folderId = faker.helpers.arrayElement(createdFolders.map(folder => folder.folderId)) ?? 0; // Provide a default value
        files.push({
            userId: userId,
            originalFilename: faker.system.fileName(),
            uniqueFilename: faker.string.uuid(),
            totalSize: faker.number.int({ min: 1024, max: 10485760 }), // Size between 1KB and 10MB
            totalChunks: faker.number.int({ min: 1, max: 10 }),
            status: faker.helpers.arrayElement(Object.values(FileUploadStatus)),
            mimeType: 'video',
            fileExtension: '.mp4',
            folderId: folderId,
        });
    }
    return await File.bulkCreate(files);
};

const seedChunks = async (createdFiles: FileInterface[]) => {
    const chunks: ChunkInterface[] = [];
    for (const file of createdFiles) {
        for (let j = 0; j < file.totalChunks; j++) {
            const fileId = file.fileId ?? 0; // Provide a default value
            chunks.push({
                fileId: fileId,
                repoId: faker.number.int({ min: 1, max: 10 }), // Adjust this based on actual repo IDs
                chunkNumber: j + 1,
                chunkFilename: faker.system.fileName(),
                chunkSize: faker.number.int({ min: 1024, max: 1048576 }), // Size between 1KB and 1MB
                uploadStatus: faker.helpers.arrayElement(Object.values(ChunkUploadStatus)),
            });
        }
    }
    await Chunk.bulkCreate(chunks);
};

const seedGitHubAccounts = async () => {
    const githubAccounts: GitHubAccountInterface[] = [];
    for (let i = 0; i < 10; i++) {
        githubAccounts.push({
            githubUsername: faker.internet.userName(),
            accessToken: faker.string.uuid(),
            githubUserEmail: faker.internet.email(),
            githubUserPassword: faker.internet.password(),
        });
    }
    return await GitHubAccount.bulkCreate(githubAccounts);
};

const seedRepositories = async (githubAccounts: GitHubAccountInterface[], count: number) => {
    const repositories: RepositoryInterface[] = [];
    for (let i = 0; i < count; i++) {
        const githubAccountId = faker.helpers.arrayElement(githubAccounts.map(github => github.githubAccountId)) ?? 0; // Provide a default value
        repositories.push({
            githubAccountId: githubAccountId,
            repositoryName: faker.company.name(),
            repositoryURL: faker.internet.url(),
            size: Math.random()*1024*1024
        });
    }
    await Repository.bulkCreate(repositories);
};

const seedOAuthAccounts = async (createdUsers: UserInterface[], count: number) => {
    const oauthAccounts: OAuthAccountInterface[] = [];
    for (let i = 0; i < count; i++) {
        const userId = faker.helpers.arrayElement(createdUsers.map(user => user.userId)) ?? 0; // Provide a default value
        oauthAccounts.push({
            userId: userId,
            provider: faker.helpers.arrayElement(Object.values(AuthProvider)),
            accessToken: faker.string.uuid(),
            refreshToken: faker.string.uuid(),
            externalId: faker.string.uuid(),
        });
    }
    await OAuthAccount.bulkCreate(oauthAccounts);
};

const seedPlans = async (count: number): Promise<PlanInterface[]> => {
    const plans: PlanInterface[] = [];
    for (let i = 0; i < count; i++) {
        plans.push({
            name: faker.helpers.arrayElement(Object.values(PlanType)),
            price: faker.number.float({ min: 1, max: 100 }),
            description: faker.lorem.sentence(),
            billingCycle: faker.helpers.arrayElement(Object.values(BillingCycle)),
            storageLimit: faker.number.int({ min: 50 * 1000, max: 100000 }),
        });
    }
    return await Plan.bulkCreate(plans);
};

const seedSubscriptions = async (userIds: number[], createdPlans: PlanInterface[], count: number) => {
    const subscriptions: SubscriptionInterface[] = [];
    for (let i = 0; i < count; i++) {
        const userId = faker.helpers.arrayElement(userIds) ?? 0; // Provide a default value
        const planId = faker.helpers.arrayElement(createdPlans.map(plan => plan.planId)) ?? 0; // Provide a default value
        subscriptions.push({
            userId: userId,
            planId: planId,
            startDate: faker.date.past(),
            endDate: faker.date.future(),
            status: faker.helpers.arrayElement(Object.values(SubscriptionStatus)),
        });
    }
    await Subscription.bulkCreate(subscriptions);
};

const seedDatabase = async () => {
    try {
        await clearDatabase();

        const createdGithubAccounts = await seedGitHubAccounts();
        const createdUsers = await seedUsers(createdGithubAccounts);
        await seedRepositories(createdGithubAccounts, 10);
               
        await seedOAuthAccounts(createdUsers, 10);
        const createdFolders = await seedFolders(createdUsers, 10);
        const createdFiles = await seedFiles(createdUsers, createdFolders, 10);
        await seedChunks(createdFiles);


        const createdPlans = await seedPlans(5);
        await seedSubscriptions(createdUsers.map(user => user.userId!), createdPlans, 10);

        console.log('Seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding data:', error);
    }
};

export default seedDatabase;
