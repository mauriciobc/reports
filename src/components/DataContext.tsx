import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChartDataResponse } from '../utils/csvHandler';

interface DataContextType {
  chartData: ChartDataResponse | null;
  setChartData: (data: ChartDataResponse) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [chartData, setChartData] = useState<ChartDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const value = {
    chartData,
    setChartData,
    isLoading,
    setIsLoading,
    error,
    setError,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Wrapper component that combines the provider with the file list and visualization
export const DataContextWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const handleDataProcessed = (data: ChartDataResponse) => {
    // You can add any data processing or validation here
    console.log('Data processed:', data);
  };

  return (
    <DataProvider>
      {children}
    </DataProvider>
  );
};