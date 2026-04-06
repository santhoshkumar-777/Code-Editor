import React from 'react';
import { FileSystemItem, CodeFile } from '../types';
import FileIcon from './icons/FileIcon';

interface EditorTabsProps {
  openFileIds: string[];
  activeFileId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  workspace: { children: FileSystemItem[] };
}

// Helper to find file by ID in a tree
const findFileRecursive = (items: FileSystemItem[], id: string): CodeFile | null => {
  for (const item of items) {
    if (item.id === id && item.type === 'file') return item;
    if (item.type === 'folder') {
      const found = findFileRecursive(item.children, id);
      if (found) return found;
    }
  }
  return null;
};

const EditorTabs: React.FC<EditorTabsProps> = ({ openFileIds, activeFileId, onSelectTab, onCloseTab, workspace }) => {
  if (openFileIds.length === 0) return null;

  return (
    <div className="flex bg-background border-b border-border overflow-x-auto no-scrollbar scroll-smooth h-10 items-center">
      {openFileIds.map(id => {
        const file = findFileRecursive(workspace.children, id);
        if (!file) return null;

        const isActive = activeFileId === id;

        return (
          <div
            key={id}
            onClick={() => onSelectTab(id)}
            className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-r border-border min-w-[120px] max-w-[200px] transition-all duration-200 group relative ${
              isActive 
                ? 'bg-surface text-primary border-t-2 border-t-primary' 
                : 'text-text-secondary hover:bg-surface/50 hover:text-text'
            }`}
          >
            <FileIcon className="w-4 h-4 flex-shrink-0" name={file.name} />
            <span className="text-xs truncate flex-1 font-medium">{file.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(id, e);
              }}
              className={`p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-border transition-all ${
                isActive ? 'opacity-100' : ''
              }`}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default EditorTabs;
