
import React from 'react';

interface CodeSnapshotProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  fileName: string;
  language: string;
}

const CodeSnapshot: React.FC<CodeSnapshotProps> = ({ isOpen, onClose, code, fileName, language }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative glass-card max-w-3xl w-full overflow-hidden shadow-2xl border border-white/20 animate-float">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs font-medium text-white/40 font-mono">{fileName}</span>
          <div className="w-12" />
        </div>
        
        <div className="p-8 bg-gradient-to-br from-primary/20 via-background to-purple-500/20">
            <div className="glass p-6 rounded-xl shadow-2xl border border-white/10">
                <pre className="text-sm font-mono text-white/90 overflow-x-auto">
                    <code>{code || '// No code selected'}</code>
                </pre>
            </div>
        </div>
        
        <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-white/5">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            Close
          </button>
          <button 
            onClick={() => {
                alert("Snapshot feature: In a real app, this would use html2canvas to export the PNG!");
                onClose();
            }}
            className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all shadow-lg"
          >
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeSnapshot;
