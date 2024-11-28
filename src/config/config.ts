// import { configDotenv, DotenvConfigOptions } from "dotenv";
// // config() will read your .env file, parse the contents, assign it to process.env.
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  // port
  port: process.env['PORT'] ? Number(process.env['PORT']) : 3000, // default to 3000 if PORT is not set
  baseURL: process.env['BASEURL'] || '/api/v1',
  app_host: process.env['APP_HOST'] || 'localhost',
  // github
  github: {
    email: process.env['GITHUB_EMAIL'],
    accessToken: process.env['GITHUB_TOKEN'],
    username: process.env['GITHUB_USERNAME']
  },
  sequelize: {
      dialect: process.env['DIALECT']!,
      host: process.env['DB_HOST']!,
      port: process.env['DB_PORT']!,
      username: process.env['DB_USERNAME']!,
      password: process.env['DB_PASSWORD']!,
      database: process.env['DB_NAME']!,
  },
  jwt_secret: process.env['JWT_SECRET']! || 'my_secret',
  fileSizes: {
    free_plan_size: process.env['FREE_PLAN_MAX_FILE_SIZE']!,
    premmium_plan_size: process.env['PREMIUM_PLAN_MAX_FILE_SIZE']!
  }
};