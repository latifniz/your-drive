/*
 This script is for copying the github account data from source db to target db
*/

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { config } from '../config/config';

// Resolve the path to the 'ca.pem' file
const caPath = path.resolve(__dirname, '../../certs/ca.pem');

// Make sure your credentials are correct before running the script
// Source database connection
const sourceDb = new Pool({
  user: config.sequelize.username as string,
  host: config.sequelize.host as string,
  database: 'accounts',
  password: config.sequelize.password as string,
  port: config.sequelize.port as unknown as number,
  ssl: {
    ca: fs.readFileSync(caPath).toString()
  }
});

// Target database connection
const targetDb = new Pool({
  user: config.sequelize.username as string,
  host: config.sequelize.host as string,
  database: 'your_drive',
  password: config.sequelize.password as string,
  port: config.sequelize.port as unknown as number,
  ssl: {
    ca: fs.readFileSync(caPath).toString()
  }
});

async function copyGithubAccounts() {
  try {
    console.log('Fetching records from source database...');
    const sourceAccounts = await sourceDb.query(
      `SELECT isassigned, githubusername, githubuseremail, githubuserpassword, accesstoken, createdat, updatedat FROM "upload".github_accounts`
    );

    console.log(`Found ${sourceAccounts.rowCount} records in source database.`);

    for (const account of sourceAccounts.rows) {
      const { isassigned, githubusername, githubuseremail, githubuserpassword, accesstoken, createdat, updatedat } = account;
      console.log(account);

      // Check if the account exists in the target database
      const existingAccount = await targetDb.query(
        `SELECT 1 FROM "upload".github_accounts WHERE "githubUserEmail" = $1`,
        [githubuseremail]
      );

      if (existingAccount.rowCount === 0) {
        console.log(`Inserting account: ${githubusername}`);

        // Insert into the target database without specifying githubAccountId (auto-incremented by the DB)
        const insertResult = await targetDb.query(
          `INSERT INTO "upload".github_accounts ("isAssigned", "githubUsername", "githubUserEmail", "githubUserPassword", "accessToken", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6 , $7) RETURNING "githubAccountId"`,
          [isassigned, githubusername, githubuseremail, githubuserpassword, accesstoken, createdat, updatedat]
        );

        // Extract the generated githubAccountId
        const githubAccountId = insertResult.rows[0].githubAccountId;

        console.log(`Inserted account with githubAccountId: ${githubAccountId}`);
      } else {
        console.log(`Account already exists: ${githubusername}`);
      }
    }

    console.log('Data transfer complete.');
  } catch (error) {
    console.error('Error during data transfer:', error);
  } finally {
    // Close connections
    await sourceDb.end();
    await targetDb.end();
    console.log('Connections closed.');
  }
}

// Run the script
copyGithubAccounts();
