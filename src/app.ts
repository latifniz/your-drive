import express, { NextFunction, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './docs/api-docs';
import { config } from './config/config'
import { fileRouter,folderRouter,userRouter} from './routes/index'
const app = express();
import cors from 'cors';


//Middleware to parse JSON Requests
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.json());

// Serve Swagger UI
app.use(`${config.baseURL}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(`${config.baseURL}`,userRouter);
app.use(`${config.baseURL}`,fileRouter);
app.use(`${config.baseURL}`,folderRouter);


// Global error handling middleware (catch all errors)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
     console.error('Unhandled error:', err); // Log the error details (can be customized)
     
     // Send a 500 response for all errors but don't crash the app
     res.status(500).json({
       message: 'Internal Server Error',
       error: err.message, // Optionally include error message in response for debugging
     });
});

export default app;
