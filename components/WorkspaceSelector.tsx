import React, { useState, useRef, useEffect } from 'react';
import { CodeFolder } from '../types';
import TrashIcon from './icons/TrashIcon';
import FolderIcon from './icons/FolderIcon';
import PlusIcon from './icons/PlusIcon';

interface WorkspaceSelectorProps {
  workspaces: CodeFolder[];
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onDelete: (id: string, name: string) => void;
}

const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({ workspaces, onSelect, onCreate, onDelete }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating) {
      inputRef.current?.focus();
    }
  }, [isCreating]);

  const handleCreateConfirm = () => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      setIsCreating(false);
      setNewName('');
      setError('');
      return;
    }

    if (workspaces.some(w => w.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError(`Workspace "${trimmedName}" already exists.`);
      return;
    }

    onCreate(trimmedName);
    setNewName('');
    setIsCreating(false);
    setError('');
  };

  const handleCreateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateConfirm();
    }
    if (e.key === 'Escape') {
      setIsCreating(false);
      setNewName('');
      setError('');
    }
  };

  const handleNewButtonClick = () => {
    setError('');
    setIsCreating(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    onDelete(id, name);
  };

  return (
    <div className="h-screen w-screen bg-background text-text flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text flex items-center gap-3">
            <FolderIcon className="w-8 h-8 text-primary" />
            <span>Workspaces</span>
          </h1>
          <button
            onClick={handleNewButtonClick}
            disabled={isCreating}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">New Workspace</span>
          </button>
        </div>
        
        <div className="bg-surface rounded-lg shadow-lg border border-border p-2">
          <ul className="space-y-1">
            {workspaces.map(ws => (
              <li key={ws.id}>
                <button 
                  onClick={() => onSelect(ws.id)}
                  className="w-full text-left flex items-center justify-between p-3 rounded-md hover:bg-border/50 transition-colors duration-150 group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <FolderIcon className="w-5 h-5 flex-shrink-0 text-text-secondary" />
                    <span className="font-medium truncate">{ws.name}</span>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, ws.id, ws.name)}
                    className="p-1.5 rounded-full text-text-secondary opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-opacity flex-shrink-0"
                    title={`Delete ${ws.name}`}
                  >
                    <TrashIcon className="w-4 h-4"/>
                  </button>
                </button>
              </li>
            ))}

            {isCreating && (
              <li className="p-2">
                <div className="flex items-center gap-3">
                   <FolderIcon className="w-5 h-5 flex-shrink-0 text-text-secondary" />
                   <input
                    ref={inputRef}
                    type="text"
                    value={newName}
                    onChange={(e) => {
                        setNewName(e.target.value);
                        if (error) setError('');
                    }}
                    onKeyDown={handleCreateKeyDown}
                    onBlur={handleCreateConfirm}
                    placeholder="Enter new workspace name..."
                    className="w-full bg-background border border-primary text-text text-sm p-1.5 rounded-sm outline-none ring-1 ring-primary"
                   />
                </div>
              </li>
            )}
            
            {workspaces.length === 0 && !isCreating && (
              <div className="text-center py-10">
                <p className="text-text-secondary">No workspaces found.</p>
                <p className="text-sm mt-1 text-text-secondary">Click "New Workspace" to get started.</p>
              </div>
            )}
          </ul>
          {error && <p className="text-red-500 text-sm mt-2 px-3 pb-2">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSelector;