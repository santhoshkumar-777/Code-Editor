
import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { io, Socket } from 'socket.io-client';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  onClose?: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ onClose }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize XTerm
    const xterm = new XTerm({
      cursorBlink: true,
      theme: {
        background: '#0a0a0c',
        foreground: '#cccccc',
        cursor: '#primary',
        selectionBackground: '#264f78',
      },
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 13,
      allowProposedApi: true,
    });
    xtermRef.current = xterm;

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    xterm.open(terminalRef.current);
    
    // Slight delay to ensure the container is fully rendered before fitting
    setTimeout(() => {
        try {
            fitAddon.fit();
        } catch (e) {
            console.warn("Fit failed on init", e);
        }
    }, 100);

    // Connect to Socket.io
    const socket = io('http://localhost:3001', {
        reconnectionAttempts: 5,
        timeout: 5000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setStatus('connected');
      xterm.write('\r\n\x1b[32m● Connected to terminal backend\x1b[0m\r\n');
    });

    socket.on('disconnect', () => {
      setStatus('disconnected');
      xterm.write('\r\n\x1b[31m● Disconnected from terminal backend\x1b[0m\r\n');
    });

    socket.on('connect_error', () => {
        setStatus('disconnected');
    });

    socket.on('output', (data: string) => {
      xterm.write(data);
    });

    xterm.onData((data) => {
      if (socket.connected) {
        socket.emit('input', data);
      }
    });

    // Handle Resize
    const resizeObserver = new ResizeObserver(() => {
      if (terminalRef.current) {
        try {
            fitAddon.fit();
            socket.emit('resize', { cols: xterm.cols, rows: xterm.rows });
        } catch (e) {}
      }
    });
    resizeObserver.observe(terminalRef.current);

    return () => {
      socket.disconnect();
      xterm.dispose();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="h-full w-full bg-[#0a0a0c] flex flex-col relative group overflow-hidden">
      <div className="bg-surface/50 backdrop-blur-md px-4 py-2 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
            <div className="flex items-center gap-2 ml-4">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Terminal</span>
                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    status === 'connected' ? 'bg-emerald-500/10 text-emerald-500' : 
                    status === 'connecting' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                        status === 'connected' ? 'bg-emerald-500 animate-pulse' : 
                        status === 'connecting' ? 'bg-yellow-500 animate-bounce' : 'bg-red-500'
                    }`} />
                    {status}
                </span>
            </div>
        </div>
        {onClose && (
            <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors p-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        )}
      </div>
      
      <div ref={terminalRef} className="flex-1 w-full min-h-0 terminal-container bg-transparent p-2" />
      
      {!socketRef.current?.connected && status === 'disconnected' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10">
              <div className="text-center p-6 glass-card border-red-500/20 max-w-sm">
                  <p className="text-sm font-semibold text-text mb-2">Backend Disconnected</p>
                  <p className="text-xs text-text-secondary mb-4">The terminal server (port 3001) is not running or unreachable.</p>
                  <code className="block bg-black px-3 py-2 rounded text-[10px] text-primary mb-4">npm run server</code>
              </div>
          </div>
      )}

      <style>{`
        .terminal-container .xterm-viewport {
          overflow-y: auto !important;
          background: transparent !important;
        }
        .terminal-container .xterm-screen {
          padding: 4px;
        }
        .xterm-cursor-layer {
            z-index: 1;
        }
      `}</style>
    </div>
  );
};

export default Terminal;
