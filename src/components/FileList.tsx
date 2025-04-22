import React, { useEffect, useState } from 'react';
import { useData } from './DataContext';
import { readCsvFiles } from '../utils/csvHandler';

export const FileList: React.FC = () => {
  const { setChartData, setIsLoading, setError } = useData();
  const [files, setFiles] = useState<string[]>([]);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await readCsvFiles('./data');
      setChartData(data);
      setFiles(Object.keys(data).map(type => `${type}.csv`));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Available Data Files</h2>
        <button
          onClick={loadFiles}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Refresh data"
        >
          <span className="mr-2">↻</span> Refresh
        </button>
      </div>
      {files.length > 0 ? (
        <ul className="space-y-2">
          {files.map(file => (
            <li key={file} className="flex items-center">
              <span className="mr-2">📄</span>
              {file}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No CSV files found in data directory</p>
      )}
    </div>
  );
};