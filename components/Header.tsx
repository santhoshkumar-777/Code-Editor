import React from 'react';
import PlayIcon from './icons/PlayIcon';
import SaveIcon from './icons/SaveIcon';
import SparklesIcon from './icons/SparklesIcon';
import HomeIcon from './icons/HomeIcon';
import CommandIcon from './icons/CommandIcon';
import { CustomTheme, MonacoTheme } from '../types';
import PaintBrushIcon from './icons/PaintBrushIcon';
import BrowserIcon from './icons/BrowserIcon';
import UserIcon from './icons/UserIcon';
import SpeakerWaveIcon from './icons/SpeakerWaveIcon';
import { User } from '@supabase/supabase-js';

interface BuiltInTheme {
  id: 'light' | 'dark';
  name: string;
  // FIX: Added monacoTheme to BuiltInTheme to match the data structure.
  monacoTheme: MonacoTheme;
}

interface HeaderProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onRunCode: () => void;
  onSaveFile: () => void;
  onFormatCode: () => void;
  themes: (BuiltInTheme | CustomTheme)[];
  activeThemeId: string;
  onSelectTheme: (id: string) => void;
  isLoading: boolean;
  isFormatting: boolean;
  onCloseFile: () => void;
  activeFileName?: string;
  onToggleCommandPalette: () => void;
  showWebPreview: boolean;
  onToggleWebPreview: () => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  ambientSound: 'none' | 'rain' | 'lofi' | 'waves';
  onSelectAmbientSound: (sound: 'none' | 'rain' | 'lofi' | 'waves') => void;
  onTakeSnapshot: () => void;
  zenModeEnabled: boolean;
  onToggleZenMode: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  switchType: 'blue' | 'brown' | 'red';
  onSwitchTypeChange: (type: 'blue' | 'brown' | 'red') => void;
}

