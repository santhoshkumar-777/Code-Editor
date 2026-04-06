import React, { useState, useEffect } from 'react';
import { CodeSnippet } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import PencilIcon from './icons/PencilIcon';
import CodeBracketIcon from './icons/CodeBracketIcon';

export type SnippetFormState = { mode: 'new' } | { mode: 'edit', snippet: CodeSnippet } | null;

interface SnippetFormProps {
  formState: NonNullable<SnippetFormState>;
  onSave: (snippet: CodeSnippet) => void;
  onCancel: () => void;
  existingNames: string[];
}

const SnippetForm: React.FC<SnippetFormProps> = ({ formState, onSave, onCancel, existingNames }) => {
  const snippetToEdit = formState.mode === 'edit' ? formState.snippet : null;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (snippetToEdit) {
      setName(snippetToEdit.name);
      setDescription(snippetToEdit.description);
      setCode(snippetToEdit.code);
    }
  }, [snippetToEdit]);

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Snippet name (trigger) is required.');
      return;
    }
    const lowerCaseName = trimmedName.toLowerCase();
    const isNameTaken = existingNames.some(existing => 
      existing.toLowerCase() === lowerCaseName && lowerCaseName !== snippetToEdit?.name.toLowerCase()
    );
    if (isNameTaken) {
        setError('A snippet with this name already exists.');
        return;
    }
    if (!code.trim()) {
        setError('Snippet code cannot be empty.');
        return;
    }

    onSave({
      id: snippetToEdit?.id || '', // ID will be generated for new snippets by parent
      name: trimmedName,
      description: description.trim(),
      code: code,
    });
  };

  return (
    <div className="p-4 flex flex-col h-full bg-surface text-text">
      <h3 className="text-lg font-semibold mb-4">{snippetToEdit ? 'Edit Snippet' : 'Create New Snippet'}</h3>
      <div className="flex flex-col gap-4 flex-grow">
        <div>
          <label htmlFor="snippet-name" className="block text-sm font-medium text-text-secondary mb-1">Name (Trigger)</label>
          <input
            id="snippet-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., 'react-fc'"
            className="w-full bg-background border border-border text-text text-sm p-2 rounded-md outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="snippet-desc" className="block text-sm font-medium text-text-secondary mb-1">Description</label>
          <input
            id="snippet-desc"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., 'React Functional Component'"
            className="w-full bg-background border border-border text-text text-sm p-2 rounded-md outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col flex-grow">
          <label htmlFor="snippet-code" className="block text-sm font-medium text-text-secondary mb-1">Code</label>
          <textarea
            id="snippet-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="const MyComponent = () => {\n  return <div>$1</div>;\n};"
            className="w-full h-full flex-grow bg-background border border-border text-text text-sm p-2 rounded-md outline-none focus:ring-1 focus:ring-primary font-mono resize-none"
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      <div className="flex items-center justify-end gap-2 pt-4 flex-shrink-0">
        <button onClick={onCancel} className="py-2 px-4 rounded-md hover:bg-border transition-colors">Cancel</button>
        <button onClick={handleSave} className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-md transition-colors">Save Snippet</button>
      </div>
    </div>
  );
};

interface SnippetManagerProps {
  snippets: CodeSnippet[];
  onSaveSnippet: (snippet: CodeSnippet) => void;
  onDeleteSnippet: (id: string) => void;
  formState: SnippetFormState;
  onSetFormState: (state: SnippetFormState) => void;
}

const SnippetManager: React.FC<SnippetManagerProps> = ({ snippets, onSaveSnippet, onDeleteSnippet, formState, onSetFormState }) => {

  const handleDelete = (id: string, name: string) => {
      if (window.confirm(`Are you sure you want to delete the snippet "${name}"?`)) {
          onDeleteSnippet(id);
      }
  }

  if (formState) {
    return (
      <SnippetForm
        formState={formState}
        onSave={onSaveSnippet}
        onCancel={() => onSetFormState(null)}
        existingNames={snippets.map(s => s.name)}
      />
    );
  }

  return (
    <div className="w-full h-full bg-surface border-r border-border flex flex-col">
      <div className="p-2 flex items-center justify-between border-b border-border flex-shrink-0">
        <h2 className="text-sm font-semibold uppercase text-text-secondary tracking-wider">
          Snippets
        </h2>
        <button
          onClick={() => onSetFormState({ mode: 'new' })}
          className="p-1.5 rounded-md hover:bg-border text-text-secondary transition-colors"
          title="New Snippet"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-grow overflow-y-auto">
        {snippets.length === 0 ? (
          <div className="p-4 text-center text-sm text-text-secondary">
             <CodeBracketIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            No snippets yet.
             <button onClick={() => onSetFormState({ mode: 'new' })} className="text-primary hover:underline mt-1">Create your first one!</button>
          </div>
        ) : (
          <ul>
            {snippets.map(snippet => (
              <li key={snippet.id} className="border-b border-border group">
                <div className="p-3 flex justify-between items-start hover:bg-border/50">
                    <div className="flex-grow truncate mr-2">
                        <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-text truncate">{snippet.name}</p>
                            {snippet.isDefault && (
                                <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">Default</span>
                            )}
                        </div>
                        <p className="text-sm text-text-secondary truncate">{snippet.description || 'No description'}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => onSetFormState({ mode: 'edit', snippet })} 
                            title={snippet.isDefault ? "Edit as Copy" : "Edit Snippet"} 
                            className="p-1.5 rounded-md hover:bg-border"
                        >
                            <PencilIcon className="w-4 h-4" />
                        </button>
                        {!snippet.isDefault && (
                            <button 
                                onClick={() => handleDelete(snippet.id, snippet.name)} 
                                title="Delete Snippet" 
                                className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SnippetManager;