export interface RadarDataPoint {
  competency: string;
  collaborators: {
    [key: string]: number;
  };
}

export interface RadarData {
  data: RadarDataPoint[];
  membersWithNoRatings: string[];
}

export interface BarData {
  name: string;
  needsImprovement: number;
  asExpected: number;
  exceeds: number;
  total?: number;
}

export interface PieData {
  name: string;
  value: number;
  color: string;
}

export interface ChartData {
  radar: RadarData[];
  bar: BarData[];
  pie: PieData[];
} 