const Header: React.FC<HeaderProps> = ({
  fontSize,
  onFontSizeChange,
  onRunCode,
  onSaveFile,
  onFormatCode,
  themes,
  activeThemeId,
  onSelectTheme,
  isLoading,
  isFormatting,
  onCloseFile,
  activeFileName,
  onToggleCommandPalette,
  showWebPreview,
  onToggleWebPreview,
  user,
  onLogin,
  onLogout,
  isFocusMode,
  onToggleFocusMode,
  ambientSound,
  onSelectAmbientSound,
  onTakeSnapshot,
  zenModeEnabled,
  onToggleZenMode,
  audioEnabled,
  onToggleAudio,
  switchType,
  onSwitchTypeChange,
}) => {
  const fontSizes = [12, 14, 16, 18, 20];

  return (
    <header className="bg-surface p-2 border-b border-border flex items-center justify-between shadow-sm flex-shrink-0">
      <div className="flex items-center gap-2">
         <button
          onClick={onCloseFile}
          className="flex items-center gap-1.5 p-2 rounded-md hover:bg-border/50 text-text-secondary transition-colors"
          title="Home"
        >
          <HomeIcon className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Home</span>
        </button>
        <button
          onClick={onToggleCommandPalette}
          className="flex items-center gap-1.5 p-2 rounded-md hover:bg-border/50 text-text-secondary transition-colors"
          title="Command Palette (Ctrl+Shift+P)"
        >
          <CommandIcon className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Commands</span>
        </button>
        <div className="flex items-center ml-2">
            {activeFileName && <span className="text-sm text-text-secondary hidden md:block truncate max-w-[200px]">{activeFileName}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <select
          value={fontSize}
          onChange={(e) => onFontSizeChange(Number(e.target.value))}
          className="bg-background border border-border rounded-md pl-3 pr-8 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
          title="Select Font Size"
        >
          {fontSizes.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
        <button
          onClick={onFormatCode}
          disabled={isFormatting}
          className="flex items-center gap-1.5 p-2 rounded-md hover:bg-border text-text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Format Code (Ctrl+Shift+F)"
        >
          {isFormatting ? (
            <div className="w-5 h-5 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">Format</span>
            </>
          )}
        </button>
        <button
          onClick={onSaveFile}
          className="flex items-center gap-1.5 p-2 rounded-md hover:bg-border text-text-secondary transition-colors"
          title="Save File (Ctrl+S)"
        >
          <SaveIcon className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Save</span>
        </button>
        <button
          onClick={onToggleWebPreview}
          className={`flex items-center justify-center gap-2 font-semibold py-2 px-3 rounded-md transition-all duration-200 ${showWebPreview ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'bg-surface border border-border hover:bg-border text-text-secondary'}`}
          title="Toggle Web Preview"
        >
          <BrowserIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Preview</span>
        </button>
        <button
          onClick={onRunCode}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Run Code (Ctrl+Enter)"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              <span>Running...</span>
            </>
          ) : (
            <>
              <PlayIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Run</span>
            </>
          )}
        </button>
        <div className="relative">
          <PaintBrushIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
          <select
            value={activeThemeId}
            onChange={(e) => onSelectTheme(e.target.value)}
            className="bg-background border border-border rounded-md pl-10 pr-4 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
            title="Select Theme"
          >
            {themes.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 border-l border-border pl-2 sm:pl-4">
          <button
            onClick={onToggleFocusMode}
            className={`p-2 rounded-md transition-all ${isFocusMode ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:bg-border'}`}
            title="Focus Mode"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          </button>
          
          <select
            value={ambientSound}
            onChange={(e) => onSelectAmbientSound(e.target.value as any)}
            className="bg-background border border-border rounded-md px-2 py-2 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
            title="Ambient Sound"
          >
            <option value="none">Silence</option>
            <option value="rain">Rain</option>
            <option value="lofi">Lofi</option>
            <option value="waves">Waves</option>
          </select>

          <button
            onClick={onTakeSnapshot}
            className="p-2 rounded-md text-text-secondary hover:bg-border transition-colors"
            title="Code Snapshot"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          </button>

          <button
            onClick={onToggleZenMode}
            className={`p-2 rounded-md transition-all ${zenModeEnabled ? 'bg-primary/20 text-primary animate-pulse' : 'text-text-secondary hover:bg-border'}`}
            title="Zen Typing Mode"
          >
            <SparklesIcon className="w-5 h-5" />
          </button>

          <div className="h-4 w-px bg-border/50 mx-1" />

          <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border border-border">
            <button
              onClick={onToggleAudio}
              className={`p-1.5 rounded transition-all ${audioEnabled ? 'text-primary bg-primary/10' : 'text-text-secondary hover:bg-border'}`}
              title="Toggle Mechanical Typing Audio"
            >
              <SpeakerWaveIcon className="w-4 h-4" />
            </button>
            {audioEnabled && (
              <select
                value={switchType}
                onChange={(e) => onSwitchTypeChange(e.target.value as any)}
                className="bg-transparent border-none text-[8px] font-black uppercase tracking-widest text-text-secondary focus:outline-none focus:ring-0 pr-4"
                title="Select Switch Type"
              >
                <option value="blue">Blue</option>
                <option value="brown">Brown</option>
                <option value="red">Red</option>
              </select>
            )}
          </div>
        </div>
        
        <div className="h-8 w-px bg-border mx-1 hidden sm:block" />
        
        {user ? (
          <div className="flex items-center gap-3 pl-2">
            <div className="flex flex-col items-end hidden lg:flex">
              <span className="text-xs font-medium text-text truncate max-w-[120px]">
                {user.email?.split('@')[0]}
              </span>
              <button 
                onClick={onLogout}
                className="text-[10px] text-primary hover:underline"
              >
                Sign Out
              </button>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
              <UserIcon className="w-5 h-5" />
            </div>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200 font-medium text-sm"
          >
            <UserIcon className="w-4 h-4" />
            <span>Login</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;