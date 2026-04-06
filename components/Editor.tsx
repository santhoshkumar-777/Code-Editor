
import React, { useEffect, useRef } from 'react';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import { Language, CodeSnippet, MonacoTheme } from '../types';

interface EditorProps {
  content: string;
  onContentChange: (newContent: string) => void;
  language: Language;
  theme: MonacoTheme;
  fontSize: number;
  snippets: CodeSnippet[];
  onSelectionChange?: (selection: { text: string; x: number; y: number } | null) => void;
  onType?: () => void;
}

const languageMapping: Record<Language, string> = {
    [Language.JavaScript]: 'javascript',
    [Language.HTML]: 'html',
    [Language.CSS]: 'css',
    [Language.Python]: 'python',
    [Language.Java]: 'java',
    [Language.C]: 'c',
};

const Editor: React.FC<EditorProps> = ({ content, onContentChange, language, theme, fontSize, snippets, onSelectionChange, onType }) => {
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);
  const completionProviderRef = useRef<any>(null);

  useEffect(() => {
    if (monaco && snippets) {
      completionProviderRef.current?.dispose();
      completionProviderRef.current = monaco.languages.registerCompletionItemProvider(
        ['javascript', 'html', 'css', 'python', 'java', 'c'],
        {
          provideCompletionItems: (model, position) => {
            const suggestions = snippets.map(snippet => ({
              label: snippet.name,
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: snippet.description,
              insertText: snippet.code,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: model.getWordUntilPosition(position).startColumn,
                endColumn: model.getWordUntilPosition(position).endColumn,
              },
            }));
            return { suggestions: suggestions };
          },
        }
      );
    }
    return () => {
      completionProviderRef.current?.dispose();
    };
  }, [monaco, snippets]);
  
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    editor.onDidChangeCursorSelection((e: any) => {
      if (!onSelectionChange) return;

      const selection = editor.getSelection();
      const model = editor.getModel();

      if (selection && model && !selection.isEmpty()) {
        const text = model.getValueInRange(selection);
        
        // Get coordinates for the spotlight menu
        const endPosition = selection.getEndPosition();
        const coords = editor.getScrolledVisiblePosition(endPosition);
        const domNode = editor.getDomNode();

        if (coords && domNode) {
          const rect = domNode.getBoundingClientRect();
          onSelectionChange({
            text,
            x: rect.left + coords.left,
            y: rect.top + coords.top - 40 // Position above the cursor
          });
        }
      } else {
        onSelectionChange(null);
      }
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    onContentChange(value || '');
    if (onType) onType();
  };

  const editorOptions = {
    fontSize: fontSize,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    wordWrap: 'on' as const,
    padding: {
        top: 20,
        bottom: 20
    },
    smoothScrolling: true,
    cursorBlinking: 'smooth' as const,
    cursorSmoothCaretAnimation: 'on' as const,
    mouseWheelZoom: true,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  };

  return (
    <div className="flex-1 overflow-hidden h-full w-full bg-surface">
      <MonacoEditor
        height="100%"
        language={languageMapping[language]}
        value={content}
        theme={theme}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={editorOptions}
        loading={
          <div className="flex h-full w-full items-center justify-center text-text-secondary">
             <div className="w-6 h-6 border-2 border-t-transparent border-primary rounded-full animate-spin mr-2"></div>
             Loading Editor...
          </div>
        }
      />
    </div>
  );
};

export default Editor;