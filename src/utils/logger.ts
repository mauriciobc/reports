class Logger {
  private logs: string[] = [];
  private static instance: Logger;
  private isDevelopment: boolean;

  private constructor() {
    // Check if we're in development environment
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLogEntry(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    return `${timestamp} - ${level}: ${message}${data ? '\nData: ' + JSON.stringify(data, null, 2) : ''}`;
  }

  log(message: string, data?: any) {
    const logEntry = this.formatLogEntry('INFO', message, data);
    this.logs.push(logEntry);
    if (this.isDevelopment) {
      console.log(logEntry);
    }
  }

  info(message: string, data?: any) {
    const logEntry = this.formatLogEntry('INFO', message, data);
    this.logs.push(logEntry);
    if (this.isDevelopment) {
      console.log(logEntry);
    }
  }

  error(message: string, error?: any) {
    const logEntry = this.formatLogEntry('ERROR', message, error);
    this.logs.push(logEntry);
    if (this.isDevelopment) {
      console.error(logEntry);
    }
  }

  warn(message: string, data?: any) {
    const logEntry = this.formatLogEntry('WARNING', message, data);
    this.logs.push(logEntry);
    if (this.isDevelopment) {
      console.warn(logEntry);
    }
  }

  downloadLogs() {
    const logText = this.logs.join('\n\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  clear() {
    this.logs = [];
  }
}

export const logger = Logger.getInstance(); 