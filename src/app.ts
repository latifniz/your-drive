import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './docs/api-docs';
import { config } from './config/config'
import { fileRouter,folderRouter } from './routes/index'
import multer from 'multer';
import { getData } from './routes/test';
import { NextFunction } from 'express-serve-static-core';
import { customMulterStorage } from './middlewares/multer.middleware';
const app = express();
import cors from 'cors';


//Middleware to parse JSON Requests
app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// no timeout for requests..
app.use((req, res, next) => {
  req.setTimeout(0); // No timeout for the request
  res.setTimeout(0); // No timeout for the response
  next();
});


// Serve Swagger UI
app.use(`${config.baseURL}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/',(_req,res) => {
     res.send("hello world");
})

// create multer enigine

// Middleware to handle file uploads
const upload = async (req: Request, res: Response, next: NextFunction) => {
     try {
      res.setTimeout(1000*60*60, () => {
        console.log("response timeout");
      });
      req.setTimeout(1000*60*60, () => {
        console.log("response timeout");
      });
      
       // Call getData to retrieve the user and GitHub account details
       const { user, github_account, folderId } = await getData();
       // create folder with username 
       const rootUploadPath = process.env['DESTINATION_DIR']!;
       const uploadPath = `${rootUploadPath}/${user?.username}`;
    
       // Create an UploadRequest object
       const uploadRequest = {
         githubAccount: github_account!,
         folderPath: uploadPath, // Specify the desired folder path
         user: user!,
         folderId: BigInt(folderId),
         chunkSize: 10 * 1024 * 1024, // Set the desired chunk size (10MB in this case)
       };
   
       // Initialize custom storage with the uploadRequest
       const storage = customMulterStorage(uploadRequest);
   
       // Initialize multer with the custom storage
       const multerUpload = multer({ storage });

   
       // Call multer's upload function for the file upload process
       multerUpload.single('file')(req, res, (err: any) => {
         if (err) {
           return next(err); // Pass any errors to the next middleware
         }
          next(); // Proceed to the next middleware or route handler
        
       });
       
     } catch (error) {
       console.error('Error in upload middleware:', error);
       next(error); // Pass any errors to the next middleware
     }
};
   
// Define a route that uses the upload middleware
app.post('/upload', upload, (_req, res) => {
  res.status(200).json({ message: 'File uploaded successfully!' });
});



app.use(`${config.baseURL}`,fileRouter);
app.use(`${config.baseURL}/folders`,folderRouter);

export default app;
