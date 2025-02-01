import app from "./app";
import { testConnection, sequelize } from "./config/database.config";
import { config } from "./config/config";
const port = config.port || 3000;
const host = config.app_host;

const startServer = async () => {
  try {
    await testConnection();
    await sequelize.sync({ alter: true });

    const server = app.listen(port, () => {
      console.log(`Server running on http://${host}:${port}`);
      console.log(
        `Go to http://localhost:${port}/api/v1/docs for documentation`
      );
    });
    server.requestTimeout = 1000 * 60 * 60 * 24; // 1 hour
    server.keepAliveTimeout = 1000 * 60 * 60 * 24; // 60 minutes
    server.setTimeout(1000 * 60 * 60 * 24);

    // server.setTimeout(1000*60*60,() => {   // 1hour
    //   console.log('Server timed out');
    //   server.close();
    // })

    // Graceful shutdown function
    // async function gracefulShutdown() {
    //   console.log('\nGracefully shutting down...');
    //   try {
    //     // Execute deleteGitFolders function during shutdown
    //     await deleteGitFolders(uploadDir!);

    //     // Wait for all pending database operations to complete before closing the connection

    //     // Close the Express server
    //     server.close(() => {
    //       console.log('Express server closed.');
    //       process.exit(0);
    //     });
    //   } catch (err) {
    //     console.error('Error during shutdown:', err);
    //     process.exit(1);
    //   }
    // }

    // // Capture termination signals for a graceful shutdown
    // process.on('SIGINT', gracefulShutdown);
    // process.on('SIGTERM', gracefulShutdown);
    // process.on('uncaughtException', (err) => {
    //   console.error('Uncaught Exception:', err);
    //   gracefulShutdown();
    // });
  } catch (err) {
    console.log(err);
  }
};

startServer();
