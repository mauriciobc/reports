import Papa from 'papaparse';
import { logger } from './logger';

export interface RadarData {
  subject: string;
  [key: string]: string | number; // For dynamic team member names
}

export interface BarData {
  name: string;
  value: number;
}

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

const evaluationScores: { [key: string]: number } = {
  // Pode melhorar variations
  '❗ Pode melhorar: Precisa de ajustes.': 1,
  'Pode melhorar: Precisa de ajustes.': 1,
  'Pode melhorar': 1,
  'Precisa de ajustes': 1,
  'Precisa melhorar': 1,
  
  // Atende expectativas variations
  '🆗 Como esperado. Atende às expectativas.': 2,
  'Como esperado. Atende às expectativas.': 2,
  'Atende às expectativas': 2,
  'Como esperado': 2,
  'Atende expectativas': 2,
  
  // Supera expectativas variations
  '🎉 Parabéns! Supera as expectativas.': 3,
  'Parabéns! Supera as expectativas.': 3,
  'Supera as expectativas': 3,
  'Supera expectativas': 3,
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
  
  const cleanValue = value.trim();
  
  // Remove emojis and extra spaces
  const withoutEmojis = cleanValue
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  const lowerValue = withoutEmojis.toLowerCase();
  
  // Try to match with known patterns
  if (lowerValue.includes('pode melhorar') || lowerValue.includes('precisa')) {
    return 'Pode melhorar';
  }
  if (lowerValue.includes('atende') || lowerValue.includes('como esperado')) {
    return 'Atende às expectativas';
  }
  if (lowerValue.includes('supera') || lowerValue.includes('parabéns')) {
    return 'Supera as expectativas';
  }
  if (lowerValue.includes('não se aplica') || lowerValue === 'n/a' || lowerValue === 'na') {
    return 'Não se aplica';
  }
  
  return withoutEmojis;
};

