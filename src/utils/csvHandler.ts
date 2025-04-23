import Papa from 'papaparse';
import { logger } from './logger';
import { ChartData, RadarData, PieData, BarData, RadarDataPoint } from '../types';

export interface PieData {
  name: string;
  value: number;
  color: string;
}

export interface ChartDataResponse {
  radar: RadarData[];
  bar: BarData[];
  pie: PieData[];
}

interface StrengthEvaluation {
  name: string;
  needsImprovement: number;
  asExpected: number;
  exceeds: number;
}

const evaluationScores: { [key: string]: number } = {
  // Precisa melhorar variations
  'Precisa melhorar': 1,
  'Pode melhorar': 1,
  'Precisa de ajustes': 1,
  'Abaixo do esperado': 1,
  'Necessita melhorar': 1,
  
  // Atende às expectativas variations
  'Atende às expectativas': 2,
  'Como esperado': 2,
  'Conforme esperado': 2,
  'Atende expectativas': 2,
  'Dentro do esperado': 2,
  'Adequado': 2,
  
  // Supera as expectativas variations
  'Supera as expectativas': 3,
  'Supera expectativas': 3,
  'Excelente': 3,
  'Excepcional': 3,
  'Acima do esperado': 3,
  'Parabéns': 3,
  
  // Not applicable variations
  'Não se aplica': 0,
  'N/A': 0,
  'NA': 0
};

const frequencyScores: { [key: string]: number } = {
  'Nunca': 0,
  'Raramente': 1,
  'Às vezes': 2,
  'Frequentemente': 4,
  'Sempre': 5,
  'Não se aplica': 0
};

// Helper function to normalize evaluation values
const normalizeEvaluationValue = (value: string): string => {
  if (!value) return '';
  
  const cleanValue = value.trim().toLowerCase();

  // Handle N/A cases first
  if (cleanValue === 'n/a' || cleanValue === 'na' || cleanValue === 'não se aplica') {
    return '';
  }

  // Special handling for problem-solving related fields
  if (cleanValue.includes('resolveu problemas complexos') || 
      cleanValue.includes('criatividade e inovação na resolução') ||
      cleanValue.includes('apoia os colegas na resolução') ||
      cleanValue.includes('ajuda a resolver problemas') ||
      cleanValue.includes('capacidade de resolução') ||
      cleanValue.includes('inovação na resolução')) {
    logger.log('Problem-solving field detected', { value: cleanValue });
    return 'Supera as expectativas';
  }

  // Special handling for commitment-related fields
  if (cleanValue.includes('dedicou tempo adicional') || 
      cleanValue.includes('superou desafios') || 
      cleanValue.includes('assumiu responsabilidades') ||
      cleanValue.includes('dedicação, comprometimento') ||
      cleanValue.includes('comprometimento e foco')) {
    logger.log('Commitment field detected', { value: cleanValue });
    return 'Supera as expectativas';
  }
  
  // Enhanced mapping of responses with more specific patterns
  const responseMap = {
    'precisa melhorar': [
      'precisa melhorar',
      'precisa de ajustes',
      'pode melhorar',
      '❗ pode melhorar',
      'necessita melhorar',
      'abaixo do esperado',
      'não atende',
      'insatisfatório'
    ],
    'atende às expectativas': [
      'como esperado',
      'conforme esperado',
      'atende expectativas',
      'atende às expectativas',
      '🆗 como esperado',
      'dentro do esperado',
      'adequado',
      'satisfatório',
      'bom'
    ],
    'supera as expectativas': [
      'supera expectativas',
      'supera as expectativas',
      'excelente',
      'excepcional',
      'acima do esperado',
      'parabéns',
      '🎉 parabéns',
      'muito bom',
      'ótimo',
      'excelente domínio',
      'excelente comunicação'
    ]
  };

  // First try exact matches
  for (const [normalized, variants] of Object.entries(responseMap)) {
    if (variants.some(variant => cleanValue === variant || cleanValue.includes(variant))) {
      const result = normalized === 'precisa melhorar' ? 'Precisa melhorar' :
                    normalized === 'atende às expectativas' ? 'Atende às expectativas' :
                    'Supera as expectativas';
      logger.log('Normalized value found', { original: value, normalized: result });
      return result;
    }
  }

  // If no match found, log and return empty
  logger.log('Unmatched evaluation value', {
    originalValue: value,
    cleanValue
  });

  return '';
};

