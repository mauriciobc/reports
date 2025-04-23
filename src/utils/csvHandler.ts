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

export function processRadarData(data: any[]): RadarData[] {
  const competencies = [
    { name: 'Cooperação', pattern: ['cooperação', 'coopera', 'ajuda mútua'] },
    { name: 'Comunicação', pattern: ['comunicação', 'comunica'] },
    { name: 'Comprometimento', pattern: ['compromisso', 'comprometimento'] },
    { name: 'Domínio Técnico', pattern: ['domínio técnico', 'conhecimento técnico'] },
    { name: 'Resolução Problemas', pattern: ['problemas', 'resolução', 'solução'] }
  ];

  logger.log('Starting radar data processing', {
    dataRows: data.length,
    competencies: competencies.map(c => ({ name: c.name, patterns: c.pattern }))
  });

  // First, group evaluations by collaborator
  const collaboratorEvaluations: { [key: string]: { [key: string]: { total: number; count: number } } } = {};
  const allCollaborators = new Set<string>();
  const nameMapping: { [key: string]: string } = {};  // Map normalized names to original names

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

  // Process each row of data
  data.forEach((row: any, rowIndex: number) => {
    Object.entries(row).forEach(([field, value]) => {
      // Extract collaborator name from the field (format: "Question >> Name >> Evaluation")
      const parts = field.split('>>').map(part => part.trim());
      if (parts.length < 2) return;

      const question = parts[0];
      const collaborator = parts[1];
      const normalizedName = normalizeCollaboratorName(collaborator);

      // Skip if this is not a valid evaluation field
      if (!question || !collaborator || collaborator === 'Data' || collaborator === 'Submission Date') {
        return;
      }

      // Store the original name mapping
      nameMapping[normalizedName] = collaborator;

      // Initialize collaborator's evaluations object if it doesn't exist
      if (!collaboratorEvaluations[normalizedName]) {
        collaboratorEvaluations[normalizedName] = {};
        competencies.forEach(comp => {
          collaboratorEvaluations[normalizedName][comp.name] = { total: 0, count: 0 };
        });
      }

      // Add collaborator to the set of all collaborators
      allCollaborators.add(normalizedName);

      // Find matching competency for this question
      competencies.forEach(comp => {
        if (matchesCompetency(question, comp.pattern)) {
          const normalizedValue = normalizeEvaluationValue(value as string);
          const score = evaluationScores[normalizedValue] || 0;

          if (score > 0) {  // Only count valid evaluations
            collaboratorEvaluations[normalizedName][comp.name].total += score;
            collaboratorEvaluations[normalizedName][comp.name].count++;
          }
        }
      });
    });
  });

  // Convert the grouped data into the radar chart format
  const radarData: RadarData[] = competencies.map(comp => {
    const dataPoint: RadarData = { subject: comp.name };
    
    allCollaborators.forEach(collaborator => {
      const evaluations = collaboratorEvaluations[collaborator][comp.name];
      const average = evaluations.count > 0 
        ? evaluations.total / evaluations.count 
        : 0;
      
      dataPoint[nameMapping[collaborator] || collaborator] = Number(average.toFixed(2));
    });
    
    return dataPoint;
  });

  logger.log('Radar data processing completed', {
    processedCollaborators: Array.from(allCollaborators),
    competenciesProcessed: competencies.map(c => c.name),
    resultDataPoints: radarData.length
  });

  return radarData;
}

export function processBarData(data: any[]): BarData[] {
  const strengthCategories = [
    { name: 'Domínio técnico', pattern: 'Excelente domínio técnico da área' },
    { name: 'Comunicação', pattern: 'Comunicação clara e efetiva' },
    { name: 'Trabalho em equipe', pattern: 'Trabalho em equipe e colaboração' },
    { name: 'Resolução de problemas', pattern: 'Capacidade de resolver problemas' },
    { name: 'Proatividade', pattern: 'Proatividade e iniciativa' },
    { name: 'Organização', pattern: 'Organização e gestão do tempo' },
    { name: 'Liderança', pattern: 'Habilidades de liderança' },
    { name: 'Adaptabilidade', pattern: 'Adaptabilidade e flexibilidade' },
    { name: 'Inovação', pattern: 'Pensamento inovador' },
    { name: 'Comprometimento', pattern: 'Comprometimento com resultados' }
  ];

  const strengthCounts: { [key: string]: number } = {};
  strengthCategories.forEach(category => {
    strengthCounts[category.name] = 0;
  });

  // Count occurrences of each strength
  data.forEach(row => {
    Object.entries(row).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim()) {
        strengthCategories.forEach(category => {
          if (value.toLowerCase().includes(category.pattern.toLowerCase())) {
            strengthCounts[category.name]++;
          }
        });
      }
    });
  });

  // Convert to array and sort by count
  return Object.entries(strengthCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function processPieData(data: any[]): PieData[] {
  const totalEvaluations = { total: 0 };
  const evaluationCounts: { [key: string]: number } = {
    'Pode melhorar': 0,
    'Atende às expectativas': 0,
    'Supera as expectativas': 0
  };

  // Count occurrences of each evaluation type
  data.forEach(row => {
    Object.values(row).forEach(value => {
      if (typeof value === 'string') {
        const normalizedValue = normalizeEvaluationValue(value);
        if (normalizedValue in evaluationCounts) {
          evaluationCounts[normalizedValue]++;
          totalEvaluations.total++;
        }
      }
    });
  });

  // Convert counts to percentages and assign colors
  return [
    {
      name: 'Pode melhorar',
      value: (evaluationCounts['Pode melhorar'] / totalEvaluations.total) * 100,
      color: '#ff6b6b'
    },
    {
      name: 'Atende às expectativas',
      value: (evaluationCounts['Atende às expectativas'] / totalEvaluations.total) * 100,
      color: '#4ecdc4'
    },
    {
      name: 'Supera as expectativas',
      value: (evaluationCounts['Supera as expectativas'] / totalEvaluations.total) * 100,
      color: '#45b7d1'
    }
  ];
}

export function processCSVData(csvContent: string): ChartDataResponse {
  const parsedData = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true
  }).data;

  logger.log('Processing CSV data', {
    rowCount: parsedData.length,
    sampleRow: parsedData[0]
  });

  return {
    radar: processRadarData(parsedData),
    bar: processBarData(parsedData),
    pie: processPieData(parsedData)
  };
}