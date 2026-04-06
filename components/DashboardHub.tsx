
import React from 'react';
import { FileSystemItem, CodeFolder, Language } from '../types';
import CodeBracketIcon from './icons/CodeBracketIcon';
import FolderIcon from './icons/FolderIcon';
import FileIcon from './icons/FileIcon';
import SparklesIcon from './icons/SparklesIcon';

interface DashboardHubProps {
  workspace: CodeFolder;
  onStartNewFile: () => void;
  onOpenAI: () => void;
}

const DashboardHub: React.FC<DashboardHubProps> = ({ workspace, onStartNewFile, onOpenAI }) => {
  
  const getStats = (items: FileSystemItem[]) => {
    let fileCount = 0;
    let folderCount = 0;
    let languages: Record<string, number> = {};

    const traverse = (list: FileSystemItem[]) => {
      list.forEach(item => {
        if (item.type === 'file') {
          fileCount++;
          const ext = item.name.split('.').pop()?.toLowerCase() || 'txt';
          languages[ext] = (languages[ext] || 0) + 1;
        } else {
          folderCount++;
          traverse(item.children);
        }
      });
    };

    traverse(items);
    return { fileCount, folderCount, languages };
  };

  const { fileCount, folderCount, languages } = getStats(workspace.children);
  const totalFiles = fileCount || 1;

  return (
    <div className="h-full w-full flex items-center justify-center p-8 overflow-y-auto bg-background/30 backdrop-blur-md">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Project Overview */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 animate-float">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/10">
              <CodeBracketIcon className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-text tracking-tighter uppercase">Project Pulse</h2>
              <p className="text-text-secondary text-sm font-medium opacity-60 italic">Welcome to your workspace!</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface/50 border border-border p-4 rounded-xl hover:border-primary/50 transition-all group">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1 group-hover:text-primary">Files</p>
              <p className="text-2xl font-black text-text">{fileCount}</p>
            </div>
            <div className="bg-surface/50 border border-border p-4 rounded-xl hover:border-primary/50 transition-all group">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1 group-hover:text-primary">Folders</p>
              <p className="text-2xl font-black text-text">{folderCount}</p>
            </div>
          </div>

          <div className="bg-surface/50 border border-border p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-text uppercase tracking-widest flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-primary" />
              AI Insights
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-text-secondary bg-primary/5 p-2 rounded-lg border border-primary/10">
                <span className="text-primary font-bold">💡</span>
                <span>You have a lot of <b>.{Object.keys(languages)[0] || 'code'}</b> files. Focus on modularizing components!</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-text-secondary bg-primary/5 p-2 rounded-lg border border-primary/10">
                <span className="text-primary font-bold">🚀</span>
                <span>Ready to deploy? Your project structure looks solid for Vercel/Netlify.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right: Language Distribution & Actions */}
        <div className="space-y-8 flex flex-col justify-center">
            <div>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-6 border-b border-border pb-2">Language Mix</h3>
                <div className="space-y-4">
                    {Object.entries(languages).map(([lang, count]) => {
                        const percent = Math.round((count / totalFiles) * 100);
                        return (
                            <div key={lang} className="space-y-1">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                                    <span className="text-text">{lang}</span>
                                    <span className="text-primary">{percent}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary transition-all duration-1000 ease-out" 
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <button 
                    onClick={onStartNewFile}
                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-95"
                >
                    <PlusIcon className="w-5 h-5" />
                    CREATE NEW FILE
                </button>
                <button 
                    onClick={onOpenAI}
                    className="w-full bg-surface hover:bg-border text-text font-bold py-4 rounded-xl border border-border transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                    <SparklesIcon className="w-5 h-5 text-primary" />
                    ASK AI ASSISTANT
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

// Internal PlusIcon if needed
const PlusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

export default DashboardHub;
