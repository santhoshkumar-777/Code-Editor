import React from 'react';
import ClearIcon from './icons/ClearIcon';
import ErrorIcon from './icons/ErrorIcon';
import WarningIcon from './icons/WarningIcon';
import InfoIcon from './icons/InfoIcon';
import { ConsoleOutput, OutputType } from '../types';

interface ConsoleProps {
  output: ConsoleOutput;
  isLoading: boolean;
  onClear: () => void;
}

const OutputDisplay: React.FC<{ output: ConsoleOutput }> = ({ output }) => {
  if (!output || !output.message) {
    return <span className="text-text-secondary">Output will appear here...</span>;
  }



  let IconComponent: React.FC<{ className?: string }> | null = null;
  let textColor = 'text-text';

  switch (output.type) {
    case OutputType.Error:
      IconComponent = ErrorIcon;
      textColor = 'text-red-500 dark:text-red-400';
      break;
    case OutputType.Warning:
      IconComponent = WarningIcon;
      textColor = 'text-yellow-500 dark:text-yellow-400';
      break;
    case OutputType.Info:
      IconComponent = InfoIcon;
      textColor = 'text-text-secondary';
      break;
    case OutputType.Stdout:
    default:
      IconComponent = null;
      break;
  }

  return (
    <div className={`flex items-start gap-2 ${textColor}`}>
      {IconComponent && <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />}
      <pre className="whitespace-pre-wrap flex-1">{output.message}</pre>
    </div>
  );
};


const Console: React.FC<ConsoleProps> = ({ output, isLoading, onClear }) => {
  return (
    <div className="h-full bg-surface flex flex-col">
      <div className="px-4 py-1.5 flex items-center justify-between border-b border-border flex-shrink-0">
        <h3 className="font-semibold text-sm text-text tracking-wide">
          Console
        </h3>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 p-1.5 px-2 rounded-md hover:bg-border/50 text-text-secondary transition-colors"
          title="Clear Console"
        >
          <ClearIcon className="w-4 h-4" />
          <span className="text-xs font-medium">Clear</span>
        </button>
      </div>
      <div className="flex-1 p-4 font-mono text-sm overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center gap-2 text-text-secondary">
            <div className="w-4 h-4 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
            <span>Executing code...</span>
          </div>
        ) : (
          <OutputDisplay output={output} />
        )}
      </div>
    </div>
  );
};

export default Console;