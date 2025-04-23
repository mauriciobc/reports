import fs from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';
import { logger } from './logger';

export async function readCSVFiles(filenames: string[]): Promise<File[]> {
  if (!filenames || filenames.length === 0) {
    throw new Error('No files selected');
  }

  const files: File[] = [];
  
  for (const filename of filenames) {
    try {
      // Validate filename
      if (!filename.endsWith('.csv')) {
        throw new Error(`Invalid file type for ${filename}. Only CSV files are allowed.`);
      }

      // Use Vite's dynamic import to get the file content
      const response = await fetch(`/data/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch file ${filename}: ${response.statusText}`);
      }
      
      const content = await response.text();
      
      // Validate CSV content
      if (!content.trim()) {
        throw new Error(`File ${filename} is empty`);
      }

      // Create file object
      const blob = new Blob([content], { type: 'text/csv' });
      const file = new File([blob], filename, { type: 'text/csv' });
      
      files.push(file);
    } catch (error) {
      // Log the full error for debugging
      logger.error(`Error reading file ${filename}:`, error);
      
      // Throw a more user-friendly error
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to read file ${filename}`);
      }
    }
  }
  
  return files;
} 