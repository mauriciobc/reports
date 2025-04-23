import React, { useCallback, useState, useEffect } from 'react';
import { processChartData } from '../utils/csvHandler';
import { readCSVFiles } from '../utils/fileReader';
import { logger } from '../utils/logger';
import { ensureDataDirectory } from '../utils/ensureDataDir';

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
  const [isDataDirReady, setIsDataDirReady] = useState(false);

  useEffect(() => {
    const checkDataDir = async () => {
      const exists = await ensureDataDirectory();
      setIsDataDirReady(exists);
      if (!exists) {
        logger.error('Data directory is not accessible. Please ensure /public/data exists and contains your CSV files.');
      }
    };
    checkDataDir();
  }, []);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      const fileNames = Array.from(files).map(f => f.name);
      logger.info('Files selected for upload:', fileNames);
      const data = await processChartData(Array.from(files));
      onDataProcessed(data);
      setUploadedFiles(fileNames);
      setSelectedFiles([]);
      setHasProcessedFiles(true);
      setIsExpanded(false);
    } catch (error) {
      logger.error('Error processing files:', error);
      alert('Erro ao processar os arquivos. Por favor, verifique o formato dos CSVs.');
    }
  }, [onDataProcessed]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(event.target.selectedOptions).map(option => option.value);
    
    if (selectedOptions.length === 0) {
      alert('Por favor, selecione pelo menos um arquivo.');
      return;
    }

    setSelectedFiles(selectedOptions);
    setUploadedFiles([]);

    try {
      logger.info('Files selected from list:', selectedOptions);
      const files = await readCSVFiles(selectedOptions);
      
      if (!files || files.length === 0) {
        throw new Error('Nenhum arquivo foi carregado');
      }

      logger.info('Files loaded:', files.map(f => f.name));
      const data = await processChartData(files);
      
      if (!data) {
        throw new Error('Erro ao processar os dados dos arquivos');
      }

      onDataProcessed(data);
      setHasProcessedFiles(true);
      setIsExpanded(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao processar os arquivos';
      logger.error('Error processing selected files:', { error, message: errorMessage });
      alert(`Erro ao processar os arquivos selecionados: ${errorMessage}`);
      setSelectedFiles([]);
      setHasProcessedFiles(false);
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
      {!isDataDirReady && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                O diretório de dados não está acessível. Certifique-se de que a pasta /public/data existe e contém seus arquivos CSV.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Selecione um arquivo</h2>
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
            Selecione um arquivo CSV de feedback disponível ou faça upload de um novo arquivo:
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