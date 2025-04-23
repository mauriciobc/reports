import { parse } from 'papaparse';
import { logger } from '../../utils/logger';

export interface FeedbackData {
  timestamp: string;
  respondent: string;
  subject: string;
  category: string;
  score: number;
  comments?: string;
}

export async function loadFeedbackData(filePath: string): Promise<FeedbackData[]> {
  try {
    const response = await fetch(filePath);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      parse(csvText, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          const typedData = results.data as FeedbackData[];
          resolve(typedData);
        },
        error: (error) => reject(error)
      });
    });
  } catch (error) {
    logger.error('Error loading feedback data:', error);
    throw error;
  }
}

export function aggregateScores(data: FeedbackData[]) {
  return data.reduce((acc, curr) => {
    const key = `${curr.category}_${curr.subject}`;
    if (!acc[key]) {
      acc[key] = {
        category: curr.category,
        subject: curr.subject,
        scores: [],
        average: 0,
        count: 0
      };
    }
    acc[key].scores.push(curr.score);
    acc[key].count++;
    acc[key].average = acc[key].scores.reduce((a, b) => a + b, 0) / acc[key].count;
    return acc;
  }, {} as Record<string, {
    category: string;
    subject: string;
    scores: number[];
    average: number;
    count: number;
  }>);
} 