import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell
} from 'recharts';
import { RadarData, BarData, PieData } from '../types';
import { logger } from '../utils/logger';

interface FeedbackVisualizationProps {
  data?: {
    radar: RadarData;
    bar: BarData[];
    pie: PieData[];
  };
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

interface BarChartControlsProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  showPercentages: boolean;
  onDisplayChange: (showPercentages: boolean) => void;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded shadow">
        <p className="font-bold">{label}</p>
        <p style={{ color: payload[0].color }}>
          {payload[0].name}: {payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const BarChartControls: React.FC<BarChartControlsProps> = ({
  sortBy,
  onSortChange,
  showPercentages,
  onDisplayChange
}) => (
  <div className="flex justify-between items-center mb-4 px-4">
    <div className="flex items-center space-x-4">
      <label className="text-sm text-gray-600">Ordenar por:</label>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="name">Nome</option>
        <option value="total">Total</option>
        <option value="needsImprovement">Precisa melhorar</option>
        <option value="asExpected">Atende expectativas</option>
        <option value="exceeds">Supera expectativas</option>
      </select>
    </div>
    <div className="flex items-center space-x-2">
      <label className="text-sm text-gray-600">Mostrar:</label>
      <button
        onClick={() => onDisplayChange(false)}
        className={`px-3 py-1 text-sm rounded-l ${
          !showPercentages
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Absoluto
      </button>
      <button
        onClick={() => onDisplayChange(true)}
        className={`px-3 py-1 text-sm rounded-r ${
          showPercentages
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Percentual
      </button>
    </div>
  </div>
);

const CustomBarTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
    return (
      <div className="bg-white p-3 border rounded shadow-lg">
        <p className="font-bold mb-2 text-gray-800">{label}</p>
        {payload.map((entry) => {
          const value = entry.value || 0;
          const percentage = total > 0 ? (value / total * 100) : 0;
          return (
            <div 
              key={entry.name}
              className="flex justify-between items-center mb-1"
            >
              <span className="flex items-center">
                <span 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                <span style={{ color: entry.color }}>
                  {entry.name}:
                </span>
              </span>
              <span className="ml-4 font-medium">
                {value.toFixed(0)} {total > 0 && `(${percentage.toFixed(1)}%)`}
              </span>
            </div>
          );
        })}
        {total > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold">{total.toFixed(0)}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const DynamicFeedbackVisualization: React.FC<FeedbackVisualizationProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState('competencies');
  const [focusedMember, setFocusedMember] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('name');
  const [showPercentages, setShowPercentages] = useState(false);

  // Log component data on mount and updates
  useEffect(() => {
    logger.log('DynamicFeedbackVisualization received data:', { data });
  }, [data]);

  // Generate colors dynamically based on the data
  const teamMemberColors = useMemo(() => {
    logger.log('Generating team member colors', {
      hasData: !!data?.radar?.data,
      dataLength: data?.radar?.data?.length
    });

    if (!data?.radar?.data || data.radar.data.length === 0) {
      logger.warn('No radar data available for color generation');
      return {};
    }
    
    // Get all collaborators from the first data point
    const collaborators = Object.keys(data.radar.data[0].collaborators);
    logger.log('Found collaborators', { collaborators });

    // Generate colors using HSL for better distribution
    const goldenRatio = 0.618033988749895;
    let hue = Math.random();

    const colors = collaborators.reduce((acc: Record<string, string>, collaborator: string) => {
      hue = (hue + goldenRatio) % 1;
      return {
        ...acc,
        [collaborator]: `hsl(${Math.floor(hue * 360)}, 70%, 50%)`
      };
    }, {});

    logger.log('Generated colors', { colors });
    return colors;
  }, [data?.radar?.data]);

  const handleLegendClick = (member: string) => {
    setFocusedMember(current => current === member ? null : member);
  };

  const getOpacityForMember = (member: string) => {
    if (!focusedMember) return 1;
    return member === focusedMember ? 1 : 0.15;
  };

  const calculatePercentage = (value: number, total: number): number => {
    if (total === 0) return 0;
    return (value / total) * 100;
  };

  const processedBarData = useMemo(() => {
    logger.log('Processing bar data', {
      hasData: !!data?.bar,
      originalData: data?.bar,
      showPercentages,
      sortBy
    });

    if (!data?.bar) {
      logger.warn('No bar data available for processing');
      return [];
    }

    // Create a new array with mapped data to prevent mutations
    const processed = data.bar.map(item => {
      // Calculate total before any transformations
      const total = Math.max(0, item.needsImprovement + item.asExpected + item.exceeds);
      
      // Create new object with processed values
      const processedItem = showPercentages ? {
        ...item,
        needsImprovement: calculatePercentage(item.needsImprovement, total),
        asExpected: calculatePercentage(item.asExpected, total),
        exceeds: calculatePercentage(item.exceeds, total),
        total
      } : {
        ...item,
        total
      };

      logger.log('Processed bar item', { 
        original: item, 
        processed: processedItem,
        total,
        showPercentages,
        mode: showPercentages ? 'percentage' : 'absolute'
      });

      return processedItem;
    });

    // Sort the processed data
    const sortedData = [...processed].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'total') return (b.total || 0) - (a.total || 0);
      
      // Handle numeric comparisons
      const aValue = Number(a[sortBy as keyof typeof a]) || 0;
      const bValue = Number(b[sortBy as keyof typeof b]) || 0;
      return bValue - aValue;
    });

    logger.log('Final processed bar data', { 
      processed: sortedData,
      mode: showPercentages ? 'percentage' : 'absolute',
      itemCount: sortedData.length
    });
    
    return sortedData;
  }, [data?.bar, sortBy, showPercentages]);

  const getBarDomain = useMemo(() => {
    if (!showPercentages) {
      const maxValue = Math.max(
        ...processedBarData.map(item => 
          Math.max(item.needsImprovement, item.asExpected, item.exceeds)
        )
      );
      return [0, Math.ceil(maxValue * 1.1)]; // Add 10% padding
    }
    return [0, 100];
  }, [processedBarData, showPercentages]);

  // Add a download logs button
  const handleDownloadLogs = () => {
    logger.downloadLogs();
  };

  if (!data) {
    logger.warn('No data provided to visualization component');
    return (
      <div className="text-center text-gray-600 mt-8 p-4">
        Carregando dados...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 pb-12 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-center flex-grow">Análise de Feedback 360° Equipe DEV</h1>
      </div>
      
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex justify-center space-x-8">
          <button 
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'competencies' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('competencies')}>
            Competências por Colaborador
          </button>
          <button 
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'strengths' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('strengths')}>
            Pontos Fortes da Equipe
          </button>
          <button 
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'ratings' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('ratings')}>
            Distribuição de Avaliações
          </button>
        </nav>
      </div>
      
      <div className="h-[500px]">
        {activeTab === 'competencies' && (
          <>
            {data?.radar?.data && data.radar.data.length > 0 ? (
              <>
                {data.radar.membersWithNoRatings && data.radar.membersWithNoRatings.length > 0 && (
                  <div className="text-right text-sm text-gray-500 italic mb-2">
                    Sem avaliações: {data.radar.membersWithNoRatings.join(', ')}
                  </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radar.data}>
                    <PolarGrid gridType="polygon" />
                    <PolarAngleAxis 
                      dataKey="competency" 
                      tick={{ fill: '#666', fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 3]} 
                      tickCount={4}
                      tick={{ fontSize: 10 }}
                      axisLine={true}
                      tickFormatter={(value) => value.toFixed(1)}
                    />
                    {Object.entries(teamMemberColors).map(([collaborator, color]) => (
                      <Radar
                        key={collaborator}
                        name={collaborator}
                        dataKey={`collaborators.${collaborator}`}
                        stroke={color}
                        fill={color}
                        fillOpacity={getOpacityForMember(collaborator) * 0.2}
                        strokeOpacity={getOpacityForMember(collaborator)}
                        isAnimationActive={true}
                      />
                    ))}
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 border rounded shadow-lg">
                              <p className="font-bold mb-2 text-gray-800">{label}</p>
                              {payload
                                .filter(entry => !focusedMember || entry.name === focusedMember)
                                .map((entry, index) => (
                                  <p 
                                    key={index} 
                                    style={{ color: entry.color }}
                                    className="flex justify-between items-center mb-1"
                                  >
                                    <span>{entry.name}:</span>
                                    <span className="ml-4 font-medium">
                                      {Number(entry.value).toFixed(2)}
                                    </span>
                                  </p>
                                ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom"
                      height={36}
                      onClick={(e) => handleLegendClick(e.value)}
                      formatter={(value) => (
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
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600">
                Não há dados suficientes para gerar o gráfico de competências
              </div>
            )}
          </>
        )}
        
        {activeTab === 'strengths' && (
          <>
            <BarChartControls
              sortBy={sortBy}
              onSortChange={setSortBy}
              showPercentages={showPercentages}
              onDisplayChange={setShowPercentages}
            />
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={processedBarData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                barSize={20}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
                <XAxis 
                  type="number" 
                  domain={getBarDomain}
                  tickFormatter={value => showPercentages ? `${value}%` : value.toString()}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120}
                  tick={{ fontSize: 12 }}
                  axisLine={true}
                />
                <Tooltip 
                  content={<CustomBarTooltip />}
                  cursor={{ fill: '#f5f5f5' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar 
                  dataKey="needsImprovement" 
                  name="Precisa melhorar" 
                  stackId="a"
                  fill="#FFC107"  // Yellow
                  minPointSize={2}
                  isAnimationActive={true}
                />
                <Bar 
                  dataKey="asExpected" 
                  name="Atende expectativas" 
                  stackId="a"
                  fill="#2196F3"  // Blue
                  minPointSize={2}
                  isAnimationActive={true}
                />
                <Bar 
                  dataKey="exceeds" 
                  name="Supera expectativas" 
                  stackId="a"
                  fill="#4CAF50"  // Green
                  minPointSize={2}
                  isAnimationActive={true}
                />
              </BarChart>
            </ResponsiveContainer>
            {processedBarData.length === 0 && (
              <div className="flex items-center justify-center h-full text-gray-600">
                Não há dados para exibir no gráfico
              </div>
            )}
          </>
        )}
        
        {activeTab === 'ratings' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.pie}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ value }) => value > 0 ? `${value.toFixed(1)}%` : ''}
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
                formatter={(value) => {
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