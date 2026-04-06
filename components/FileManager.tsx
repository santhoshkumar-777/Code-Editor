
import React, { useState, useRef, useEffect } from 'react';
import { FileSystemItem, CodeFolder } from '../types';
import FileIcon from './icons/FileIcon';
import FolderIcon from './icons/FolderIcon';
import PlusIcon from './icons/PlusIcon';
import FolderPlusIcon from './icons/FolderPlusIcon';
import TrashIcon from './icons/TrashIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import PlayIcon from './icons/PlayIcon';

export interface ItemCreatorInfo {
  parentId: string | null;
  type: 'file' | 'folder';
}

interface FileManagerProps {
  items: FileSystemItem[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onRunFile?: (id: string) => void;
  onDeleteItem: (id: string) => void;
  creatingItemInfo: ItemCreatorInfo | null;
  onStartCreatingItem: (parentId: string | null, type: 'file' | 'folder') => void;
  onCreateItemConfirm: (name: string, parentId: string | null, type: 'file' | 'folder') => void;
  onCreateItemCancel: () => void;
  fileContents: Record<string, string>;
}

interface ItemCreatorProps {
  parentId: string | null;
  type: 'file' | 'folder';
  onConfirm: (name: string) => void;
  onCancel: () => void;
  existingNames: string[];
}

const ItemCreator: React.FC<ItemCreatorProps> = ({ parentId, type, onConfirm, onCancel, existingNames }) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleConfirm = () => {
    const trimmedName = name.trim();
    if (trimmedName && !existingNames.includes(trimmedName)) {
      onConfirm(trimmedName);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className="pl-4 pr-2 py-1 flex items-center gap-2">
      {type === 'file' ? (
        <FileIcon className="w-5 h-5 flex-shrink-0" name={name || 'file'} />
      ) : (
        <FolderIcon className="w-5 h-5 flex-shrink-0" name={name || 'folder'} />
      )}
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleConfirm}
        placeholder={`Enter ${type} name...`}
        className="w-full bg-background border border-border text-text text-sm p-1 rounded-sm outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
};

interface RenderItemProps {
    item: FileSystemItem;
    level: number;
    activeFileId: string | null;
    expandedFolders: Record<string, boolean>;
    onToggleFolder: (id: string) => void;
    onSelectFile: (id: string) => void;
    onRunFile?: (id: string) => void;
    onDeleteItem: (id: string, name: string) => void;
    onStartCreating: (parentId: string | null, type: 'file' | 'folder') => void;
    fileContents: Record<string, string>;
    children?: React.ReactNode;
}

const RenderItem: React.FC<RenderItemProps> = ({
  item, level, activeFileId, expandedFolders, onToggleFolder, onSelectFile, onRunFile, onDeleteItem, onStartCreating, fileContents, children
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = item.type === 'folder' && expandedFolders[item.id];
  const isFolder = item.type === 'folder';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = isFolder 
      ? `Are you sure you want to delete the folder "${item.name}" and all its contents?` 
      : `Are you sure you want to delete "${item.name}"?`;
      
    if (window.confirm(message)) {
      onDeleteItem(item.id, item.name);
    }
  };

  const handleRun = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRunFile) {
      onRunFile(item.id);
    }
  };

  const isRunnable = item.type === 'file' && ['js', 'ts', 'py', 'java', 'c'].includes(item.name.split('.').pop()?.toLowerCase() || '');

  return (
    <li>
      <div className="relative">
        <button
          className={`w-full text-left pr-2 py-2 flex items-center gap-2 transition-colors duration-150 group text-text ${
            activeFileId === item.id ? 'bg-primary/20 text-primary' : 'hover:bg-border/50'
          }`}
          style={{ paddingLeft: `${level * 1.25 + 0.75}rem` }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => (isFolder ? onToggleFolder(item.id) : onSelectFile(item.id))}
        >
          {isFolder ? (
            <span className="flex items-center gap-2 flex-grow truncate">
              {isExpanded ? <ChevronDownIcon className="w-4 h-4 flex-shrink-0" /> : <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />}
              <FolderIcon className="w-5 h-5 flex-shrink-0" name={item.name} isOpen={isExpanded} />
              <span className="truncate">{item.name}</span>
            </span>
          ) : (
            <span className="flex items-center gap-2 flex-grow truncate">
              <FileIcon className="w-5 h-5 flex-shrink-0" name={item.name} />
              <span className="truncate">{item.name}</span>
            </span>
          )}
          
          {(isHovered || (isFolder && isExpanded && (children as any)?.props?.children?.some((c: any) => c?.key === 'creator')) ) && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {isFolder && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); onStartCreating(item.id, 'file'); }} title="New File" className="p-1 rounded hover:bg-border"><PlusIcon className="w-4 h-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); onStartCreating(item.id, 'folder'); }} title="New Folder" className="p-1 rounded hover:bg-border"><FolderPlusIcon className="w-4 h-4" /></button>
                </>
              )}
              {item.type === 'file' && isRunnable && (
                <button onClick={handleRun} title="Run Code" className="p-1 rounded text-primary hover:bg-primary/20"><PlayIcon className="w-4 h-4" /></button>
              )}
              <button onClick={handleDelete} title={`Delete ${isFolder ? 'Folder' : 'File'}`} className="p-1 rounded text-red-500 hover:bg-red-500/10"><TrashIcon className="w-4 h-4" /></button>
            </div>
          )}
        </button>

        {/* Quick Peek Tooltip */}
        {item.type === 'file' && isHovered && fileContents[item.id] && (
            <div className="file-peek-tooltip left-full ml-4 -top-2 w-64 pointer-events-none z-50">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-60">Peek Preview</span>
                    <span className="text-[9px] text-text-secondary opacity-40 italic">{item.name.split('.').pop()?.toUpperCase()}</span>
                </div>
                <div className="bg-black/20 rounded p-2 border border-white/5">
                    <pre className="text-[10px] leading-tight font-mono text-text-secondary overflow-hidden">
                        {fileContents[item.id].split('\n').slice(0, 6).join('\n') || '// Empty file'}
                    </pre>
                    {fileContents[item.id].split('\n').length > 6 && (
                        <div className="mt-1 text-[9px] text-primary/30 border-t border-white/5 pt-1">... and more lines</div>
                    )}
                </div>
            </div>
        )}
      </div>
      {isFolder && isExpanded && <ul>{children}</ul>}
    </li>
  );
};

