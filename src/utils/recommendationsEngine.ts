import { ChartData } from './csvHandler';

interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export function generateRecommendations(
  radarData: ChartData[],
  barData: ChartData[],
  pieData: ChartData[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Analyze radar data for skill gaps
  const avgScores = radarData.reduce((acc, item) => {
    acc[item.name] = item.value;
    return acc;
  }, {} as Record<string, number>);

  const lowScoreSkills = Object.entries(avgScores)
    .filter(([_, value]) => value < 3)
    .map(([skill]) => skill);

  if (lowScoreSkills.length > 0) {
    recommendations.push({
      title: 'Skill Development Needed',
      description: `Focus on improving: ${lowScoreSkills.join(', ')}`,
      priority: 'high'
    });
  }

  // Analyze team strengths
  const topStrengths = barData
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map(item => item.name);

  recommendations.push({
    title: 'Leverage Team Strengths',
    description: `Build upon team's core strengths: ${topStrengths.join(', ')}`,
    priority: 'medium'
  });

  // Analyze rating distribution
  const totalRatings = pieData.reduce((sum, item) => sum + item.value, 0);
  const lowRatings = pieData
    .filter(item => Number(item.name) <= 2)
    .reduce((sum, item) => sum + item.value, 0);

  if (lowRatings / totalRatings > 0.2) {
    recommendations.push({
      title: 'Performance Improvement Required',
      description: 'High percentage of low ratings detected. Consider implementing targeted training programs.',
      priority: 'high'
    });
  }

  return recommendations;
}