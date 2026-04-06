import React, { useState, useEffect, useRef } from 'react';
import { Command } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filteredCommands = commands.filter(command =>
    command.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const command = filteredCommands[selectedIndex];
        if (command && !command.disabled) {
          command.action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  useEffect(() => {
    // Scroll selected item into view
    if (listRef.current && selectedIndex >= 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLLIElement;
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface rounded-lg shadow-2xl border border-border flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-border">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
            }}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-text placeholder-text-secondary text-lg outline-none"
          />
        </div>
        <ul ref={listRef} className="max-h-[400px] overflow-y-auto p-2">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, index) => (
              <li
                key={command.id}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => {
                  if (!command.disabled) {
                    command.action();
                    onClose();
                  }
                }}
                className={`p-3 rounded-md flex justify-between items-center cursor-pointer ${
                  index === selectedIndex ? 'bg-primary/20 text-primary' : ''
                } ${
                  command.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-border/50'
                }`}
              >
                <span className="text-text">{command.name}</span>
                {command.shortcut && (
                  <span className="text-xs bg-border px-2 py-1 rounded-md text-text-secondary">
                    {command.shortcut}
                  </span>
                )}
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-text-secondary">
              No results found.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CommandPalette;