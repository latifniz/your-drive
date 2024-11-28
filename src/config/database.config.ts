
import { Sequelize } from 'sequelize';
import { config } from './config';
import fs from 'fs';
import path from 'path';


// Resolve the path to the 'ca.pem' file
const caPath = path.resolve(__dirname, '../../certs/ca.pem');

// Base Sequelize configuration object
const sequelizeConfig: any = {
    host: config.sequelize.host,
    dialect: 'postgres',
    port: config.sequelize.port as unknown as number,
    username: config.sequelize.username,
    password: config.sequelize.password,
    database: config.sequelize.database,
    logging: false,  // Optional: Disable logging if needed
    define: {
        timestamps: true, // automatically adds createdAt and updatedAt fields
        schema: "upload",
        freezeTableName: true
    },
  };
  
  // Conditionally add SSL options if the host is not localhost
  if (config.sequelize.host !== 'localhost') {
    sequelizeConfig.dialectOptions = {
      ssl: {
        require: true,  // Ensures SSL is used
        rejectUnauthorized: false,  // Set to true if you want to validate the server certificate
        ca: fs.readFileSync(caPath).toString(),  // Path to the CA certificate file
      },
    };
  } 

  const sequelize = new Sequelize(sequelizeConfig);
// Create a new Sequelize instance
// const sequelize =  new Sequelize(
//     config.sequelize.database,
//     config.sequelize.username,
//     config.sequelize.password,
//     {
//         host: config.sequelize.host,
//         dialect: 'postgres',
//         port: config.sequelize.port as unknown as number,
//         logging: false, // set to true for verbose logging
//         define: {
//             timestamps: true, // automatically adds createdAt and updatedAt fields
//             schema: "upload",
//             freezeTableName: true
//         },
      
//     }
// )



// Test the database connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        // await sequelize.createSchema('upload',{});
        console.log('Connection to PostgreSQL has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw new Error();
    }
};


export { sequelize,testConnection };
