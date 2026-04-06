import React, { useState, useEffect } from 'react';
import { CustomTheme, MonacoTheme } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import PencilIcon from './icons/PencilIcon';
import PaintBrushIcon from './icons/PaintBrushIcon';

export type ThemeFormState = { mode: 'new' } | { mode: 'edit', theme: CustomTheme } | null;

interface ThemeFormProps {
  formState: NonNullable<ThemeFormState>;
  onSave: (theme: CustomTheme) => void;
  onCancel: () => void;
  existingNames: string[];
}

const defaultLightColors = {
    primary: '#4f46e5', 'primary-hover': '#4338ca', background: '#f9fafb',
    surface: '#ffffff', border: '#e5e7eb', text: '#111827',
    'text-secondary': '#6b7280', handle: '#d1d5db',
};
const defaultDarkColors = {
    primary: '#4f46e5', 'primary-hover': '#4338ca', background: '#111827',
    surface: '#1f2937', border: '#374151', text: '#e5e7eb',
    'text-secondary': '#9ca3af', handle: '#4b5563',
};


const ThemeForm: React.FC<ThemeFormProps> = ({ formState, onSave, onCancel, existingNames }) => {
  const themeToEdit = formState.mode === 'edit' ? formState.theme : null;
  
  const [name, setName] = useState(themeToEdit?.name || '');
  const [monacoTheme, setMonacoTheme] = useState<MonacoTheme>(themeToEdit?.monacoTheme || 'vs-dark');
  const [colors, setColors] = useState(themeToEdit?.colors || defaultDarkColors);
  const [error, setError] = useState('');

  const handleColorChange = (key: keyof typeof colors, value: string) => {
    setColors(prev => ({...prev, [key]: value }));
  };
  
  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Theme name is required.');
      return;
    }
    const lowerCaseName = trimmedName.toLowerCase();
    const isNameTaken = existingNames.some(existing => 
      existing.toLowerCase() === lowerCaseName && lowerCaseName !== themeToEdit?.name.toLowerCase()
    );
    if (isNameTaken) {
        setError('A theme with this name already exists.');
        return;
    }

    onSave({
      id: themeToEdit?.id || '',
      name: trimmedName,
      monacoTheme,
      colors,
    });
  };

  const ColorInput: React.FC<{ label: string; colorKey: keyof typeof colors }> = ({ label, colorKey }) => (
      <div className="flex items-center justify-between">
        <label htmlFor={`color-${colorKey}`} className="capitalize text-sm text-text-secondary">{label.replace('-', ' ')}</label>
        <div className="flex items-center gap-2 border border-border rounded-md px-2">
            <input
                id={`color-${colorKey}`}
                type="color"
                value={colors[colorKey]}
                onChange={(e) => handleColorChange(colorKey, e.target.value)}
                className="w-6 h-6 p-0 border-none bg-transparent"
            />
            <span className="font-mono text-sm">{colors[colorKey]}</span>
        </div>
      </div>
  );

  return (
    <div className="p-4 flex flex-col h-full bg-surface text-text">
      <h3 className="text-lg font-semibold mb-4">{themeToEdit ? 'Edit Theme' : 'Create New Theme'}</h3>
      <div className="flex flex-col gap-4 flex-grow overflow-y-auto pr-2">
        <div className="grid grid-cols-1 gap-4">
            <div>
                <label htmlFor="theme-name" className="block text-sm font-medium text-text-secondary mb-1">Theme Name</label>
                <input
                    id="theme-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-border text-text text-sm p-2 rounded-md outline-none focus:ring-1 focus:ring-primary"
                />
            </div>
            <div>
                 <label className="block text-sm font-medium text-text-secondary mb-2">Editor Base</label>
                 <div className="flex gap-4">
                     <label className="flex items-center gap-2"><input type="radio" value="vs-light" checked={monacoTheme === 'vs-light'} onChange={() => setMonacoTheme('vs-light')} /> Light</label>
                     <label className="flex items-center gap-2"><input type="radio" value="vs-dark" checked={monacoTheme === 'vs-dark'} onChange={() => setMonacoTheme('vs-dark')} /> Dark</label>
                 </div>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mt-4">
           {Object.keys(colors).map(key => <ColorInput key={key} label={key} colorKey={key as keyof typeof colors} />)}
        </div>
        
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      <div className="flex items-center justify-end gap-2 pt-4 flex-shrink-0">
        <button onClick={onCancel} className="py-2 px-4 rounded-md hover:bg-border transition-colors">Cancel</button>
        <button onClick={handleSave} className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-md transition-colors">Save Theme</button>
      </div>
    </div>
  );
};

