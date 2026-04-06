import { useMemo } from 'react';
import { Command, CodeFile } from '../types';

interface CommandProps {
  activeFile: CodeFile | null;
  activeView: 'explorer' | 'search' | 'snippets' | 'themes';
  handleRunCode: () => void;
  handleSaveFile: () => void;
  handleFormatCode: () => void;
  onManageThemes: () => void;
  setActiveView: (view: 'explorer' | 'search' | 'snippets' | 'themes') => void;
  onStartNewFile: () => void;
  onStartNewFolder: () => void;
  onStartNewSnippet: () => void;
}

export const useCommands = (props: CommandProps): Command[] => {
  const {
    activeFile,
    activeView,
    handleRunCode,
    handleSaveFile,
    handleFormatCode,
    onManageThemes,
    setActiveView,
    onStartNewFile,
    onStartNewFolder,
    onStartNewSnippet
  } = props;

  return useMemo(() => {
    const isFileActive = activeFile !== null;

    const commands: Command[] = [
      {
        id: 'run-code',
        name: 'Run Code',
        shortcut: 'Ctrl+Enter',
        action: handleRunCode,
        disabled: !isFileActive,
      },
      {
        id: 'save-file',
        name: 'Save File',
        shortcut: 'Ctrl+S',
        action: handleSaveFile,
        disabled: !isFileActive,
      },
      {
        id: 'format-code',
        name: 'Format Code',
        shortcut: 'Ctrl+Shift+F',
        action: handleFormatCode,
        disabled: !isFileActive,
      },
      {
        id: 'manage-themes',
        name: 'Manage Themes',
        action: onManageThemes,
      },
      {
        id: 'new-file',
        name: 'New File',
        action: onStartNewFile,
      },
      {
        id: 'new-folder',
        name: 'New Folder',
        action: onStartNewFolder,
      },
      {
        id: 'new-snippet',
        name: 'New Snippet',
        action: onStartNewSnippet,
      },
      {
        id: 'view-explorer',
        name: 'View: Explorer',
        action: () => setActiveView('explorer'),
      },
      {
        id: 'view-search',
        name: 'View: Search',
        action: () => setActiveView('search'),
      },
       {
        id: 'view-snippets',
        name: 'View: Snippets',
        action: () => setActiveView('snippets'),
      },
      {
        id: 'view-themes',
        name: 'View: Themes',
        action: () => setActiveView('themes'),
      }
    ];

    return commands;
  }, [
    activeFile, 
    activeView,
    handleRunCode, 
    handleSaveFile, 
    handleFormatCode, 
    onManageThemes,
    setActiveView,
    onStartNewFile,
    onStartNewFolder,
    onStartNewSnippet
  ]);
};