<<<<<<< HEAD
const processRadarData = (data: any[]): RadarData[] => {
=======
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

// Helper function to normalize collaborator names
const normalizeCollaboratorName = (name: string): string => {
  return name
    .split('_')[0]  // Remove _1, _2, etc. suffixes
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // Remove accents
    .trim();  // Remove extra spaces
};

export function processRadarData(data: any[]): RadarData {
>>>>>>> 73b78a8 (Refactor logging across components: replace console logs with a centralized logger for improved error handling and debugging, enhance data processing feedback, and ensure consistent logging practices throughout the application.)
  const competencies = [
    { name: 'Cooperação', pattern: ['cooperação', 'coopera', 'ajuda mútua'] },
    { name: 'Comunicação', pattern: ['comunicação', 'comunica'] },
    { name: 'Comprometimento', pattern: ['compromisso', 'comprometimento'] },
    { name: 'Domínio Técnico', pattern: ['domínio técnico', 'conhecimento técnico'] },
    { name: 'Resolução Problemas', pattern: ['problemas', 'resolução', 'solução'] }
  ];

<<<<<<< HEAD
  logger.log('Starting radar data processing', {
    dataRows: data.length,
    competencies: competencies.map(c => ({ name: c.name, patterns: c.pattern }))
  });
=======
  // First, group evaluations by collaborator
  const collaboratorEvaluations: { [key: string]: { [key: string]: { total: number; count: number } } } = {};
  const allCollaborators = new Set<string>();
  const nameMapping: { [key: string]: string } = {};  // Map normalized names to original names
>>>>>>> 73b78a8 (Refactor logging across components: replace console logs with a centralized logger for improved error handling and debugging, enhance data processing feedback, and ensure consistent logging practices throughout the application.)

  // Helper function to clean member name
  const cleanMemberName = (name: string): string => {
    return name.replace(/_1$/, '').trim();
  };

  // Helper function to check if a question matches a competency
  const matchesCompetency = (questionText: string, patterns: string[]): boolean => {
    const normalizedQuestion = questionText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return patterns.some(pattern => {
      const normalizedPattern = pattern.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return normalizedQuestion.includes(normalizedPattern);
    });
  };

<<<<<<< HEAD
  // Helper function to extract member name from a column header
  const extractMemberName = (header: string): string | null => {
    if (!header.includes('>>')) return null;
    
    const parts = header.split('>>').map(part => part.trim());
    if (parts.length < 2) return null;

    const memberName = cleanMemberName(parts[1]);
    if (!memberName || 
        ['Data', 'Submission Date'].includes(memberName) || 
        memberName.length === 0) {
      return null;
    }

    return memberName;
  };
=======
      // Extract collaborator name from the field (format: "Question >> Name >> Evaluation")
      const parts = field.split('>>').map(part => part.trim());
      if (parts.length < 2) return;
      
      const originalName = parts[1];
      const normalizedName = normalizeCollaboratorName(originalName);
      
      // Store the original name for this normalized version
      if (!nameMapping[normalizedName]) {
        nameMapping[normalizedName] = originalName;
      }
      
      allCollaborators.add(normalizedName);
      
      // Use getFieldCategory to determine the competency
      const matchingCompetency = getFieldCategory(field);

      if (matchingCompetency && competencies.includes(matchingCompetency)) {
        // Initialize collaborator data if not exists
        if (!collaboratorEvaluations[normalizedName]) {
          collaboratorEvaluations[normalizedName] = {};
          competencies.forEach(comp => {
            collaboratorEvaluations[normalizedName][comp] = { total: 0, count: 0 };
          });
        }

        // Get the normalized evaluation value
        const normalizedValue = normalizeEvaluationValue(value);
        
        logger.log('Processing competency field', {
          field,
          value,
          originalName,
          normalizedName,
          matchingCompetency,
          normalizedValue
        });
>>>>>>> 73b78a8 (Refactor logging across components: replace console logs with a centralized logger for improved error handling and debugging, enhance data processing feedback, and ensure consistent logging practices throughout the application.)

  // Helper function to extract answer from column
  const extractAnswer = (key: string, value: any): string | null => {
    const parts = key.split('>>').map(part => part.trim());
    
    // First check if we have a value in the cell
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    
    // If we have a third part in the header (Question >> User >> Answer)
    // AND the value is true/1/'1'/etc, then use the answer from the header
    if (parts.length >= 3 && parts[2].trim()) {
      const lastPart = parts[2].trim();
      if (value === true || value === 1 || value === '1' || 
          (typeof value === 'string' && value.toLowerCase() === 'true')) {
        return lastPart;
      }
    }

<<<<<<< HEAD
    return null;
  };

  // First, extract all unique member names from the column headers
  const teamMembers = new Set<string>();
  if (data.length > 0) {
    Object.keys(data[0]).forEach(header => {
      const memberName = extractMemberName(header);
      if (memberName) {
        teamMembers.add(memberName);
        logger.log('Found team member', { 
          memberName, 
          originalHeader: header 
=======
        // Update the totals and counts
        collaboratorEvaluations[normalizedName][matchingCompetency].total += score;
        collaboratorEvaluations[normalizedName][matchingCompetency].count++;

        logger.log('Updated collaborator score', {
          originalName,
          normalizedName,
          competency: matchingCompetency,
          score,
          newTotal: collaboratorEvaluations[normalizedName][matchingCompetency].total,
          newCount: collaboratorEvaluations[normalizedName][matchingCompetency].count
>>>>>>> 73b78a8 (Refactor logging across components: replace console logs with a centralized logger for improved error handling and debugging, enhance data processing feedback, and ensure consistent logging practices throughout the application.)
        });
      }
    });
  }

  const teamMembersArray = Array.from(teamMembers);
  logger.log('Extracted team members', {
    count: teamMembersArray.length,
    members: teamMembersArray
  });

<<<<<<< HEAD
  // Process data for each competency
  return competencies.map(competency => {
    const row: RadarData = { subject: competency.name };
    
    teamMembersArray.forEach(member => {
      let totalScore = 0;
      let count = 0;
      let matchedQuestions: string[] = [];
      let answers: { question: string, answer: string, score: number }[] = [];

      // Process each row of data
      data.forEach((dataRow, rowIndex) => {
        // Find all columns for this member and competency
        Object.entries(dataRow).forEach(([key, value]) => {
          if (!key.includes('>>')) return;
          
          const parts = key.split('>>').map(part => part.trim());
          if (parts.length < 2) return;

          const questionText = parts[0];
          const memberName = cleanMemberName(parts[1]);
          
          // Check if this column is relevant for our current member and competency
          if (matchesCompetency(questionText, competency.pattern) && 
              memberName === member) {
            
            logger.log('Found matching question', {
              competency: competency.name,
              patterns: competency.pattern,
              question: questionText,
              member: memberName,
              key,
              value
            });

            const answer = extractAnswer(key, value);
            if (answer) {
              const normalizedValue = normalizeEvaluationValue(answer);
              matchedQuestions.push(questionText);
              
              logger.log('Processing answer', {
                member,
                competency: competency.name,
                question: questionText,
                answer,
                normalizedValue,
                hasScore: normalizedValue in evaluationScores,
                originalValue: value,
                headerParts: parts
              });

              if (normalizedValue in evaluationScores) {
                const score = evaluationScores[normalizedValue];
                totalScore += score;
                count++;
                answers.push({ question: questionText, answer: normalizedValue, score });

                logger.log('Added score', {
                  member,
                  competency: competency.name,
                  question: questionText,
                  answer,
                  normalizedValue,
                  score,
                  totalScore,
                  count,
                  answers
                });
              }
            }
          }
        });
      });

      const averageScore = count > 0 ? totalScore / count : 0;
      logger.log('Final score calculated', {
        member,
        competency: competency.name,
        totalScore,
        count,
        averageScore,
        matchedQuestions,
        allAnswers: answers
      });
      
      row[member] = averageScore;
=======
  // Track members with no ratings
  const membersWithNoRatings = new Set<string>();
  const membersWithSomeRatings = new Set<string>();

  // Convert the grouped data into the final format
  const radarData = competencies.map(competency => {
    const dataPoint = {
      competency,
      collaborators: {} as { [key: string]: number }
    };

    // Calculate average for each collaborator
    Object.entries(collaboratorEvaluations).forEach(([normalizedName, evaluations]) => {
      const { total, count } = evaluations[competency];
      const score = count > 0 ? Number((total / count).toFixed(2)) : 0;
      // Only include collaborators with non-zero scores
      if (score > 0) {
        // Use the original name in the output
        dataPoint.collaborators[nameMapping[normalizedName]] = score;
        membersWithSomeRatings.add(normalizedName);
      }
>>>>>>> 73b78a8 (Refactor logging across components: replace console logs with a centralized logger for improved error handling and debugging, enhance data processing feedback, and ensure consistent logging practices throughout the application.)
    });

    return row;
  });
};

<<<<<<< HEAD
const processBarData = (data: any[]): BarData[] => {
=======
  // Find members with no ratings at all
  allCollaborators.forEach(normalizedName => {
    if (!membersWithSomeRatings.has(normalizedName)) {
      // Use the original name in the output
      membersWithNoRatings.add(nameMapping[normalizedName]);
    }
  });

  // Log information about members with no ratings
  logger.log('Members with no ratings', {
    count: membersWithNoRatings.size,
    members: Array.from(membersWithNoRatings)
  });

  logger.log('Final radar data', { 
    data: radarData,
    totalMembers: allCollaborators.size,
    membersIncluded: membersWithSomeRatings.size,
    membersExcluded: Array.from(membersWithNoRatings)
  });

  return { 
    data: radarData,
    membersWithNoRatings: Array.from(membersWithNoRatings)
  };
}

const processBarData = (data: any[]): StrengthEvaluation[] => {
>>>>>>> 73b78a8 (Refactor logging across components: replace console logs with a centralized logger for improved error handling and debugging, enhance data processing feedback, and ensure consistent logging practices throughout the application.)
  const strengthCategories = [
    { name: 'Domínio técnico', pattern: 'Excelente domínio técnico da área' },
    { name: 'Adaptabilidade', pattern: 'Facilidade de adaptação a mudanças e novas demandas' },
    { name: 'Comprometimento', pattern: 'Dedicação, comprometimento e foco em resultados' },
    { name: 'Resolução problemas', pattern: 'Criatividade e inovação na resolução de problemas' },
    { name: 'Comunicação', pattern: 'Excelente comunicação e habilidade de apresentação' }
  ];

  return strengthCategories.map(category => {
    let totalCount = 0;
    let matchingKeys: string[] = [];

    data.forEach(row => {
      Object.entries(row).forEach(([key, value]) => {
        // Check if the key contains the question pattern
        if (key.toLowerCase().includes('pontos fortes') && 
            key.toLowerCase().includes(category.pattern.toLowerCase())) {
          matchingKeys.push(key);
          
          // Log the key and value for debugging
          console.log(`Found matching key for ${category.name}:`, key);
          console.log('Value:', value);
          
          // Check various truthy values
          if (value === true || 
              value === 1 || 
              value === '1' || 
              value === 'true' || 
              value === 'yes' || 
              value === 'sim' ||
              value === category.pattern ||
              (typeof value === 'string' && value.toLowerCase().includes('sim'))) {
            totalCount++;
            console.log(`Incrementing count for ${category.name}`);
          }
        }
      });
    });

    console.log(`Category ${category.name}:`, {
      matchingKeys,
      totalCount
    });

    return {
      name: category.name,
      value: totalCount
    };
  });
};

const processPieData = (data: any[]): PieData[] => {
  const ratings = {
    'Supera expectativas': { count: 0, color: '#4CAF50' },  // Green
    'Atende expectativas': { count: 0, color: '#2196F3' },  // Blue
    'Precisa melhorar': { count: 0, color: '#FFC107' }      // Yellow
  };

  data.forEach((row) => {
    Object.entries(row).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const normalizedValue = normalizeEvaluationValue(value);

        // Map normalized values to rating categories, excluding 'Não se aplica'
        if (normalizedValue === 'Supera as expectativas') {
          ratings['Supera expectativas'].count++;
        } else if (normalizedValue === 'Atende às expectativas') {
          ratings['Atende expectativas'].count++;
        } else if (normalizedValue === 'Pode melhorar') {
          ratings['Precisa melhorar'].count++;
        }
      }
    });
  });

  // Convert to array format and calculate percentages
  const total = Object.values(ratings).reduce((sum, { count }) => sum + count, 0);
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