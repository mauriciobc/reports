import React, { useCallback, useState } from 'react';
import { processChartData } from '../utils/csvHandler';
import { readCSVFiles } from '../utils/fileReader';

interface FileListProps {
  onDataProcessed: (data: any) => void;
}

const availableFiles = [
  'Feedback_360_-_gosystem_Seminov2025-04-16_09_57_24.csv',
  'Feedback_360_Plataforma_CCO2025-04-16_09_56_34.csv',
  'Feedback_360_RSP_2025-04-16_09_59_46.csv',
  'Feedback_360_Squad2025-04-16_09_57_05.csv',
  'Feedback_360_gosystem_mobilidad2025-04-16_09_57_41.csv'
];

const FileList: React.FC<FileListProps> = ({ onDataProcessed }) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasProcessedFiles, setHasProcessedFiles] = useState(false);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      const fileNames = Array.from(files).map(f => f.name);
      console.log('Files selected for upload:', fileNames);
      const data = await processChartData(Array.from(files));
      onDataProcessed(data);
      setUploadedFiles(fileNames);
      setSelectedFiles([]);
      setHasProcessedFiles(true);
      setIsExpanded(false);
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Erro ao processar os arquivos. Por favor, verifique o formato dos CSVs.');
    }
  }, [onDataProcessed]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(event.target.selectedOptions).map(option => option.value);
    setSelectedFiles(selectedOptions);
    setUploadedFiles([]);

    try {
      console.log('Files selected from list:', selectedOptions);
      const files = await readCSVFiles(selectedOptions);
      console.log('Files loaded:', files.map(f => f.name));
      const data = await processChartData(files);
      onDataProcessed(data);
      setHasProcessedFiles(true);
      setIsExpanded(false);
    } catch (error) {
      console.error('Error processing selected files:', error);
      alert('Erro ao processar os arquivos selecionados.');
    }
  }, [onDataProcessed]);

  const getSelectedFilesDisplay = () => {
    const files = uploadedFiles.length > 0 ? uploadedFiles : selectedFiles;
    if (files.length === 1) {
      return files[0];
    }
    return `${files.length} arquivos selecionados`;
  };

  const ChevronIcon = ({ isExpanded }: { isExpanded: boolean }) => (
    <svg
      className={`w-5 h-5 transition-transform ${isExpanded ? '' : 'transform rotate-180'}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 15l7-7 7 7"
      />
    </svg>
  );

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Seleção de Arquivos CSV</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-sm text-blue-600 hover:text-blue-800 focus:outline-none flex items-center gap-1 group"
          aria-label={isExpanded ? 'Recolher' : 'Expandir'}
        >
          {hasProcessedFiles && !isExpanded && (selectedFiles.length > 0 || uploadedFiles.length > 0) && (
            <span className="mr-1 text-gray-600 max-w-[400px] truncate group-hover:text-blue-800">{getSelectedFilesDisplay()}</span>
          )}
          <ChevronIcon isExpanded={isExpanded} />
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-sm text-gray-600 mb-4">
            Selecione os arquivos CSV de feedback disponíveis ou faça upload de novos arquivos:
          </p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="fileSelect" className="block text-sm font-medium text-gray-700 mb-2">
                Arquivos disponíveis:
              </label>
              <select
                id="fileSelect"
                multiple
                value={selectedFiles}
                onChange={handleFileSelect}
                className="block w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                size={5}
              >
                {availableFiles.map((file) => (
                  <option key={file} value={file}>
                    {file}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Pressione Ctrl (Windows) ou Command (Mac) para selecionar múltiplos arquivos
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white text-sm text-gray-500">ou</span>
              </div>
            </div>

            <div>
              <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-700 mb-2">
                Upload de novos arquivos:
              </label>
              <input
                id="fileUpload"
                type="file"
                multiple
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileList;