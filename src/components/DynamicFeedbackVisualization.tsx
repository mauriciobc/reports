import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell
} from 'recharts';

interface FeedbackVisualizationProps {
  data?: {
    radar: RadarData[];
    bar: BarData[];
    pie: PieData[];
  };
}

interface RadarData {
  subject: string;
  [key: string]: string | number;
}

interface BarData {
  name: string;
  value: number;
}

interface PieData {
  name: string;
  value: number;
  color: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded shadow">
        <p className="font-semibold">{payload[0].name}</p>
        <p style={{ color: payload[0].color }}>
          {payload[0].value.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

export const DynamicFeedbackVisualization: React.FC<FeedbackVisualizationProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState('competencies');
  const [focusedMember, setFocusedMember] = useState<string | null>(null);

  // Generate colors dynamically based on the data
  const teamMemberColors = useMemo(() => {
    if (!data?.radar || data.radar.length === 0) return {};
    
    // Get all member names from the first radar data point
    const memberNames = Object.keys(data.radar[0])
      .filter(key => key !== 'subject');
    
    // Generate colors using HSL for better distribution
    return memberNames.reduce((acc, member, index) => ({
      ...acc,
      [member]: `hsl(${(index * 360) / memberNames.length}, 70%, 50%)`
    }), {} as Record<string, string>);
  }, [data?.radar]);

  const handleLegendClick = (member: string) => {
    setFocusedMember(current => current === member ? null : member);
  };

  const getOpacityForMember = (member: string) => {
    if (!focusedMember) return 1;
    return member === focusedMember ? 1 : 0.15;
  };

  if (!data) {
    return (
      <div className="text-center text-gray-600 mt-8 p-4">
        Carregando dados...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">Análise de Feedback 360° Equipe DEV</h1>
      
      <div className="flex justify-center mb-6">
        <button 
          className={`px-4 py-2 mx-2 rounded-md transition-colors duration-200 ${activeTab === 'competencies' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          onClick={() => setActiveTab('competencies')}>
          Competências por Colaborador
        </button>
        <button 
          className={`px-4 py-2 mx-2 rounded-md transition-colors duration-200 ${activeTab === 'strengths' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          onClick={() => setActiveTab('strengths')}>
          Pontos Fortes da Equipe
        </button>
        <button 
          className={`px-4 py-2 mx-2 rounded-md transition-colors duration-200 ${activeTab === 'ratings' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          onClick={() => setActiveTab('ratings')}>
          Distribuição de Avaliações
        </button>
      </div>
      
      <div className="h-[500px]">
        {activeTab === 'competencies' && (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radar}>
                <PolarGrid gridType="polygon" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 3]} 
                  tickCount={4}
                />
                {Object.entries(teamMemberColors).map(([member, color]) => (
                  <Radar
                    key={member}
                    name={member}
                    dataKey={member}
                    stroke={color}
                    fill={color}
                    fillOpacity={getOpacityForMember(member) * 0.2}
                    strokeOpacity={getOpacityForMember(member)}
                  />
                ))}
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  onClick={(e) => handleLegendClick(e.value)}
                  formatter={(value, entry) => (
                    <span style={{ 
                      color: focusedMember ? (value === focusedMember ? '#666' : '#999') : '#666',
                      cursor: 'pointer',
                      fontWeight: value === focusedMember ? 'bold' : 'normal'
                    }}>
                      {value}
                    </span>
                  )}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="text-center text-sm text-gray-600 mt-2">
              Clique em um nome na legenda para destacar seus dados
            </div>
          </>
        )}
        
        {activeTab === 'strengths' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.bar}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 'auto']} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="value" 
                name="Frequência na equipe" 
                fill="#8884d8"
                radius={[0, 4, 4, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {activeTab === 'ratings' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.pie}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => value > 0 ? `${value.toFixed(1)}%` : ''}
                outerRadius={160}
                innerRadius={80}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {data.pie.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    strokeWidth={entry.value > 0 ? 2 : 0}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry: any) => {
                  const item = data.pie.find(d => d.name === value);
                  return `${value} (${item ? item.value.toFixed(1) : 0}%)`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default DynamicFeedbackVisualization;