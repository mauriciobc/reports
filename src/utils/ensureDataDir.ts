import { logger } from './logger';

export async function ensureDataDirectory() {
  try {
    // Check if /data directory exists at the root level
    const response = await fetch('/data/');
    if (!response.ok) {
      logger.warn('Data directory not found, creating it...');
      // In a production environment, you would want to handle this server-side
      logger.error('Data directory is required but not found. Please create a /public/data directory and place your CSV files there.');
      return false;
    }
    return true;
  } catch (error) {
    logger.error('Error checking data directory:', error);
    return false;
  }
} 