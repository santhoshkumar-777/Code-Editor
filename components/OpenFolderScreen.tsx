import React from 'react';
import FolderIcon from './icons/FolderIcon';

interface OpenFolderScreenProps {
  onFolderOpen: () => void;
}

const OpenFolderScreen: React.FC<OpenFolderScreenProps> = ({ onFolderOpen }) => {
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
          onClick={onFolderOpen}
          className="mt-8 flex items-center justify-center gap-3 w-full max-w-xs mx-auto bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 text-lg shadow-lg"
        >
          <FolderIcon className="w-6 h-6" />
          Open Folder
        </button>
      </div>
    </div>
  );
};

export default OpenFolderScreen;
