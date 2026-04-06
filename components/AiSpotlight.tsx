
import React from 'react';
import { SparklesIcon, DocumentMagnifyingGlassIcon, MagicWandIcon } from './icons/AiIcons.tsx';

interface AiSpotlightProps {
  x: number;
  y: number;
  onAction: (action: 'explain' | 'refactor' | 'docs') => void;
  isVisible: boolean;
}

const AiSpotlight: React.FC<AiSpotlightProps> = ({ x, y, onAction, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="ai-spotlight glass rounded-lg p-1.5 flex items-center gap-1 shadow-2xl border border-white/10"
      style={{ 
        left: `${x}px`, 
        top: `${y}px`,
        transform: 'translate(-50%, -100%) translateY(-10px)'
      }}
    >
      <button 
        onClick={() => onAction('explain')}
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-md transition-colors text-xs font-medium text-white group"
      >
        <SparklesIcon className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
        Explain
      </button>
      <div className="w-[1px] h-4 bg-white/10 mx-0.5" />
      <button 
        onClick={() => onAction('refactor')}
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-md transition-colors text-xs font-medium text-white group"
      >
        <MagicWandIcon className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
        Refactor
      </button>
      <div className="w-[1px] h-4 bg-white/10 mx-0.5" />
      <button 
        onClick={() => onAction('docs')}
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-md transition-colors text-xs font-medium text-white group"
      >
        <DocumentMagnifyingGlassIcon className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
        Docs
      </button>
    </div>
  );
};

export default AiSpotlight;
