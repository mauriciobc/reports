import Papa from 'papaparse';

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
  '🆗 Como esperado. Atende às expectativas.': 3,
  'Como esperado. Atende às expectativas.': 3,
  'Atende às expectativas': 3,
  'Como esperado': 3,
  'Atende expectativas': 3,
  
  // Supera expectativas variations
  '🎉 Parabéns! Supera as expectativas.': 5,
  'Parabéns! Supera as expectativas.': 5,
  'Supera as expectativas': 5,
  'Supera expectativas': 5,
  'Parabéns': 5,
  
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

const processRadarData = (data: any[]): RadarData[] => {
  const teamMembers = ['Viviane', 'Matheus', 'Lidineu', 'Rafael Victor', 'Paulo Henrique', 'Yasmin'];
  const competencies = [
    { name: 'Cooperação', pattern: 'cooperação' },
    { name: 'Comunicação', pattern: 'comunicação' },
    { name: 'Comprometimento', pattern: 'compromisso' },
    { name: 'Domínio Técnico', pattern: 'domínio técnico' },
    { name: 'Resolução Problemas', pattern: 'problemas' }
  ];

  // Log the raw data structure
  console.log('Raw CSV Data Structure:', data);
  console.log('First row example:', data[0]);
  console.log('Available columns:', data[0] ? Object.keys(data[0]) : []);

  return competencies.map(competency => {
    const row: RadarData = { subject: competency.name };
    
    teamMembers.forEach(member => {
      let totalScore = 0;
      let count = 0;
      let matchingKeys: string[] = [];

      // Process each row of data
      data.forEach((dataRow, rowIndex) => {
        // Find all columns for this member and competency
        Object.entries(dataRow).forEach(([key, value]) => {
          // Make the pattern matching case-insensitive and more flexible
          const keyLower = key.toLowerCase();
          const patternLower = competency.pattern.toLowerCase();
          const memberLower = member.toLowerCase();

          // Log each key-value pair for debugging
          console.log(`Row ${rowIndex} - Checking key-value:`, {
            key: keyLower,
            value,
            member: memberLower,
            pattern: patternLower,
            matches: {
              hasPattern: keyLower.includes(patternLower),
              hasMember: keyLower.includes(memberLower)
            }
          });

          if (keyLower.includes(patternLower) && keyLower.includes(memberLower)) {
            matchingKeys.push(key);
            
            if (typeof value === 'string') {
              // Normalize the value
              const normalizedValue = normalizeEvaluationValue(value);
              console.log(`Found match for ${member} - ${competency.name}:`, {
                key,
                original: value,
                normalized: normalizedValue,
                score: evaluationScores[normalizedValue]
              });

              if (normalizedValue in evaluationScores) {
                const score = evaluationScores[normalizedValue];
                totalScore += score;
                count++;
              }
            }
          }
        });
      });

      // Calculate average score for this member and competency
      const averageScore = count > 0 ? Math.round(totalScore / count) : 0;
      console.log(`Final score for ${member} - ${competency.name}:`, {
        totalScore,
        count,
        averageScore,
        matchingKeys
      });
      
      row[member] = averageScore;
    });

    return row;
  });
};

const processBarData = (data: any[]): BarData[] => {
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
        return header.trim();
      },
      transform: (value) => {
        if (typeof value === 'string') {
          const lowerValue = value.toLowerCase().trim();
          if (lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1') return true;
          if (lowerValue === 'false' || lowerValue === 'no' || lowerValue === '0') return false;
        }
        return value;
      },
      complete: (results) => resolve(results.data),
      error: (error) => reject(error)
    });
  });
};

export const processChartData = async (files: File[]): Promise<ChartDataResponse> => {
  try {
    const allData: any[] = [];
    
    for (const file of files) {
      const parsedData = await parseCsvFile(file);
      allData.push(...parsedData);
    }

    return {
      radar: processRadarData(allData),
      bar: processBarData(allData),
      pie: processPieData(allData)
    };
  } catch (error) {
    console.error('Error processing CSV files:', error);
    throw error;
  }
};