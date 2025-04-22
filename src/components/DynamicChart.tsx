import React from 'react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Legend, Tooltip, BarChart, CartesianGrid,
  XAxis, YAxis, Bar, PieChart, Pie, Cell
} from 'recharts';
import { RadarDataPoint, BarDataPoint, PieDataPoint } from '../utils/dataMappers';

// Carefully selected colors for good category separation
const COLORS = [
  '#2E86AB', // Blue
  '#A23B72', // Purple-Pink
  '#F18F01', // Orange
  '#2AA876', // Green
  '#C73E1D', // Red
  '#1D7AA2', // Light Blue
  '#6B4E71', // Muted Purple
  '#F49320', // Light Orange
  '#3B7A57', // Forest Green
  '#B22222', // Fire Brick
];

interface ChartProps {
  type: 'radar' | 'bar' | 'pie';
  data: RadarDataPoint[] | BarDataPoint[] | PieDataPoint[];
  isLoading: boolean;
  error: string | null;
}

export const DynamicChart: React.FC<ChartProps> = ({ type, data, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <p>No data available</p>
      </div>
    );
  }

  switch (type) {
    case 'radar':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={data as RadarDataPoint[]}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 3]} />
            {Object.keys((data[0] as RadarDataPoint))
              .filter(key => key !== 'subject')
              .map((key, index) => (
                <Radar
                  key={key}
                  name={key}
                  dataKey={key}
                  stroke={`hsl(${(index * 360) / 5}, 70%, 50%)`}
                  fill={`hsl(${(index * 360) / 5}, 70%, 50%)`}
                  fillOpacity={0.2}
                />
              ))}
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      );

    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data as BarDataPoint[]} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value">
              {(data as BarDataPoint[]).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );

    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data as PieDataPoint[]}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              dataKey="value"
            >
              {(data as PieDataPoint[]).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
  }
};