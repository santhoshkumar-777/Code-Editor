import React, { useState, useMemo } from 'react';
import { FileSystemItem, CodeFile } from '../types';
import FileIcon from './icons/FileIcon';
import SearchIcon from './icons/SearchIcon';

interface SearchManagerProps {
  items: FileSystemItem[];
  onSelectFile: (id: string) => void;
  onViewChange: (view: 'explorer' | 'search' | 'snippets' | 'themes') => void;
}

// Helper function to recursively find all files in the tree
const getAllFiles = (items: FileSystemItem[]): CodeFile[] => {
  let files: CodeFile[] = [];
  for (const item of items) {
    if (item.type === 'file') {
      files.push(item);
    } else if (item.type === 'folder') {
      files = files.concat(getAllFiles(item.children));
    }
  }
  return files;
};


const SearchManager: React.FC<SearchManagerProps> = ({ items, onSelectFile, onViewChange }) => {
  const [query, setQuery] = useState('');

  // Memoize the flattened list of all files for performance
  const allFiles = useMemo(() => getAllFiles(items), [items]);

  const filteredFiles = useMemo(() => {
    if (!query.trim()) {
      return [];
    }
    return allFiles.filter(file => 
      file.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, allFiles]);

  const handleFileClick = (fileId: string) => {
    onSelectFile(fileId);
    onViewChange('explorer'); // Switch view back to explorer for better UX
  };

  return (
    <div className="w-full h-full bg-surface border-r border-border flex flex-col">
      <div className="p-2 flex items-center justify-between border-b border-border flex-shrink-0">
        <h2 className="text-sm font-semibold uppercase text-text-secondary tracking-wider">
          Search
        </h2>
      </div>
      <div className="p-2 border-b border-border">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for files by name..."
            className="w-full bg-background border border-border text-text text-sm p-2 pl-8 rounded-md outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
          <SearchIcon className="w-4 h-4 text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        {query.trim() && filteredFiles.length === 0 ? (
          <div className="p-4 text-center text-sm text-text-secondary">
            No files found matching your search.
          </div>
        ) : (
          <ul>
            {filteredFiles.map(file => (
              <li key={file.id}>
                <button 
                  onClick={() => handleFileClick(file.id)}
                  className="w-full text-left p-2 flex items-center gap-2 hover:bg-border/50 transition-colors"
                >
                  <FileIcon className="w-5 h-5 flex-shrink-0 text-text-secondary" />
                  <span className="truncate text-text">{file.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchManager;
