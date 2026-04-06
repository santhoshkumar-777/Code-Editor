import React from 'react';
import FileIcon from './icons/FileIcon';
import CodeBracketIcon from './icons/CodeBracketIcon';
import PaintBrushIcon from './icons/PaintBrushIcon';
import SearchIcon from './icons/SearchIcon';
import CloudIcon from './icons/CloudIcon';
import SparklesIcon from './icons/SparklesIcon';
import TerminalIcon from './icons/TerminalIcon';

type ViewType = 'explorer' | 'search' | 'snippets' | 'themes' | 'deploy' | 'ai';

interface ActivityBarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const ActivityBar: React.FC<ActivityBarProps> = ({ activeView, onViewChange }) => {
  const views: { id: ViewType; icon: React.ReactNode; title: string }[] = [
    { id: 'explorer', icon: <FileIcon className="w-6 h-6" />, title: 'Explorer' },
    { id: 'search', icon: <SearchIcon className="w-6 h-6" />, title: 'Search' },
    { id: 'snippets', icon: <CodeBracketIcon className="w-6 h-6" />, title: 'Snippets' },
    { id: 'themes', icon: <PaintBrushIcon className="w-6 h-6" />, title: 'Themes' },
    { id: 'deploy', icon: <CloudIcon className="w-6 h-6" />, title: 'Deploy' },
    { id: 'ai', icon: <SparklesIcon className="w-6 h-6" />, title: 'AI Assistant' },
  ];

  return (
    <div className="flex flex-col items-center bg-surface border-r border-border py-4 px-2 space-y-2">
      {views.map(view => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          title={view.title}
          aria-label={view.title}
          className={`flex flex-col items-center justify-center gap-1 p-2 w-full rounded-md transition-colors ${
            activeView === view.id
              ? 'bg-primary/20 text-primary'
              : 'text-text-secondary hover:bg-border/50'
          }`}
        >
          {view.icon}
          <span className="text-[10px] sm:text-xs leading-none select-none">{view.title}</span>
        </button>
      ))}
    </div>
  );
};

export default ActivityBar;
