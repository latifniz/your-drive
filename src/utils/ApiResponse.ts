export class ApiResponse<T> {
    public statusCode: number;
    public data: T | null; // Data can be of any type or null
    public message: string;
    public success: boolean;
  
    constructor(statusCode: number, data: T | null, message: string = "Success") {
      this.statusCode = statusCode;
      this.data = data;
      this.message = message;
      this.success = statusCode < 400;
    }
}
  
  