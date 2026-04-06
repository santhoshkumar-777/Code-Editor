import React, { useState, useEffect } from 'react';
import FileIcon from './icons/FileIcon';

interface OpenFileScreenProps {
  onFileOpen: () => void;
}

const OpenFileScreen: React.FC<OpenFileScreenProps> = ({ onFileOpen }) => {
  const [isApiSupported, setIsApiSupported] = useState(true);

  useEffect(() => {
    // FIX: Check for the environment-provided file picker API instead of the standard browser API
    // to ensure compatibility within the sandboxed iframe environment.
    const anyWindow = window as any;
    if (!anyWindow.aistudio || typeof anyWindow.aistudio.showOpenFilePicker !== 'function') {
      setIsApiSupported(false);
    }
  }, []);

  return (
    <div className="h-screen w-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-light-text dark:text-dark-text">
          Nanba Naan Code Editor
        </h1>
        <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">
          Your lightweight, browser-based code editor.
        </p>
        <button
          onClick={onFileOpen}
          disabled={!isApiSupported}
          className="mt-8 flex items-center justify-center gap-3 w-full max-w-xs mx-auto bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileIcon className="w-6 h-6" />
          Open File
        </button>
        {!isApiSupported && (
          <p className="mt-4 text-sm text-red-500 dark:text-red-400 max-w-md mx-auto">
            The File System Access API is not available in this environment.
            <br />
            Please ensure you are running the editor in a compatible host application.
          </p>
        )}
      </div>
    </div>
  );
};

export default OpenFileScreen;