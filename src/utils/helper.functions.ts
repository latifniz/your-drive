// contains some helper functions
import fs from 'fs';
export default async function directoryExists(dirPath:string): Promise<boolean>  {
    try {
      await fs.promises.access(dirPath); // Check if the directory can be accessed
      return true; // Directory exists
    } catch (error) {
      return false; // Directory does not exist
    }
}