// Helper function to determine field category
const getFieldCategory = (field: string): string | null => {
  const cleanField = field.toLowerCase().trim();
  
  if (cleanField.includes('resolução de problemas') || 
      cleanField.includes('resolver problemas') ||
      cleanField.includes('resolução problemas') ||
      cleanField.includes('resolveu problemas') ||
      cleanField.includes('capacidade de analisar problemas')) {
    return 'Resolução Problemas';
  }
  
  if (cleanField.includes('comunicação') ||
      cleanField.includes('comunicar') ||
      cleanField.includes('apresentação')) {
    return 'Comunicação';
  }
  
  if (cleanField.includes('cooperação') ||
      cleanField.includes('cooperar') ||
      cleanField.includes('ajuda mútua')) {
    return 'Cooperação';
  }
  
  if (cleanField.includes('comprometimento') ||
      cleanField.includes('dedicação') ||
      cleanField.includes('foco em resultados')) {
    return 'Comprometimento';
  }
  
  if (cleanField.includes('domínio técnico') ||
      cleanField.includes('conhecimento técnico') ||
      cleanField.includes('expertise técnica')) {
    return 'Domínio Técnico';
  }
  
  return null;
};

export function processRadarData(data: any[]): RadarData {
  const competencies = [
    'Cooperação',
    'Comunicação',
    'Comprometimento',
    'Domínio Técnico',
    'Resolução Problemas'
  ];

  // First, group evaluations by collaborator
  const collaboratorEvaluations: { [key: string]: { [key: string]: { total: number; count: number } } } = {};

  // Process each row of data
  data.forEach(row => {
    // Log the row being processed
    logger.log('Processing row for radar data', { row });

    // Process each field in the row
    Object.entries(row).forEach(([field, value]) => {
      if (typeof value !== 'string') return;

      // Extract collaborator name from the field (format: "Question >> Name >> Evaluation")
      const parts = field.split('>>').map(part => part.trim());
      if (parts.length < 2) return;
      
      const collaboratorName = parts[1];
      
      // Use getFieldCategory to determine the competency
      const matchingCompetency = getFieldCategory(field);

      if (matchingCompetency && competencies.includes(matchingCompetency)) {
        // Initialize collaborator data if not exists
        if (!collaboratorEvaluations[collaboratorName]) {
          collaboratorEvaluations[collaboratorName] = {};
          competencies.forEach(comp => {
            collaboratorEvaluations[collaboratorName][comp] = { total: 0, count: 0 };
          });
        }

        // Get the normalized evaluation value
        const normalizedValue = normalizeEvaluationValue(value);
        
        logger.log('Processing competency field', {
          field,
          value,
          collaborator: collaboratorName,
          matchingCompetency,
          normalizedValue
        });

        // Map normalized values to scores
        let score = 0;
        switch (normalizedValue) {
          case 'Precisa melhorar':
            score = 1;
            break;
          case 'Atende às expectativas':
            score = 2;
            break;
          case 'Supera as expectativas':
            score = 3;
            break;
          default:
            return;
        }

        // Update the totals and counts
        collaboratorEvaluations[collaboratorName][matchingCompetency].total += score;
        collaboratorEvaluations[collaboratorName][matchingCompetency].count++;

        logger.log('Updated collaborator score', {
          collaborator: collaboratorName,
          competency: matchingCompetency,
          score,
          newTotal: collaboratorEvaluations[collaboratorName][matchingCompetency].total,
          newCount: collaboratorEvaluations[collaboratorName][matchingCompetency].count
        });
      }
    });
  });

  // Convert the grouped data into the final format
  const radarData = competencies.map(competency => {
    const dataPoint = {
      competency,
      collaborators: {} as { [key: string]: number }
    };

    // Calculate average for each collaborator
    Object.entries(collaboratorEvaluations).forEach(([collaborator, evaluations]) => {
      const { total, count } = evaluations[competency];
      dataPoint.collaborators[collaborator] = count > 0 ? Number((total / count).toFixed(2)) : 0;
    });

    logger.log('Calculated competency data point', {
      competency,
      collaboratorScores: dataPoint.collaborators
    });

    return dataPoint;
  });

  logger.log('Final radar data', { data: radarData });

  return { data: radarData };
}

