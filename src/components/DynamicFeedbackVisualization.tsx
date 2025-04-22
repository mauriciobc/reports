import React, { useState } from 'react';
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
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radar}>
              <PolarGrid gridType="polygon" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 5]} />
              <Radar name="Viviane" dataKey="Viviane" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
              <Radar name="Matheus" dataKey="Matheus" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.2} />
              <Radar name="Lidineu" dataKey="Lidineu" stroke="#ffc658" fill="#ffc658" fillOpacity={0.2} />
              <Radar name="Rafael Victor" dataKey="Rafael Victor" stroke="#ff8042" fill="#ff8042" fillOpacity={0.2} />
              <Radar name="Paulo Henrique" dataKey="Paulo Henrique" stroke="#0088fe" fill="#0088fe" fillOpacity={0.2} />
              <Radar name="Yasmin" dataKey="Yasmin" stroke="#00C49F" fill="#00C49F" fillOpacity={0.2} />
              <Legend />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
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
      
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-bold mb-2">Principais Insights:</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>A equipe demonstra forte comprometimento e cooperação mútua</li>
          <li>Excelente capacidade técnica e resolução de problemas</li>
          <li>Oportunidades de melhoria na comunicação e documentação</li>
          <li>Alto nível de adaptabilidade às mudanças e novos desafios</li>
        </ul>
      </div>
    </div>
  );
};

export default DynamicFeedbackVisualization;