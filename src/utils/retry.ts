export async function retryOperation(
  delay: number,
  retryCount: number,
  operation: any
) {
  let attempts = 0;

  // Loop through retry logic
  while (attempts < retryCount) {
    try {
      // Try running the operation
      return await operation;
    } catch (error) {
      attempts++;
      console.error(
        `Attempt ${attempts} failed: ${
          error instanceof Error ? error.message : error
        }`
      );

      // If we've reached the retry limit, throw the error
      if (attempts >= retryCount) {
        throw new Error(`Operation failed after ${attempts} attempts`);
      }

      // Wait for the specified delay before retrying
      console.log(`Retrying in ${delay} ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