const processBarData = (data: any[]): StrengthEvaluation[] => {
  const strengthCategories = [
    { name: 'Domínio técnico', pattern: 'domínio técnico' },
    { name: 'Adaptabilidade', pattern: 'adaptação' },
    { name: 'Comprometimento', pattern: 'comprometimento' },
    { name: 'Resolução problemas', pattern: 'resolução de problemas' },
    { name: 'Comunicação', pattern: 'comunicação' }
  ];

  // Initialize results structure
  const results = strengthCategories.map(category => ({
    name: category.name,
    needsImprovement: 0,
    asExpected: 0,
    exceeds: 0
  }));

  logger.log('Starting bar data processing', {
    totalRows: data.length,
    categories: strengthCategories
  });

  // Process each row of data
  data.forEach((row, rowIndex) => {
    logger.log(`Processing row ${rowIndex}`, {
      keys: Object.keys(row)
    });

    strengthCategories.forEach((category, index) => {
      // Look for evaluation fields for this category
      Object.entries(row).forEach(([key, value]) => {
        const keyLower = key.toLowerCase();
        const patternLower = category.pattern.toLowerCase();
        
        // Log all fields for analysis
        logger.log('Analyzing field', {
          key,
          value,
          category: category.name,
          includesPattern: keyLower.includes(patternLower)
        });

        if (typeof key === 'string' && keyLower.includes(patternLower)) {
          // Skip empty or N/A responses
          if (!value || value === 'N/A' || value === '') {
            logger.log('Skipping empty/NA value', { key, value });
            return;
          }

          // Normalize the evaluation value
          const evaluation = normalizeEvaluationValue(value);
          
          // Log the evaluation process
          logger.log('Processing evaluation', {
            key,
            originalValue: value,
            normalizedValue: evaluation,
            category: category.name
          });

          // Only process if we got a valid normalized value
          if (evaluation) {
            // Update the appropriate counter
            switch (evaluation) {
              case 'Precisa melhorar':
                results[index].needsImprovement++;
                logger.log('Incremented needs improvement', {
                  category: category.name,
                  total: results[index].needsImprovement
                });
                break;
              case 'Atende às expectativas':
                results[index].asExpected++;
                logger.log('Incremented as expected', {
                  category: category.name,
                  total: results[index].asExpected
                });
                break;
              case 'Supera as expectativas':
                results[index].exceeds++;
                logger.log('Incremented exceeds', {
                  category: category.name,
                  total: results[index].exceeds
                });
                break;
            }
          } else {
            logger.log('Skipping unrecognized evaluation', {
              originalValue: value,
              key,
              category: category.name
            });
          }
        }
      });
    });
  });

  logger.log('Bar data processing complete', {
    results
  });

  return results;
};

const processPieData = (data: any[]): PieData[] => {
  const ratings = {
    'Supera expectativas': { count: 0, color: '#4CAF50' },  // Green
    'Atende expectativas': { count: 0, color: '#2196F3' },  // Blue
    'Precisa melhorar': { count: 0, color: '#FFC107' }      // Yellow
  };

  logger.log('Starting pie data processing', { totalRows: data.length });

  data.forEach((row, rowIndex) => {
    Object.entries(row).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const normalizedValue = normalizeEvaluationValue(value);
        
        logger.log('Processing pie data value', {
          rowIndex,
          key,
          originalValue: value,
          normalizedValue
        });

        // Map normalized values to rating categories
        switch (normalizedValue) {
          case 'Supera as expectativas':
            ratings['Supera expectativas'].count++;
            logger.log('Incremented Supera expectativas count', {
              newCount: ratings['Supera expectativas'].count
            });
            break;
          case 'Atende às expectativas':
            ratings['Atende expectativas'].count++;
            logger.log('Incremented Atende expectativas count', {
              newCount: ratings['Atende expectativas'].count
            });
            break;
          case 'Precisa melhorar':
            ratings['Precisa melhorar'].count++;
            logger.log('Incremented Precisa melhorar count', {
              newCount: ratings['Precisa melhorar'].count
            });
            break;
          default:
            // Skip empty or unrecognized values
            logger.log('Skipping unrecognized value', { normalizedValue });
            break;
        }
      }
    });
  });

  // Convert to array format and calculate percentages
  const total = Object.values(ratings).reduce((sum, { count }) => sum + count, 0);
  
  logger.log('Pie data processing complete', {
    ratings,
    total
  });

  return Object.entries(ratings).map(([name, data]) => ({
    name,
    value: total > 0 ? (data.count / total) * 100 : 0,
    color: data.color
  }));
};

export const parseCsvFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (header) => {
        logger.log('CSV Header Found:', { header });
        return header.trim();
      },
      transform: (value, field) => {
        logger.log('Processing CSV Field:', { field, value });
        
        if (typeof value === 'string') {
          const lowerValue = value.toLowerCase().trim();
          if (lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1') return true;
          if (lowerValue === 'false' || lowerValue === 'no' || lowerValue === '0') return false;
        }
        return value;
      },
      complete: (results) => {
        logger.log('CSV Parse Complete', {
          fileName: file.name,
          totalRows: results.data.length,
          sampleRow: results.data[0],
          allFields: results.data[0] ? Object.keys(results.data[0]) : []
        });
        resolve(results.data);
      },
      error: (error) => {
        logger.error('CSV Parse Error', error);
        reject(error);
      }
    });
  });
};

export const processChartData = async (files: File[]): Promise<ChartDataResponse> => {
  try {
    const allData: any[] = [];
    
    for (const file of files) {
      logger.log('Processing file:', { fileName: file.name });
      const parsedData = await parseCsvFile(file);
      allData.push(...parsedData);
    }

    const result = {
      radar: processRadarData(allData),
      bar: processBarData(allData),
      pie: processPieData(allData)
    };

    return result;
  } catch (error) {
    logger.error('Error processing CSV files:', error);
    throw error;
  }
};