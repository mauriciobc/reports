class Logger {
  log(message: string, data?: any) {
    console.log(message, data);
  }

  error(message: string, error?: any) {
    const errorDetails = error ? `\nError: ${error.message}\nStack: ${error.stack}` : '';
    console.error(`ERROR: ${message}${errorDetails}`);
  }
}

export const logger = new Logger(); 