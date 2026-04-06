
import React, { useState, useEffect, useRef } from 'react';
import { initDatabase, runQuery, exportDatabase, QueryResult, getTableNames, clearDatabase } from '../utils/sqlEngine';
import PlayIcon from './icons/PlayIcon';
import TrashIcon from './icons/TrashIcon';
import SparklesIcon from './icons/SparklesIcon';
import FolderIcon from './icons/FolderIcon';

interface SqlWorkbenchProps {
  onSaveDB: (buffer: Uint8Array) => void;
  savedBuffer?: Uint8Array;
}

const SqlWorkbench: React.FC<SqlWorkbenchProps> = ({ onSaveDB, savedBuffer }) => {
  const [query, setQuery] = useState('SELECT * FROM products;');
  const [results, setResults] = useState<QueryResult[] | string | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      await initDatabase(savedBuffer);
      setTables(getTableNames());
      setIsInitializing(false);
    };
    init();
  }, [savedBuffer]);

  const handleRun = () => {
    const res = runQuery(query);
    setResults(res);
    setTables(getTableNames());
    // Auto-save on run
    onSaveDB(exportDatabase());
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the entire database?")) {
      clearDatabase();
      setTables(getTableNames());
      setResults(null);
      onSaveDB(exportDatabase());
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-surface/50 overflow-hidden">
      {isInitializing ? (
        <div className="flex-1 flex items-center justify-center p-8 text-text-secondary animate-pulse">
           <div className="w-6 h-6 border-2 border-t-transparent border-primary rounded-full animate-spin mr-3"></div>
           <span className="text-sm font-bold tracking-widest uppercase">Initializing SQL Engine...</span>
        </div>
      ) : (
        <div className="flex-1 flex min-h-0">
          
          {/* Schema Browser Side */}
          <div className="w-48 border-r border-border flex flex-col pt-2 bg-background/20 hidden sm:flex">
            <h3 className="px-3 text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 flex items-center gap-2">
              <FolderIcon className="w-3.5 h-3.5 opacity-50" />
              TABLES
            </h3>
            <div className="flex-1 overflow-y-auto px-2 space-y-1">
              {tables.map(t => (
                <button 
                  key={t}
                  onClick={() => setQuery(`SELECT * FROM ${t};`)}
                  className="w-full text-left px-2 py-1.5 text-xs text-text hover:bg-primary/10 hover:text-primary rounded transition-colors truncate font-mono"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0">
             {/* Query Editor Area */}
             <div className="h-1/3 border-b border-border flex flex-col">
                <div className="flex items-center justify-between p-2 bg-background/30 px-4">
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black text-text uppercase tracking-widest">Query Editor</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleClear}
                      className="p-1 px-3 text-[10px] font-bold text-red-500 hover:bg-red-500/10 rounded-md transition-all border border-red-500/20"
                    >
                      CLEAR DB
                    </button>
                    <button 
                      onClick={handleRun}
                      className="p-1 px-4 text-[10px] font-bold text-white bg-primary hover:bg-primary-hover rounded-md transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                      <PlayIcon className="w-3 h-3" />
                      RUN
                    </button>
                  </div>
                </div>
                <textarea 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-grow p-4 bg-transparent text-text font-mono text-sm outline-none resize-none placeholder:text-text-secondary/30"
                  spellCheck={false}
                  placeholder="Type your SQL query here e.g., SELECT * FROM products WHERE price > 200;"
                />
             </div>

             {/* Results Area */}
             <div className="flex-grow overflow-auto p-4 custom-scrollbar">
                {!results ? (
                  <div className="h-full flex items-center justify-center text-text-secondary opacity-40 italic text-sm">
                    No results to display. Type a query and hit 'RUN'! 🦾
                  </div>
                ) : typeof results === 'string' ? (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 font-mono text-xs mb-4">
                    <p className="font-bold mb-1 uppercase tracking-widest text-[9px]">Query Error:</p>
                    {results}
                  </div>
                ) : results.length === 0 ? (
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary font-mono text-xs mb-4">
                        Query executed successfully. (0 rows returned)
                    </div>
                ) : (
                  <div className="space-y-6">
                    {results.map((res, i) => (
                      <div key={i} className="overflow-x-auto rounded-xl border border-white/5 bg-black/10 shadow-inner">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-white/5 border-b border-white/10 uppercase tracking-tighter text-[10px] font-black text-primary">
                              {res.columns.map(col => (
                                <th key={col} className="px-4 py-2 font-bold">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {res.values.map((row, j) => (
                              <tr key={j} className="hover:bg-white/5 transition-colors">
                                {row.map((val, k) => (
                                  <td key={k} className="px-4 py-2 text-xs text-text-secondary font-mono">{val?.toString() || 'NULL'}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default SqlWorkbench;
