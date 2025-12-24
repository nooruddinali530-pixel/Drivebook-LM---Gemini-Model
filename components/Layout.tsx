
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { DriveFile, NotebookCell, CellType } from '../types';
import { 
  PlusIcon, 
  PlayIcon, 
  TrashIcon, 
  FilesIcon, 
  RefreshCwIcon,
  LayoutIcon,
  CheckCircle2Icon,
  CloudIcon,
  DownloadIcon,
  ZapIcon,
  LayersIcon,
  DatabaseIcon,
  MessageSquareIcon,
  UserIcon,
  BotIcon,
  RotateCcwIcon,
  SendIcon,
  FolderOpenIcon,
  Edit2Icon
} from 'lucide-react';

// --- SIDEBAR ---
interface SidebarProps {
  isOpen: boolean;
  files: DriveFile[];
  isFetching: boolean;
  isConnected: boolean;
  isInitializing: boolean;
  onInitialize: () => void;
  onRefresh: () => void;
  folderId: string;
  onFolderIdChange: (id: string) => void;
  folderName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, files, isFetching, isConnected, isInitializing, onInitialize, onRefresh, folderId, onFolderIdChange, folderName 
}) => {
  const [isEditingFolder, setIsEditingFolder] = useState(false);

  if (!isOpen) return null;
  return (
    <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 animate-in slide-in-from-left duration-300">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilesIcon className="w-5 h-5 text-blue-400" />
          <h2 className="font-semibold text-sm">Drive Repository</h2>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Configuration</div>
            {!isEditingFolder && (
               <button onClick={() => setIsEditingFolder(true)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
                 <Edit2Icon className="w-3 h-3" />
               </button>
            )}
          </div>
          
          {isEditingFolder ? (
            <div className="space-y-2">
              <input 
                type="text" 
                value={folderId}
                onChange={(e) => onFolderIdChange(e.target.value)}
                onBlur={() => setIsEditingFolder(false)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-blue-500 transition-colors"
                placeholder="Folder ID..."
                autoFocus
              />
              <button 
                onClick={() => { setIsEditingFolder(false); onInitialize(); }}
                className="w-full py-2 bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-600/30 transition-all"
              >
                Apply & Connect
              </button>
            </div>
          ) : (
            <div className="space-y-1 group cursor-pointer" onClick={() => setIsEditingFolder(true)}>
              <div className="text-[11px] font-mono text-blue-400 break-all truncate">{folderId}</div>
              {folderName && (
                <div className="flex items-center gap-1.5 text-slate-300">
                   <FolderOpenIcon className="w-3 h-3 text-indigo-400" />
                   <span className="text-[11px] font-bold truncate">{folderName}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {!isConnected ? (
          <button onClick={onInitialize} disabled={isInitializing || !folderId} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95">
            {isInitializing ? <RefreshCwIcon className="w-4 h-4 animate-spin" /> : <CloudIcon className="w-4 h-4" />}
            {isInitializing ? "CONNECTING..." : "CONNECT FOLDER"}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shadow-sm">
              <CheckCircle2Icon className="w-5 h-5 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-tight leading-none">Connected</span>
                <span className="text-[9px] text-emerald-500/60 font-medium truncate max-w-[180px]">{folderName}</span>
              </div>
            </div>
            <button onClick={onRefresh} disabled={isFetching} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition-all active:scale-95">
              {isFetching ? <RefreshCwIcon className="w-4 h-4 animate-spin" /> : <DownloadIcon className="w-4 h-4" />}
              {isFetching ? "SYNCING..." : "FETCH FILES"}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-4 space-y-1.5 mt-2">
        {isConnected && files.map(file => (
          <div key={file.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/80 group transition-all duration-200 border border-transparent hover:border-slate-700/50">
            <span className="text-xl group-hover:scale-110 transition-transform">{file.icon || '📄'}</span>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold truncate group-hover:text-blue-400 transition-colors">{file.name}</span>
              <span className="text-[9px] text-slate-500 truncate uppercase font-mono tracking-tighter">{file.mimeType.split('/').pop()?.replace('vnd.google-apps.', '')}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

// --- HEADER ---
interface HeaderProps {
  toggleSidebar: () => void;
  folderName: string;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, folderName }) => {
  return (
    <header className="h-16 bg-slate-900/50 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2.5 hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
          <LayoutIcon className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
             <LayersIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 leading-none">
              Drive <span className="text-blue-500">Notebook</span>
            </h1>
            {folderName && (
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 truncate max-w-[200px]">
                {folderName}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// --- NOTEBOOK ---
interface NotebookProps {
  cells: NotebookCell[];
  files: DriveFile[];
  onUpdateCell: (id: string, updates: Partial<NotebookCell>) => void;
  onRemoveCell: (id: string) => void;
  onExecuteCell: (id: string) => void;
  onAddCell: (type: CellType) => void;
  onLoadContext: (id: string) => void;
}

export const Notebook: React.FC<NotebookProps> = ({ 
  cells, files, onUpdateCell, onRemoveCell, onExecuteCell, onAddCell, onLoadContext
}) => {
  return (
    <div className="max-w-5xl mx-auto w-full space-y-12 pb-20">
      {cells.map((cell, index) => (
        <div key={cell.id} className="group relative">
          <div className={`bg-slate-900/40 rounded-[2.5rem] border ${cell.isExecuting ? 'border-blue-500 shadow-2xl shadow-blue-500/10' : 'border-slate-800'} transition-all duration-300 overflow-hidden backdrop-blur-sm`}>
            
            {/* Header */}
            <div className="px-8 py-5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-[0.2em] uppercase ${cell.type === CellType.PROMPT ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  {cell.type} [{index + 1}]
                </span>
                {cell.type === CellType.PROMPT && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                    <DatabaseIcon className="w-3.5 h-3.5" /> {cell.loadedFileIds.length} Context Files
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {cell.type === CellType.PROMPT && cell.history.length > 0 && (
                  <button onClick={() => onUpdateCell(cell.id, { history: [] })} className="p-2.5 text-slate-500 hover:text-amber-400 transition-all" title="Clear History">
                    <RotateCcwIcon className="w-5 h-5" />
                  </button>
                )}
                <button onClick={() => onRemoveCell(cell.id)} className="p-2.5 text-slate-600 hover:text-red-400 transition-all">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Context Manager */}
            {cell.type === CellType.PROMPT && (
              <div className="px-8 py-6 bg-slate-950/40 border-b border-slate-800/50">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <ZapIcon className="w-4 h-4 text-amber-500" />
                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Context Repository</h4>
                    </div>
                    {cell.selectedFileIds.length > 0 && (
                      <button onClick={() => onLoadContext(cell.id)} disabled={cell.isLoadingContext} className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                        {cell.isLoadingContext ? <RefreshCwIcon className="w-3 h-3 animate-spin" /> : <DownloadIcon className="w-3 h-3" />} Load Selected
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {files.map(f => {
                      const isSelected = cell.selectedFileIds.includes(f.id);
                      const isLoaded = cell.loadedFileIds.includes(f.id);
                      return (
                        <button key={f.id} onClick={() => onUpdateCell(cell.id, { selectedFileIds: isSelected ? cell.selectedFileIds.filter(id => id !== f.id) : [...cell.selectedFileIds, f.id] })} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${isSelected ? 'bg-indigo-600/10 border-indigo-500 text-indigo-100' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                          <span>{f.icon}</span> <span className="max-w-[120px] truncate">{f.name}</span>
                          {isLoaded && isSelected && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Thread */}
            {cell.type === CellType.PROMPT && (
              <div className="px-8 pt-8 space-y-8">
                {cell.history.map((msg, i) => (
                  <div key={i} className={`flex gap-5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0 mt-1 shadow-sm"><BotIcon className="w-4 h-4 text-blue-400" /></div>}
                    <div className={`max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-slate-800 text-slate-100 rounded-tr-none' : 'bg-slate-900/40 text-slate-300 border border-slate-800 rounded-tl-none'}`}>
                       <div className="prose prose-invert max-w-none prose-sm">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                       </div>
                    </div>
                    {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 mt-1"><UserIcon className="w-4 h-4 text-slate-400" /></div>}
                  </div>
                ))}
                
                {/* Current Streaming Output */}
                {cell.output && (
                  <div className="flex gap-5 animate-in fade-in duration-300">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0 mt-1"><BotIcon className="w-4 h-4 text-blue-400" /></div>
                    <div className="max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed bg-slate-900/40 text-blue-400 border border-blue-900/30 rounded-tl-none shadow-lg">
                       <div className="prose prose-invert max-w-none prose-sm text-blue-300">
                          <ReactMarkdown>{cell.output}</ReactMarkdown>
                       </div>
                    </div>
                  </div>
                )}
                
                {cell.isExecuting && !cell.output && (
                  <div className="flex gap-5 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center shrink-0 mt-1"><BotIcon className="w-4 h-4 text-blue-600/40" /></div>
                    <div className="h-12 w-24 bg-slate-800/40 rounded-2xl" />
                  </div>
                )}
              </div>
            )}

            {/* Input Area */}
            <div className={`p-8 ${cell.type === CellType.PROMPT ? 'mt-4 border-t border-slate-800/50' : ''}`}>
              <div className="relative">
                <textarea
                  value={cell.content}
                  onChange={(e) => onUpdateCell(cell.id, { content: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && cell.type === CellType.PROMPT) {
                      e.preventDefault();
                      onExecuteCell(cell.id);
                    }
                  }}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-5 outline-none resize-none code-font text-sm leading-relaxed focus:border-blue-500/50 transition-colors shadow-inner"
                  placeholder={cell.type === CellType.MARKDOWN ? "# Use Markdown to structure your notebook..." : "Chat with Gemini about your files..."}
                  style={{ minHeight: '100px' }}
                />
                {cell.type === CellType.PROMPT && (
                  <button 
                    onClick={() => onExecuteCell(cell.id)}
                    disabled={cell.isExecuting || !cell.content.trim()}
                    className="absolute bottom-4 right-4 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-30 transition-all shadow-lg active:scale-95 flex items-center justify-center"
                  >
                    {cell.isExecuting ? <RefreshCwIcon className="w-5 h-5 animate-spin" /> : <SendIcon className="w-5 h-5" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-center gap-6 py-10 relative">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-800/50 -z-10"></div>
        <button onClick={() => onAddCell(CellType.MARKDOWN)} className="flex items-center gap-2 px-8 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-200 hover:border-slate-700 transition-all shadow-xl bg-slate-950/80">
          <PlusIcon className="w-4 h-4" /> Add Markdown
        </button>
        <button onClick={() => onAddCell(CellType.PROMPT)} className="flex items-center gap-2 px-8 py-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-xs font-black uppercase tracking-widest text-blue-500 hover:bg-blue-600/20 hover:border-blue-500 transition-all shadow-xl bg-slate-950/80">
          <MessageSquareIcon className="w-4 h-4" /> Start New Chat
        </button>
      </div>
    </div>
  );
};
