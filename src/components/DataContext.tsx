import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChartData } from '../utils/csvHandler';

interface DataContextType {
  radarData: ChartData[];
  barData: ChartData[];
  pieData: ChartData[];
  setChartData: (data: { radar: ChartData[]; bar: ChartData[]; pie: ChartData[] }) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [radarData, setRadarData] = useState<ChartData[]>([]);
  const [barData, setBarData] = useState<ChartData[]>([]);
  const [pieData, setPieData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setChartData = (data: { radar: ChartData[]; bar: ChartData[]; pie: ChartData[] }) => {
    setRadarData(data.radar);
    setBarData(data.bar);
    setPieData(data.pie);
  };

  return (
    <DataContext.Provider value={{
      radarData,
      barData,
      pieData,
      setChartData,
      isLoading,
      setIsLoading,
      error,
      setError
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}