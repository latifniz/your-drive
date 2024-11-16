import { sequelize } from "../../config/database.config";

// creates new database with and schema if it doesnt exits
export async function createDatabaseAndSchema(schemaName: string, databaseName: string) {
    try {
      // Create the schema if it doesn't exist
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
  
      // Create the database if it doesn't exist
      await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`);
  
      // Set the schema and database for the Sequelize instance
    //   sequelize.options.schema = schemaName;
    //   sequelize.options.database = databaseName;
    //   sequelize.createSchema()
  
      // Sync the Sequelize instance to create the tables
      await sequelize.sync();
    } catch (error) {
      console.error('Error creating database and schema:', error);
    }
}