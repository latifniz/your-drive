import * as fs from 'fs/promises';
import * as path from 'path';

export async function deleteGitFolders(folderPath: string): Promise<void> {
    const userFolders = await fs.readdir(folderPath, { withFileTypes: true });

    for (const userFolder of userFolders) {
        if (userFolder.isDirectory()) {
            const gitFolderPath = path.join(folderPath, userFolder.name, '.git');

            try {
                // Check if .git folder exists inside each user folder
                await fs.access(gitFolderPath);
                // Delete the .git folder
                await fs.rm(gitFolderPath, { recursive: true, force: true });
                console.log(`Deleted .git folder in ${gitFolderPath}`);
            } catch (err) {
                // Ignore if .git folder doesn't exist
            }
        }
    }
}

