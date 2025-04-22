import fs from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';

export async function readCSVFiles(filenames: string[]): Promise<File[]> {
  const files: File[] = [];
  
  for (const filename of filenames) {
    try {
      // Use Vite's dynamic import to get the file content
      const response = await fetch(`/data/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch file ${filename}`);
      }
      
      const content = await response.text();
      const blob = new Blob([content], { type: 'text/csv' });
      const file = new File([blob], filename, { type: 'text/csv' });
      
      files.push(file);
    } catch (error) {
      console.error(`Error reading file ${filename}:`, error);
      throw new Error(`Failed to read file ${filename}`);
    }
  }
  
  return files;
} 