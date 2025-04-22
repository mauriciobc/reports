import Papa from 'papaparse';
import { promises as fs } from 'fs';
import path from 'path';

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface ChartDataResponse {
  radar: ChartData[];
  bar: ChartData[];
  pie: ChartData[];
}

export const readCsvFiles = async (directory: string): Promise<ChartDataResponse> => {
  try {
    const files = await fs.readdir(directory);
    const csvFiles = files.filter((file) => file.endsWith('.csv'));
    
    const data: ChartDataResponse = {
      radar: [],
      bar: [],
      pie: [],
    };

    for (const file of csvFiles) {
      const content = await fs.readFile(path.join(directory, file), 'utf-8');
      const result = await new Promise<ChartData[]>((resolve) => {
        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data as ChartData[]);
          },
        });
      });

      if (file.includes('radar')) data.radar = result;
      else if (file.includes('bar')) data.bar = result;
      else if (file.includes('pie')) data.pie = result;
    }

    return data;
  } catch (error) {
    console.error('Error reading CSV files:', error);
    throw error;
  }
};