interface ThemeManagerProps {
  customThemes: CustomTheme[];
  activeThemeId: string;
  onSelectTheme: (id: string) => void;
  onSaveTheme: (theme: CustomTheme) => void;
  onDeleteTheme: (id: string) => void;
  formState: ThemeFormState;
  onSetFormState: (state: ThemeFormState) => void;
}

const ThemeManager: React.FC<ThemeManagerProps> = (props) => {
  const { customThemes, activeThemeId, onSelectTheme, onSaveTheme, onDeleteTheme, formState, onSetFormState } = props;
  
  const builtInThemes = [
    { id: 'light', name: 'Default Light' },
    { id: 'dark', name: 'Default Dark' },
  ];

  if (formState) {
    return (
      <ThemeForm
        formState={formState}
        onSave={onSaveTheme}
        onCancel={() => onSetFormState(null)}
        existingNames={customThemes.map(s => s.name)}
      />
    );
  }

  return (
    <div className="w-full h-full bg-surface border-r border-border flex flex-col">
      <div className="p-2 flex items-center justify-between border-b border-border flex-shrink-0">
        <h2 className="text-sm font-semibold uppercase text-text-secondary tracking-wider">
          Themes
        </h2>
        <button
          onClick={() => onSetFormState({ mode: 'new' })}
          className="p-1.5 rounded-md hover:bg-border text-text-secondary transition-colors"
          title="New Theme"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-grow overflow-y-auto">
        {customThemes.length === 0 && builtInThemes.length === 0 ? (
          <div className="p-4 text-center text-sm text-text-secondary">
             <PaintBrushIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            No themes found.
             <button onClick={() => onSetFormState({ mode: 'new' })} className="text-primary hover:underline mt-1">Create your first one!</button>
          </div>
        ) : (
          <ul>
            <li className="px-3 pt-4 pb-2 text-xs font-bold uppercase text-text-secondary">Built-in Themes</li>
            {builtInThemes.map(theme => (
              <li key={theme.id}>
                <button 
                  onClick={() => onSelectTheme(theme.id)}
                  className={`w-full text-left p-3 flex justify-between items-start transition-colors ${
                      activeThemeId === theme.id ? 'bg-primary/20' : 'hover:bg-border/50'
                  }`}
                 >
                   <p className={`font-semibold ${activeThemeId === theme.id ? 'text-primary' : 'text-text'}`}>{theme.name}</p>
                </button>
              </li>
            ))}
            <li className="px-3 pt-4 pb-2 text-xs font-bold uppercase text-text-secondary">Custom Themes</li>
            {customThemes.map(theme => (
              <li key={theme.id} className="group">
                 <button 
                  onClick={() => onSelectTheme(theme.id)}
                  className={`w-full text-left p-3 flex justify-between items-center transition-colors ${
                      activeThemeId === theme.id ? 'bg-primary/20' : 'hover:bg-border/50'
                  }`}
                 >
                  <p className={`font-semibold ${activeThemeId === theme.id ? 'text-primary' : 'text-text'}`}>{theme.name}</p>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onSetFormState({ mode: 'edit', theme })}} title="Edit Theme" className="p-1.5 rounded-md hover:bg-border"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteTheme(theme.id)}} title="Delete Theme" className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ThemeManager;