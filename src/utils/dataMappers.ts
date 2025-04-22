import { ChartData } from './csvHandler';

export interface RadarDataPoint {
  subject: string;
  [key: string]: number | string;
}

export interface BarDataPoint {
  name: string;
  value: number;
}

export interface PieDataPoint {
  name: string;
  value: number;
  color: string;
}

export function mapRadarData(data: any[]): RadarDataPoint[] {
  const subjects = [...new Set(data.map(item => item.competency))];
  const people = [...new Set(data.map(item => item.person))];
  
  return subjects.map(subject => {
    const point: RadarDataPoint = { subject: String(subject) };
    people.forEach(person => {
      const value = data.find(d => d.competency === subject && d.person === person)?.score || 0;
      point[String(person)] = Number(value);
    });
    return point;
  });
}

export function mapBarData(data: any[]): BarDataPoint[] {
  return data.map(item => ({
    name: String(item.strength),
    value: Number(item.frequency)
  }));
}

export function mapPieData(data: any[]): PieDataPoint[] {
  const colors = ['#4CAF50', '#2196F3', '#FFC107', '#9E9E9E', '#F44336'];
  return data.map((item, index) => ({
    name: String(item.rating),
    value: Number(item.count),
    color: colors[index % colors.length]
  }));
}