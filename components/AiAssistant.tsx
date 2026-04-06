import React, { useState, useRef, useEffect } from 'react';
import { getAiAssistantResponse } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import { FileSystemItem, CodeFile } from '../types';

interface AiAssistantProps {
  items: FileSystemItem[];
  fileContents: Record<string, string>;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ items, fileContents }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const getAllFiles = (items: FileSystemItem[]): CodeFile[] => {
    let files: CodeFile[] = [];
    items.forEach(item => {
      if (item.type === 'file') files.push(item);
      else if (item.type === 'folder') files.push(...getAllFiles(item.children));
    });
    return files;
  };

  const handleSend = async (overrideInput?: string) => {
    const userMessage = overrideInput || input.trim();
    if (!userMessage || isLoading) return;

    if (!overrideInput) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Prepare workspace context
      const allFiles = getAllFiles(items);
      const context = allFiles
        .map(file => `--- FILE: ${file.name} ---\n${fileContents[file.id] || ''}`)
        .join('\n\n');

      const response = await getAiAssistantResponse(userMessage, context);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please check your API key.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleSpotlight = (e: any) => {
      const { action, text } = e.detail;
      let prompt = '';
      if (action === 'explain') prompt = `Please explain this code snippet:\n\n\`\`\`\n${text}\n\`\`\``;
      else if (action === 'refactor') prompt = `Please refactor this code snippet for better performance and readability:\n\n\`\`\`\n${text}\n\`\`\``;
      else if (action === 'docs') prompt = `Please generate professional JSDoc/Docstring for this code:\n\n\`\`\`\n${text}\n\`\`\``;
      
      handleSend(prompt);
    };

    document.addEventListener('ai-spotlight-request', handleSpotlight);
    return () => document.removeEventListener('ai-spotlight-request', handleSpotlight);
  }, [items, fileContents]);

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <SparklesIcon className="w-5 h-5 text-primary" />
        <h2 className="font-bold text-text">Nanba AI Assistant</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-border">
        {messages.length === 0 && (
          <div className="text-center text-text-secondary mt-10 space-y-2">
            <SparklesIcon className="w-10 h-10 mx-auto opacity-20" />
            <p className="text-sm">Ask me anything about your project!</p>
            <p className="text-xs italic">"How do I add a new route?"</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-background border border-border text-text rounded-bl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-background border border-border p-3 rounded-lg rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border bg-background/50">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Type your message..."
            className="w-full bg-surface border border-border rounded-lg pl-4 pr-12 py-3 text-sm text-text focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none overflow-hidden"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-md transition-colors disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
