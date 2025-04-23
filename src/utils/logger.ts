class Logger {
  private logs: string[] = [];
  private static instance: Logger;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${message}${data ? '\nData: ' + JSON.stringify(data, null, 2) : ''}`;
    this.logs.push(logEntry);
    console.log(logEntry);
  }

  error(message: string, error?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ERROR: ${message}${error ? '\nError: ' + JSON.stringify(error, null, 2) : ''}`;
    this.logs.push(logEntry);
    console.error(logEntry);
  }

  warn(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - WARNING: ${message}${data ? '\nData: ' + JSON.stringify(data, null, 2) : ''}`;
    this.logs.push(logEntry);
    console.warn(logEntry);
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