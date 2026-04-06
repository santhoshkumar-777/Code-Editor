export enum Language {
  JavaScript = 'javascript',
  HTML = 'html',
  CSS = 'css',
  Python = 'python',
  Java = 'java',
  C = 'c',
}

export enum OutputType {
  Stdout = 'stdout',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}

export interface ConsoleOutput {
  type: OutputType;
  message: string;
}

// FIX: Added missing type definitions for file system entities.
export interface CodeFile {
  id: string;
  name: string;
  type: 'file';
}

export interface CodeFolder {
  id: string;
  name: string;
  type: 'folder';
  children: FileSystemItem[];
}

export type FileSystemItem = CodeFile | CodeFolder;

export interface CodeSnippet {
  id:string;
  name: string; // The trigger phrase
  description: string;
  code: string;
  isDefault?: boolean;
}

export interface Command {
  id: string;
  name: string;
  shortcut?: string;
  action: () => void;
  disabled?: boolean;
}

export type MonacoTheme = 'vs-light' | 'vs-dark';

export interface CustomTheme {
  id: string;
  name: string;
  monacoTheme: MonacoTheme;
  colors: {
    primary: string;
    'primary-hover': string;
    background: string;
    surface: string;
    border: string;
    text: string;
    'text-secondary': string;
    handle: string;
  };
}

export interface EditorTab {
  fileId: string;
  isModified: boolean;
}
