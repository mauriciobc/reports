import React, { useState } from 'react';
import { DynamicFeedbackVisualization } from './components/DynamicFeedbackVisualization';
import FileList from './components/FileList';
import { ChartDataResponse } from './utils/csvHandler';

const App: React.FC = () => {
  const [chartData, setChartData] = useState<ChartDataResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDataProcessed = (data: ChartDataResponse) => {
    try {
      // Validate data structure
      if (!data.radar || !data.bar || !data.pie) {
        throw new Error('Invalid data structure received');
      }
      
      console.log('Data received:', data);
      setError(null);
      setChartData(data);
    } catch (err) {
      console.error('Error processing data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error processing data');
      setChartData(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Análise de Feedback 360° Equipe DEV
        </h1>
        
        <FileList onDataProcessed={handleDataProcessed} />
        
        {error && (
          <div className="text-center text-red-600 mt-4 p-2 bg-red-100 rounded">
            {error}
          </div>
        )}
        
        {chartData ? (
          <DynamicFeedbackVisualization data={chartData} />
        ) : !error && (
          <div className="text-center text-gray-600 mt-8 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            Faça o upload dos arquivos CSV para visualizar os dados
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
