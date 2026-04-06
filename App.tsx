import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { Language, ConsoleOutput, OutputType, FileSystemItem, CodeFolder, CodeFile, CodeSnippet, CustomTheme, MonacoTheme } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { useCommands } from './hooks/useCommands';
import Header from './components/Header';
import Editor from './components/Editor';
import SparklesIcon from './components/icons/SparklesIcon';
import Console from './components/Console';
import Toast from './components/Toast';
import FileManager, { ItemCreatorInfo } from './components/FileManager';
import DashboardHub from './components/DashboardHub';
import WorkspaceSelector from './components/WorkspaceSelector';
import { runCode, formatCode } from './services/geminiService';
import ActivityBar from './components/ActivityBar';
import SnippetManager, { SnippetFormState } from './components/SnippetManager';
import SqlWorkbench from './components/SqlWorkbench';
import CommandPalette from './components/CommandPalette';
import ThemeManager, { ThemeFormState } from './components/ThemeManager';
import SearchManager from './components/SearchManager';
import DeployManager from './components/DeployManager';
import { supabase } from './services/supabaseClient';
import AuthModal from './components/AuthModal';
import { User } from '@supabase/supabase-js';
import { fetchWorkspacesFromCloud } from './services/syncService';
import Terminal from './components/Terminal';
import EditorTabs from './components/EditorTabs';
import AiAssistant from './components/AiAssistant';
import InfoIcon from './components/icons/InfoIcon';
import TerminalIcon from './components/icons/TerminalIcon';
import CodeBracketIcon from './components/icons/CodeBracketIcon';
import AiSpotlight from './components/AiSpotlight.tsx';
import VoiceAssistant from './components/VoiceAssistant.tsx';
import AmbientSound from './components/AmbientSound.tsx';
import CodeSnapshot from './components/CodeSnapshot.tsx';
import TypingAudio, { SwitchType } from './components/TypingAudio';
import { DEFAULT_SNIPPETS } from './utils/defaultSnippets';


// --- Helper Functions ---

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getLanguageFromExtension = (filename: string): Language => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'html': return Language.HTML;
        case 'css': return Language.CSS;
        case 'py': return Language.Python;
        case 'java': return Language.Java;
        case 'c': return Language.C;
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
        default: return Language.JavaScript;
    }
};

const findItemRecursive = (items: FileSystemItem[], id: string): FileSystemItem | null => {
    for (const item of items) {
        if (item.id === id) return item;
        if (item.type === 'folder') {
            const found = findItemRecursive(item.children, id);
            if (found) return found;
        }
    }
    return null;
};

// Collect all files (recursively) from workspace
const getAllFilesFromTree = (items: FileSystemItem[]): CodeFile[] => {
    const files: CodeFile[] = [];
    for (const item of items) {
        if (item.type === 'file') {
            files.push(item);
        } else if (item.type === 'folder') {
            files.push(...getAllFilesFromTree(item.children));
        }
    }
    return files;
};

// Build a single bundled HTML by injecting CSS and JS from workspace
const buildBundledHtml = (
    htmlContent: string,
    allFiles: CodeFile[],
    fileContents: Record<string, string>
): string => {
    // Collect all CSS file contents
    const cssFiles = allFiles.filter(f => f.name.endsWith('.css'));
    const jsFiles = allFiles.filter(f => f.name.endsWith('.js') || f.name.endsWith('.jsx'));

    const inlineStyles = cssFiles
        .map(f => `/* === ${f.name} === */\n${fileContents[f.id] || ''}`)
        .join('\n\n');

    const inlineScripts = jsFiles
        .map(f => `/* === ${f.name} === */\n${fileContents[f.id] || ''}`)
        .join('\n\n');

    let bundled = htmlContent;

    // Inject CSS before </head> or at top if no </head>
    if (inlineStyles.trim()) {
        const styleTag = `\n<style>\n${inlineStyles}\n</style>\n`;
        if (bundled.includes('</head>')) {
            bundled = bundled.replace('</head>', `${styleTag}</head>`);
        } else {
            bundled = styleTag + bundled;
        }
    }

    // Inject JS before </body> or at bottom if no </body>
    if (inlineScripts.trim()) {
        const scriptTag = `\n<script>\n${inlineScripts}\n</script>\n`;
        if (bundled.includes('</body>')) {
            bundled = bundled.replace('</body>', `${scriptTag}</body>`);
        } else {
            bundled = bundled + scriptTag;
        }
    }

    return bundled;
};