const FileManager: React.FC<FileManagerProps> = ({
  items, activeFileId, onSelectFile, onDeleteItem,
  creatingItemInfo, onStartCreatingItem, onCreateItemConfirm, onCreateItemCancel, fileContents
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (creatingItemInfo?.parentId) {
      setExpandedFolders(prev => ({ ...prev, [creatingItemInfo.parentId!]: true }));
    }
  }, [creatingItemInfo]);

  const handleToggleFolder = (id: string) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const handleCreateConfirm = (name: string) => {
    if (creatingItemInfo) {
      onCreateItemConfirm(name, creatingItemInfo.parentId, creatingItemInfo.type);
    }
  };

  const renderItems = (itemList: FileSystemItem[], level: number): React.ReactNode => {
    const sortedList = [...itemList].sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });

    return sortedList.map((item) => (
      <RenderItem
        key={item.id}
        item={item}
        level={level}
        activeFileId={activeFileId}
        expandedFolders={expandedFolders}
        onToggleFolder={handleToggleFolder}
        onSelectFile={onSelectFile}
        onDeleteItem={(id, name) => onDeleteItem(id)}
        onStartCreating={onStartCreatingItem}
        fileContents={fileContents}
      >
        {item.type === 'folder' && (
          <>
            {creatingItemInfo?.parentId === item.id && (
              <li key="creator">
                <ItemCreator
                  parentId={item.id}
                  type={creatingItemInfo.type}
                  onConfirm={handleCreateConfirm}
                  onCancel={onCreateItemCancel}
                  existingNames={item.children.map(c => c.name)}
                />
              </li>
            )}
            {renderItems(item.children, level + 1)}
          </>
        )}
      </RenderItem>
    ));
  };
  
  const getExistingRootNames = () => items.map(i => i.name);

  return (
    <div className="w-full h-full bg-surface border-r border-border flex flex-col file-explorer-panel">
      <div className="p-2 flex items-center justify-between border-b border-border flex-shrink-0">
        <h2 className="text-sm font-semibold uppercase text-text-secondary tracking-wider">
          Explorer
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onStartCreatingItem(null, 'file')}
            className="p-1.5 rounded-md hover:bg-border text-text-secondary transition-colors"
            title="New File"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
           <button
            onClick={() => onStartCreatingItem(null, 'folder')}
            className="p-1.5 rounded-md hover:bg-border text-text-secondary transition-colors"
            title="New Folder"
          >
            <FolderPlusIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        {items.length === 0 && !creatingItemInfo ? (
          <div className="p-4 text-center text-sm text-text-secondary">
            No files yet.
          </div>
        ) : (
          <ul>
            {renderItems(items, 0)}
            {creatingItemInfo && creatingItemInfo.parentId === null && (
              <li>
                <ItemCreator
                  parentId={null}
                  type={creatingItemInfo.type}
                  onConfirm={handleCreateConfirm}
                  onCancel={onCreateItemCancel}
                  existingNames={getExistingRootNames()}
                />
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FileManager;