import { EventEmitter } from 'events';
import * as fs from 'fs';
import path from 'path';

class FileStreamUploader extends EventEmitter {
  private destinationDirPath: string;
  private chunkSize: number;
  private currentChunkIndex: number;
  private bytesWritten: number;
  private chunkStream: fs.WriteStream | null;
  private fileStream: fs.ReadStream;
  private currentChunkPath: string | null;

  constructor(fileStream: fs.ReadStream, chunkSize: number, destinationDirPath: string) {
    super();
    this.fileStream = fileStream;
    this.destinationDirPath = destinationDirPath;
    this.chunkSize = chunkSize;
    this.currentChunkIndex = 0;
    this.currentChunkPath = null;
    this.bytesWritten = 0;
    this.chunkStream = null;

    // Bind event listeners
    this.fileStream.on('end', this.handleFileUploadComplete.bind(this));
    this.fileStream.on('error', this.handleFileUploadError.bind(this));
  }

  // Method to create a new chunk file stream
  private createNewChunkStream() {
    try {
      const chunkPath = path.join(this.destinationDirPath, `chunk_${this.currentChunkIndex}`);
      this.currentChunkPath = chunkPath;
      this.chunkStream = fs.createWriteStream(chunkPath);
      this.currentChunkIndex += 1;
      this.bytesWritten = 0;
      this.chunkStream.on('finish', () => {
        this.emit('chunkWritten', this.currentChunkIndex - 1, chunkPath);
        console.log(`Chunk ${this.currentChunkIndex - 1} written successfully.`);
      });
      return this.chunkStream;
    } catch (err) {
      console.error('Error creating new chunk stream:', err);
      throw new Error(`Failed to create new chunk stream`);
    }
  }

  // Method to write a chunk to the file
  public async writeChunk(chunk: Buffer): Promise<string | null> {
    try {
      // Create new chunk stream if it doesn't exist
      if (!this.chunkStream) {
        this.chunkStream = this.createNewChunkStream();
      }
  
      // Create a promise to handle writing logic
      await new Promise<void>((resolve, _reject) => {
        const write = () => {
          let canWriteMore = this.chunkStream!.write(chunk);
  
          // Check if we can write more data
          if (canWriteMore) {
            this.bytesWritten += chunk.length;
  
            // Check if the chunk size limit is reached
            if (this.bytesWritten >= this.chunkSize) {
              this.bytesWritten = 0;
              this.endCurrentStream();
              this.pauseFileStream();
              resolve(); // Resolve promise after ending the chunk
              return;
            } 
          } else {
            // Pause the file stream to allow more chunks to be written
            this.pauseFileStream();
  
            // Wait for the current chunk stream to drain
            this.chunkStream!.once('drain', () => {
              this.bytesWritten += chunk.length;
  
              // Check if the chunk size limit is reached after draining
              if (this.bytesWritten >= this.chunkSize) {
                this.bytesWritten = 0;
                this.endCurrentStream();
                this.pauseFileStream();
                resolve();
                return;
              }
  
              this.resumeFileStream(); // Resume the file stream
            });
          }
        };
  
        // Initial write attempt
        write();
      });
      return this.currentChunkPath; // Return the path after writing is done
    } catch (err) {
      console.error('Error writing chunk:', err);
      throw new Error(`Failed to write chunk`);
    }
  }
  
  // Method to end the current chunk stream
  private endCurrentStream() {
    try {
      if (this.chunkStream) {
        this.chunkStream.end();
        this.chunkStream = null;
      }
    } catch (err) {
      console.error('Error ending current stream:', err);
      throw new Error(`Failed to end current stream`);
    }
  }

  // Method to handle file upload completion
  private handleFileUploadComplete() {
    try {
      // close the current chunk stream
      this.endCurrentStream();
      this.emit('uploadCompleted');
    } catch (err) {
      console.error('Error handling end event:', err);
      throw new Error(`Failed to handle end event`);
    }
  }

  // Method to handle file upload error
  private handleFileUploadError(err: Error) {
    try {
      console.error('Error uploading file:', err);
      this.emit('uploadError', err);
    } catch (err) {
      console.error('Error handling error event:', err);
      throw new Error(`Failed to handle error event`);
    }
  }

  // Pause the file stream
  public pauseFileStream() {
    try {
      this.fileStream.pause();
    } catch (err) {
      console.error('Error pausing file stream:', err);
      throw new Error(`Failed to pause file stream`);
    }
  }

  // Resume the file stream
  public resumeFileStream() {
    try {
      this.fileStream.resume();
    } catch (err) {
      console.error('Error resuming file stream:', err);
      throw new Error(`Failed to resume file stream`);
    }
  }

  public endFileStream() {
     this.fileStream.destroy()
  }

  public isFileStreamPaused() {
    return this.fileStream.isPaused();
  }

  // Manually start processing file chunks
  public async handleStream() {
    try {
      
        this.fileStream.on('data', (chunk:Buffer) => {
          this.emit('chunkReceived', chunk);
        });
       
      
    } catch (err) {
      console.error('Error processing file stream:', err);
      throw new Error(`Failed to process file stream`);
    }
  }

  public getCurretChunkNumber() {
     return this.currentChunkIndex;
  }
  public getCurrentChunkPath() {
    return this.currentChunkPath;
  }
}

export = FileStreamUploader;