const addItemToTree = (items: FileSystemItem[], parentId: string | null, newItem: FileSystemItem): FileSystemItem[] => {
    if (parentId === null) {
        return [...items, newItem];
    }
    return items.map(item => {
        if (item.type === 'folder') {
            if (item.id === parentId) {
                return { ...item, children: [...item.children, newItem] };
            }
            return { ...item, children: addItemToTree(item.children, parentId, newItem) };
        }
        return item;
    });
};

const getIdsToDelete = (item: FileSystemItem): string[] => {
    if (item.type === 'file') {
        return [item.id];
    }
    return [item.id, ...item.children.flatMap(getIdsToDelete)];
};

const deleteItemFromTree = (items: FileSystemItem[], id: string): FileSystemItem[] => {
    return items
        .filter(item => item.id !== id)
        .map(item => {
            if (item.type === 'folder') {
                return { ...item, children: deleteItemFromTree(item.children, id) };
            }
            return item;
        });
};

const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
      : '0 0 0';
};


// --- WorkspaceLayout Component ---

interface WorkspaceLayoutProps {
  workspace: CodeFolder;
  activeTheme: { id: string; monacoTheme: MonacoTheme; };
  // FIX: Updated the type for the `themes` prop to correctly include `monacoTheme` for built-in themes.
  themes: ({ id: 'light' | 'dark'; name: string; monacoTheme: MonacoTheme } | CustomTheme)[];
  onSelectTheme: (id: string) => void;
  customThemes: CustomTheme[];
  onSaveTheme: (theme: CustomTheme) => void;
  onDeleteTheme: (id: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onCloseWorkspace: () => void;
  onUpdateWorkspace: (workspace: CodeFolder) => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = (props) => {
  const { 
      workspace, activeTheme, themes, onSelectTheme, customThemes, onSaveTheme, onDeleteTheme,
      fontSize, onFontSizeChange, onCloseWorkspace, onUpdateWorkspace,
      user, onLogin, onLogout
  } = props;
  
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [openFileIds, setOpenFileIds] = useLocalStorage<string[]>(`nanba-open-files-${workspace.id}`, []);
  const [fileContents, setFileContents] = useLocalStorage<Record<string, string>>(`nanba-file-contents-${workspace.id}`, {});
  const [snippets, setSnippets] = useLocalStorage<CodeSnippet[]>(`nanba-snippets-${workspace.id}`, []);
  
  const [activeView, setActiveView] = useState<'explorer' | 'search' | 'snippets' | 'themes' | 'deploy' | 'ai'>('explorer');
  const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput>({ type: OutputType.Info, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [showWebPreview, setShowWebPreview] = useState(false);
  const [bottomPanelView, setBottomPanelView] = useState<'console' | 'terminal' | 'sql'>('console');
  const [sqlBufferB64, setSqlBufferB64] = useLocalStorage<string | null>(`nanba-sql-db-${workspace.id}`, null);

  // State lifted from children for command palette
  const [creatingItemInfo, setCreatingItemInfo] = useState<ItemCreatorInfo | null>(null);
  const [snippetFormState, setSnippetFormState] = useState<SnippetFormState | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [themeFormState, setThemeFormState] = useState<ThemeFormState | null>(null);
  const [spotlightSelection, setSpotlightSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'lofi' | 'waves'>('none');
  const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);
  const [zenModeEnabled, setZenModeEnabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [audioEnabled, setAudioEnabled] = useLocalStorage<boolean>(`nanba-audio-enabled-${workspace.id}`, false);
  const [switchType, setSwitchType] = useLocalStorage<SwitchType>(`nanba-switch-type-${workspace.id}`, 'brown');
  const [typeTrigger, setTypeTrigger] = useState(0);
  const [history, setHistory] = useLocalStorage<Record<string, { content: string; timestamp: number }[]>>(`nanba-history-${workspace.id}`, {});
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const zenTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeFile = activeFileId ? findItemRecursive(workspace.children, activeFileId) as CodeFile : null;
  const currentContent = activeFile ? fileContents[activeFile.id] || '' : '';

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2000);
  };

  const handleSpotlightAction = async (action: 'explain' | 'refactor' | 'docs') => {
    if (!spotlightSelection || isLoading) return;
    
    const { text } = spotlightSelection;
    setSpotlightSelection(null);
    setActiveView('ai');
    
    // Dispatch a custom event for the AiAssistant to pick up
    const event = new CustomEvent('ai-spotlight-request', { 
      detail: { action, text } 
    });
    document.dispatchEvent(event);
  };

  const handleVoiceCommand = (command: string) => {
    if (command.includes('run')) {
      handleRunCode();
    } else if (command.includes('save')) {
      handleSaveFile();
    } else if (command.includes('new file')) {
      handleStartCreatingItem(null, 'file');
    } else if (command.includes('ai') || command.includes('help')) {
      setActiveView('ai');
    } else if (command.includes('zen') || command.includes('focus')) {
      setZenModeEnabled(!zenModeEnabled);
    } else if (command.includes('sql') || command.includes('database')) {
      setBottomPanelView('sql');
    }
  };

  const handleType = () => {
    setTypeTrigger(prev => prev + 1);
    if (!zenModeEnabled) return;
    setIsTyping(true);
    if (zenTimerRef.current) clearTimeout(zenTimerRef.current);
    zenTimerRef.current = setTimeout(() => setIsTyping(false), 2000);
  };

  const handleSelectFile = (id: string) => {
    setActiveFileId(id);
    if (!openFileIds.includes(id)) {
      setOpenFileIds(prev => [...prev, id]);
    }
  };

  const handleCloseTab = (id: string) => {
    const newOpenFiles = openFileIds.filter(fileId => fileId !== id);
    setOpenFileIds(newOpenFiles);
    if (activeFileId === id) {
      setActiveFileId(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null);
    }
  };

  const handleContentChange = (newContent: string) => {
    if (activeFile) {
      setFileContents(prev => ({ ...prev, [activeFile.id]: newContent }));
    }
  };

  const handleRunCode = useCallback(async (fileIdToRun?: string) => {
    const fileToRunId = fileIdToRun || activeFileId;
    if (!fileToRunId || isLoading) return;
    
    const fileToRun = findItemRecursive(workspace.children, fileToRunId) as CodeFile;
    if (!fileToRun) return;

    setIsLoading(true);
    setConsoleOutput({ type: OutputType.Info, message: 'Running code...' });
    try {
      const language = getLanguageFromExtension(fileToRun.name);
      const contentToRun = fileContents[fileToRun.id] || '';
      const output = await runCode(contentToRun, language);
      setConsoleOutput(output);
    } catch (error) {
      const message = error instanceof Error ? `Error: ${error.message}`: 'An unexpected error occurred.';
      setConsoleOutput({ type: OutputType.Error, message });
    } finally {
      setIsLoading(false);
    }
  }, [activeFileId, isLoading, workspace.children, fileContents]);
  
  const handleSaveFile = useCallback(async () => {
    if (!activeFile) return;

    try {
      if ('showSaveFilePicker' in window) {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: activeFile.name,
        });
        const writable = await handle.createWritable();
        await writable.write(currentContent);
        await writable.close();
        showToast(`'${activeFile.name}' saved to your device!`);
      } else {
        // Fallback for browsers without showSaveFilePicker
        const blob = new Blob([currentContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = activeFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`'${activeFile.name}' downloaded!`);
      }

      // Save to local history timeline
      setHistory(prev => {
        const fileHistory = prev[activeFile.id] || [];
        const newSnapshot = { content: currentContent, timestamp: Date.now() };
        // Keep only last 20 versions
        const updated = [newSnapshot, ...fileHistory].slice(0, 20);
        return { ...prev, [activeFile.id]: updated };
      });
      setHistoryIndex(-1); // Reset to current

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error("Error saving file to device:", error);
      showToast("Failed to save file.");
    }
  }, [activeFile, currentContent]);

  const handleFormatCode = useCallback(async () => {
    if (!activeFile || isFormatting) return;
    setIsFormatting(true);
    try {
        const language = getLanguageFromExtension(activeFile.name);
        const formatted = await formatCode(currentContent, language);
        handleContentChange(formatted);
        showToast('Code formatted and saved!');
    } catch (error) {
        showToast(error instanceof Error ? error.message : 'Formatting failed.');
    } finally {
        setIsFormatting(false);
    }
  }, [activeFile, isFormatting, currentContent]);

  const handleStartCreatingItem = (parentId: string | null, type: 'file' | 'folder') => {
    setCreatingItemInfo({ parentId, type });
  };

  const handleCreateItemConfirm = (name: string, parentId: string | null, type: 'file' | 'folder') => {
    const newItem: FileSystemItem = type === 'file'
      ? { id: generateId(), name, type: 'file' }
      : { id: generateId(), name, type: 'folder', children: [] };
    
    const newTree = addItemToTree(workspace.children, parentId, newItem);
    onUpdateWorkspace({ ...workspace, children: newTree });
    
    if (newItem.type === 'file') {
        setFileContents(prev => ({...prev, [newItem.id]: ''}));
        handleSelectFile(newItem.id);
    }
    setCreatingItemInfo(null);
  };

  const handleDeleteItem = (id: string) => {
    const itemToDelete = findItemRecursive(workspace.children, id);
    if (!itemToDelete) return;

    const idsToDelete = getIdsToDelete(itemToDelete);
    const newTree = deleteItemFromTree(workspace.children, id);
    onUpdateWorkspace({ ...workspace, children: newTree });

    const newFileContents = { ...fileContents };
    idsToDelete.forEach(deletedId => delete newFileContents[deletedId]);
    setFileContents(newFileContents);

    if (activeFileId && idsToDelete.includes(activeFileId)) {
      handleCloseTab(activeFileId);
    }
    setOpenFileIds(prev => prev.filter(id => !idsToDelete.includes(id)));
  };

  const handleSaveSnippet = (snippetToSave: CodeSnippet) => {
    setSnippets(prev => {
        const index = prev.findIndex(s => s.id === snippetToSave.id);
        if (index !== -1) {
            // Edit existing custom snippet
            const newSnippets = [...prev];
            newSnippets[index] = { ...snippetToSave, isDefault: false };
            return newSnippets;
        }
        // New snippet OR editing a default one (creates a custom copy)
        // If it's a default snippet, it will have a default ID (e.g., 'def-html-5'), 
        // which we now replace with a brand new ID to keep the custom version separate.
        return [...prev, { ...snippetToSave, id: generateId(), isDefault: false }];
    });
    showToast(`Snippet "${snippetToSave.name}" saved!`);
    setSnippetFormState(null);
  };

  const handleDeleteSnippet = (id: string) => {
    setSnippets(prev => prev.filter(s => s.id !== id));
    showToast("Snippet deleted.");
  };

  const handleSaveTheme = (themeToSave: CustomTheme) => {
    onSaveTheme(themeToSave);
    showToast(`Theme "${themeToSave.name}" saved!`);
    setThemeFormState(null);
  };

  const commands = useCommands({
    activeFile,
    activeView,
    handleRunCode: () => handleRunCode(),
    handleSaveFile,
    handleFormatCode,
    onManageThemes: () => setActiveView('themes'),
    setActiveView,
    onStartNewFile: () => { setActiveView('explorer'); setCreatingItemInfo({ parentId: null, type: 'file' }) },
    onStartNewFolder: () => { setActiveView('explorer'); setCreatingItemInfo({ parentId: null, type: 'folder' })},
    onStartNewSnippet: () => { setActiveView('snippets'); setSnippetFormState({ mode: 'new' })},
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlKey = isMac ? event.metaKey : event.ctrlKey;

      if (isCtrlKey && event.shiftKey && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (event.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
      if (isCtrlKey && event.key === 'Enter') {
        event.preventDefault();
        handleRunCode();
      }
      if (isCtrlKey && event.key === 's') {
        event.preventDefault();
        handleSaveFile();
      }
      if (isCtrlKey && event.shiftKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        handleFormatCode();
      }
      if (isCtrlKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        setZenModeEnabled(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleGenerateDocker = () => {
      const dockerfileId = generateId();
      const composeId = generateId();
      
      const dockerfile: CodeFile = { id: dockerfileId, name: 'Dockerfile', type: 'file' };
      const compose: CodeFile = { id: composeId, name: 'docker-compose.yml', type: 'file' };
      
      onUpdateWorkspace({
        ...workspace,
        children: [...workspace.children, dockerfile, compose]
      });
      
      setFileContents(prev => ({
        ...prev,
        [dockerfileId]: 'FROM nginx:alpine\nCOPY . /usr/share/nginx/html\nEXPOSE 80\nCMD ["nginx", "-g", "daemon off;"]',
        [composeId]: 'version: "3.8"\nservices:\n  web:\n    build: .\n    ports:\n      - "8080:80"\n    restart: always'
      }));
      
      showToast('Docker configuration generated!');
      setActiveFileId(dockerfileId);
      setActiveView('explorer');
    };
    document.addEventListener('generate-docker-files', handleGenerateDocker);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('generate-docker-files', handleGenerateDocker);
    };
  }, [handleRunCode, handleSaveFile, handleFormatCode, workspace, onUpdateWorkspace, setFileContents, setActiveFileId, setActiveView, zenModeEnabled]);

  useEffect(() => {
    if (isTyping && zenModeEnabled) {
        document.body.classList.add('zen-active');
    } else {
        document.body.classList.remove('zen-active');
    }
  }, [isTyping, zenModeEnabled]);

  useEffect(() => {
    if (!activeFile) return;
    const lang = getLanguageFromExtension(activeFile.name);
    let color1 = '224 100% 64%'; // Default blue
    let color2 = '280 100% 64%'; // Default purple
    
    if (lang === Language.JavaScript) {
        color1 = '45 100% 50%'; // Yellow
        color2 = '30 100% 60%'; // Orange
    } else if (lang === Language.Python) {
        color1 = '210 100% 50%'; // Blue
        color2 = '180 100% 50%'; // Cyan
    } else if (lang === Language.HTML) {
        color1 = '25 100% 50%'; // Deep Orange
        color2 = '15 100% 60%'; // Red-Orange
    } else if (lang === Language.CSS) {
        color1 = '280 100% 64%'; // Purple
        color2 = '320 100% 60%'; // Pink
    }
    
    document.documentElement.style.setProperty('--dynamic-1', color1);
    document.documentElement.style.setProperty('--dynamic-2', color2);
    document.documentElement.style.setProperty('--primary', color1); // Sync primary color
  }, [activeFile]);

  return (
    <div className="h-screen w-screen flex flex-col text-text bg-surface overflow-hidden">
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commands}
      />
      <Header
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
        onRunCode={handleRunCode}
        onSaveFile={handleSaveFile}
        onFormatCode={handleFormatCode}
        themes={themes}
        activeThemeId={activeTheme.id}
        onSelectTheme={onSelectTheme}
        isLoading={isLoading}
        isFormatting={isFormatting}
        onCloseFile={onCloseWorkspace}
        activeFileName={activeFile?.name}
        onToggleCommandPalette={() => setIsCommandPaletteOpen(true)}
        showWebPreview={showWebPreview}
        onToggleWebPreview={() => setShowWebPreview(!showWebPreview)}
        user={user}
        onLogin={onLogin}
        onLogout={onLogout}
        isFocusMode={isFocusMode}
        onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
        ambientSound={ambientSound}
        onSelectAmbientSound={setAmbientSound}
        onTakeSnapshot={() => setIsSnapshotOpen(true)}
        zenModeEnabled={zenModeEnabled}
        onToggleZenMode={() => setZenModeEnabled(!zenModeEnabled)}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled(!audioEnabled)}
        switchType={switchType}
        onSwitchTypeChange={setSwitchType}
      />
      <main className="flex-1 flex min-h-0">
         <ActivityBar activeView={activeView} onViewChange={setActiveView} />
         <PanelGroup direction="horizontal" className="flex-grow">
            <Panel defaultSize={20} minSize={15} id="sidebar" className="max-w-[400px]">
                {activeView === 'explorer' && (
                    <FileManager
                        items={workspace.children}
                        activeFileId={activeFileId}
                        onSelectFile={handleSelectFile}
                        onDeleteItem={handleDeleteItem}
                        creatingItemInfo={creatingItemInfo}
                        onStartCreatingItem={setCreatingItemInfo}
                        onCreateItemConfirm={handleCreateItemConfirm}
                        onCreateItemCancel={() => setCreatingItemInfo(null)}
                        fileContents={fileContents}
                    />
                )}
                {activeView === 'search' && (
                    <SearchManager
                        items={workspace.children}
                        onSelectFile={handleSelectFile}
                        onViewChange={setActiveView}
                    />
                )}
                {activeView === 'snippets' && (
                    <SnippetManager 
                        snippets={[
                            ...DEFAULT_SNIPPETS.filter(ds => !snippets.some(s => s.name === ds.name)), 
                            ...snippets
                        ]}
                        onDeleteSnippet={handleDeleteSnippet}
                        // Controlled state props
                        formState={snippetFormState}
                        onSaveSnippet={handleSaveSnippet}
                        onSetFormState={setSnippetFormState}
                    />
                )}
                {activeView === 'themes' && (
                    <ThemeManager
                        customThemes={customThemes}
                        activeThemeId={activeTheme.id}
                        onSelectTheme={onSelectTheme}
                        onDeleteTheme={onDeleteTheme}
                        formState={themeFormState}
                        onSaveTheme={handleSaveTheme}
                        onSetFormState={setThemeFormState}
                    />
                )}
                {activeView === 'deploy' && (
                    <DeployManager
                        workspace={workspace}
                        fileContents={fileContents}
                        onStartCreatingItem={setCreatingItemInfo}
                        onCreateItemConfirm={handleCreateItemConfirm}
                        onUpdateFileContent={handleContentChange}
                        onSelectFile={handleSelectFile}
                    />
                )}
                {activeView === 'ai' && (
                    <div className="ai-assistant-panel h-full">
                        <AiAssistant 
                            items={workspace.children}
                            fileContents={fileContents}
                        />
                    </div>
                )}
            </Panel>
            <PanelResizeHandle className="w-1.5 bg-background flex items-center justify-center hover:bg-primary/20 transition-colors data-[resize-handle-state=drag]:bg-primary/30">
                <div className="w-0.5 h-8 rounded-full bg-handle" />
            </PanelResizeHandle>
            <Panel defaultSize={80} minSize={30} id="editor-console">
                <PanelGroup direction="vertical">
                    <Panel defaultSize={65} minSize={20} id="editor">
                        <div className="h-full flex flex-col">
                            <EditorTabs 
                                openFileIds={openFileIds}
                                activeFileId={activeFileId}
                                onSelectTab={handleSelectFile}
                                onCloseTab={handleCloseTab}
                                workspace={workspace}
                            />
                            <div className="flex-1 min-h-0 relative">
                                <Editor
                                    key={activeFileId}
                                    content={historyIndex !== -1 && activeFile && history[activeFile.id] ? history[activeFile.id][historyIndex].content : currentContent}
                                    language={activeFile ? getLanguageFromExtension(activeFile.name) : 'plaintext'}
                                    readOnly={historyIndex !== -1}
                                    onChange={handleContentChange}
                                    theme={activeTheme.monacoTheme}
                                    fontSize={fontSize}
                                    onSelectionChange={setSpotlightSelection}
                                    onType={handleType}
                                    snippets={[
                                        ...DEFAULT_SNIPPETS.filter(ds => !snippets.some(s => s.name === ds.name)), 
                                        ...snippets
                                    ]}
                                />
                                <AiSpotlight 
                                    isVisible={!!spotlightSelection}
                                    x={spotlightSelection?.x || 0}
                                    y={spotlightSelection?.y || 0}
                                    onAction={handleSpotlightAction}
                                />

                                {/* History Timeline Slider */}
                                {activeFile && history[activeFile.id] && history[activeFile.id].length > 0 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-72 bg-surface/90 backdrop-blur-2xl border border-primary/20 p-4 rounded-3xl shadow-2xl z-[100] group flex flex-col gap-3 transition-all hover:w-80">
                                        <div className="flex justify-between items-center px-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${historyIndex === -1 ? 'bg-green-500 animate-pulse' : 'bg-primary'}`} />
                                                <span className="text-[10px] font-black text-text uppercase tracking-widest">Time Travel</span>
                                            </div>
                                            <span className="text-[9px] text-text-secondary opacity-60">
                                                {historyIndex === -1 ? 'Current' : new Date(history[activeFile.id][historyIndex].timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <input 
                                            type="range"
                                            min="-1"
                                            max={history[activeFile.id].length - 1}
                                            value={historyIndex}
                                            onChange={(e) => setHistoryIndex(parseInt(e.target.value))}
                                            className="w-full accent-primary h-1.5 bg-border rounded-full appearance-none cursor-pointer"
                                        />
                                        {historyIndex !== -1 && (
                                            <button 
                                                onClick={() => {
                                                    handleContentChange(history[activeFile.id][historyIndex].content);
                                                    setHistoryIndex(-1);
                                                    showToast("Restored from history!");
                                                }}
                                                className="text-[10px] font-bold text-white bg-primary px-4 py-2 rounded-xl uppercase tracking-widest self-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/30"
                                            >
                                                Restore This State
                                            </button>
                                        )}
                                    </div>
                                )}

                                {!activeFile && (
                                    <DashboardHub 
                                        workspace={workspace} 
                                        onStartNewFile={() => { setActiveView('explorer'); setCreatingItemInfo({ parentId: null, type: 'file' }) }}
                                        onOpenAI={() => setActiveView('ai')}
                                    />
                                )}
                            </div>
                        </div>
                    </Panel>
                    
                    <PanelResizeHandle className="h-1.5 bg-background flex items-center justify-center hover:bg-primary/20 transition-colors data-[resize-handle-state=drag]:bg-primary/30">
                        <div className="h-0.5 w-8 rounded-full bg-handle" />
                    </PanelResizeHandle>
                    
                    <Panel defaultSize={35} minSize={10} id="bottom-panel">
                        <div className="h-full flex flex-col">
                            <div className="flex bg-surface border-b border-border">
                                <button 
                                    onClick={() => setBottomPanelView('console')}
                                    className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-all duration-200 border-b-2 ${bottomPanelView === 'console' ? 'text-primary border-primary bg-primary/5' : 'text-text-secondary border-transparent hover:text-text hover:bg-white/5'}`}
                                >
                                    <InfoIcon className="w-3.5 h-3.5" />
                                    CONSOLE
                                </button>
                                <button 
                                    onClick={() => setBottomPanelView('terminal')}
                                    className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-all duration-200 border-b-2 ${bottomPanelView === 'terminal' ? 'text-primary border-primary bg-primary/5' : 'text-text-secondary border-transparent hover:text-text hover:bg-white/5'}`}
                                >
                                    <TerminalIcon className="w-3.5 h-3.5" />
                                    TERMINAL
                                </button>
                                <button 
                                    onClick={() => setBottomPanelView('sql')}
                                    className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-all duration-200 border-b-2 ${bottomPanelView === 'sql' ? 'text-primary border-primary bg-primary/5' : 'text-text-secondary border-transparent hover:text-text hover:bg-white/5'}`}
                                >
                                    <SparklesIcon className="w-3.5 h-3.5" />
                                    SQL WORKBENCH
                                </button>
                            </div>
                            <div className="flex-1 min-h-0 bg-background/50 bottom-panel">
                                {bottomPanelView === 'console' ? (
                                    <Console
                                        output={consoleOutput}
                                        isLoading={isLoading}
                                        onClear={() => setConsoleOutput({ type: OutputType.Info, message: '' })}
                                    />
                                ) : bottomPanelView === 'terminal' ? (
                                    <Terminal />
                                ) : (
                                    <SqlWorkbench 
                                        savedBuffer={sqlBufferB64 ? new Uint8Array(atob(sqlBufferB64).split("").map((c: string) => c.charCodeAt(0))) : undefined}
                                        onSaveDB={(buffer: Uint8Array) => setSqlBufferB64(btoa(String.fromCharCode(...Array.from(buffer))))}
                                    />
                                )}
                            </div>
                        </div>
                    </Panel>
                </PanelGroup>
            </Panel>
         </PanelGroup>
      </main>
      <Toast isVisible={toast.visible} message={toast.message} />
      <VoiceAssistant 
        isActive={isVoiceActive} 
        onToggle={() => setIsVoiceActive(!isVoiceActive)} 
        onCommand={handleVoiceCommand}
      />
      <AmbientSound type={ambientSound} />
      {isFocusMode && (
        <div className="fixed inset-0 pointer-events-none z-[99] bg-background/20 backdrop-blur-sm" />
      )}
      <CodeSnapshot 
        isOpen={isSnapshotOpen}
        onClose={() => setIsSnapshotOpen(false)}
        code={spotlightSelection?.text || currentContent}
        fileName={activeFile?.name || 'snippet.txt'}
        language={activeFile ? getLanguageFromExtension(activeFile.name) : 'plaintext'}
      />
      <TypingAudio enabled={audioEnabled} type={switchType} trigger={typeTrigger} />
      
      {/* Magic AI Orb */}
      <button 
        onClick={() => setActiveView('ai')}
        className="fixed bottom-8 right-8 z-[200] group"
        title="Ask Nanba AI"
      >
        <div className="absolute inset-0 bg-primary/40 rounded-full blur-2xl group-hover:bg-primary/60 transition-all animate-pulse" />
        <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center shadow-2xl border border-white/20 transition-transform group-hover:scale-110 active:scale-90">
             <div className="absolute inset-0 bg-white/20 rounded-full animate-ripple" />
             <SparklesIcon className="w-8 h-8 text-white animate-float" />
        </div>
      </button>
    </div>
  );
};


// --- App Component ---

function App() {
  const [customThemes, setCustomThemes] = useLocalStorage<CustomTheme[]>('nanba-custom-themes', []);
  const [activeThemeId, setActiveThemeId] = useLocalStorage<string>('nanba-active-theme', 'dark');
  const [fontSize, setFontSize] = useLocalStorage<number>('nanba-font-size', 14);
  const [workspaces, setWorkspaces] = useLocalStorage<CodeFolder[]>('nanba-workspaces', []);
  const [activeWorkspaceId, setActiveWorkspaceId] = useLocalStorage<string | null>('nanba-active-workspace', null);
  
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        handleInitialCloudFetch();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (_event === 'SIGNED_IN') {
        handleInitialCloudFetch();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleInitialCloudFetch = async () => {
    const cloudWorkspaces = await fetchWorkspacesFromCloud();
    if (cloudWorkspaces.length > 0) {
      setWorkspaces(cloudWorkspaces);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // FIX: Explicitly type `builtInThemes` to ensure correct type inference when combined with `customThemes`.
  const builtInThemes: ({ id: 'light' | 'dark'; name: string; monacoTheme: MonacoTheme; })[] = [
    { id: 'light', name: 'Default Light', monacoTheme: 'vs-light' },
    { id: 'dark', name: 'Default Dark', monacoTheme: 'vs-dark' },
  ];

  const allThemes = [...builtInThemes, ...customThemes];
  const activeTheme = allThemes.find(t => t.id === activeThemeId) || builtInThemes[1];

  useEffect(() => {
    const root = document.documentElement;
    // Clear previous custom styles
    root.style.cssText = '';
    
    if (activeThemeId === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const customTheme = customThemes.find(t => t.id === activeThemeId);
    if (customTheme) {
      Object.entries(customTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, hexToRgb(value));
      });
      if(customTheme.monacoTheme === 'vs-dark') {
          root.classList.add('dark');
      }
    }
  }, [activeThemeId, customThemes]);

  const handleSaveTheme = (theme: CustomTheme) => {
    setCustomThemes(prev => {
        const isEditing = !!theme.id;
        if (isEditing) {
            return prev.map(t => t.id === theme.id ? theme : t);
        }
        return [...prev, { ...theme, id: generateId() }];
    });
  };

  const handleDeleteTheme = (id: string) => {
     if (window.confirm(`Are you sure you want to delete this theme?`)) {
        if(activeThemeId === id) {
            setActiveThemeId('dark');
        }
        setCustomThemes(prev => prev.filter(t => t.id !== id));
    }
  }

  const activeWorkspace = workspaces.find(ws => ws.id === activeWorkspaceId) || null;

  const handleCreateWorkspace = (name: string) => {
    const newWorkspace: CodeFolder = { id: generateId(), name, type: 'folder', children: [] };
    const updatedWorkspaces = [...workspaces, newWorkspace];
    setWorkspaces(updatedWorkspaces);
    setActiveWorkspaceId(newWorkspace.id);
  };

  const handleDeleteWorkspace = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the workspace "${name}" and all its contents? This cannot be undone.`)) {
        setWorkspaces(prev => prev.filter(ws => ws.id !== id));
        if (activeWorkspaceId === id) {
            setActiveWorkspaceId(null);
        }
        window.localStorage.removeItem(`nanba-file-contents-${id}`);
        window.localStorage.removeItem(`nanba-snippets-${id}`);
    }
  };

  const handleUpdateWorkspace = (updatedWorkspace: CodeFolder) => {
    setWorkspaces(prev => prev.map(ws => ws.id === updatedWorkspace.id ? updatedWorkspace : ws));
  };
  
  if (!activeWorkspace) {
    return (
      <>
        <WorkspaceSelector
            workspaces={workspaces}
            onSelect={setActiveWorkspaceId}
            onCreate={handleCreateWorkspace}
            onDelete={handleDeleteWorkspace}
        />
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {}}
        />
      </>
    );
  }

  return (
    <>
      <WorkspaceLayout
        key={activeWorkspace.id}
        workspace={activeWorkspace}
        activeTheme={{id: activeTheme.id, monacoTheme: activeTheme.monacoTheme}}
        themes={allThemes}
        onSelectTheme={setActiveThemeId}
        customThemes={customThemes}
        onSaveTheme={handleSaveTheme}
        onDeleteTheme={handleDeleteTheme}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        onCloseWorkspace={() => setActiveWorkspaceId(null)}
        onUpdateWorkspace={handleUpdateWorkspace}
        user={user}
        onLogin={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />
    </>
  );
}

export default App;
