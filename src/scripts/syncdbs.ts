/* 
This script is created for syncing the database tables between remote 
and source db. its just temp fix , in future we will use migrations
*/

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { config } from '../config/config';

// Resolve the path to the 'ca.pem' file
const caPath = path.resolve(__dirname, '../../certs/ca.pem');

// Makr Sure your credentials are correct before running the script
// Source (cloud) database connection
const sourceDb = new Pool({
  user: config.sequelize.username,
  host: config.sequelize.host,
  database: config.sequelize.database,
  password: config.sequelize.password,
  port: config.sequelize.port as unknown as number,
  ssl: {
    ca: fs.readFileSync(caPath).toString(),
  },
});

// Target (local) database connection as local db credentials here
const targetDb = new Pool({
  user: 'gdrive',
  host: 'localhost',
  database: 'your_drive',
  password: 'gdrive123',
  port: 5432, // Adjust the port for your local DB
});


type Table = {
    name: string;
    uniqueKey: string;
};
const tables = [
  { name: '"upload".github_accounts', uniqueKey: 'githubAccountId' },
  { name: '"upload".users', uniqueKey: 'userId' },
  { name: '"upload".oauth_accounts', uniqueKey: 'authAccountId' },
  { name: '"upload".folders', uniqueKey: 'folderId' },
  { name: '"upload".subscriptions', uniqueKey: 'subscriptionId' },
  { name: '"upload".plans', uniqueKey: 'planId' },
  { name: '"upload".files', uniqueKey: 'fileId' },
  { name: '"upload".repositories', uniqueKey: 'repoId' },
  { name: '"upload".chunks', uniqueKey: 'chunkId' },
  { name: '"upload".downloads', uniqueKey: 'downloadId' },
  { name: '"upload".user_storage', uniqueKey: 'userStorageId'}
];

async function syncTable(table:Table, sourceDb:Pool, targetDb:Pool) {
  try {
    console.log(`Syncing table: ${table.name}`);
    // Fetch data from source and target
    const sourceData = await sourceDb.query(`SELECT * FROM ${table.name}`);
    const targetData = await targetDb.query(`SELECT * FROM ${table.name}`);

    const targetKeys = new Set(targetData.rows.map((row) => row[table.uniqueKey]));

    // Insert missing rows
    for (const row of sourceData.rows) {
      if (!targetKeys.has(row[table.uniqueKey])) {
        // Generate columns and values for insertion
        const columns = Object.keys(row).map((col) => `"${col}"`).join(', ');
        const values = Object.values(row);
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

        await targetDb.query(
          `INSERT INTO ${table.name} (${columns}) VALUES (${placeholders})`,
          values
        );
      }
    }

    console.log(`Table ${table.name} synced successfully.`);
  } catch (error) {
    console.error(`Error syncing table ${table.name}:`, error);
  }
}

async function syncDatabases() {
  try {
    for (const table of tables) {
      await syncTable(table, sourceDb, targetDb);
      await syncTable(table, targetDb, sourceDb); // Sync in the other direction
    }
    console.log('Database synchronization complete.');
  } catch (error) {
    console.error('Error during synchronization:', error);
  } finally {
    await sourceDb.end();
    await targetDb.end();
    console.log('Connections closed.');
  }
}

// Run the synchronization
syncDatabases();
