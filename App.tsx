
import React, { useState } from 'react';
import { 
  CellType, 
  NotebookCell, 
  NotebookState 
} from './types';
import { geminiService } from './services/geminiService';
import { driveService } from './services/driveService';
import { 
  Sidebar, 
  Notebook, 
  Header 
} from './components/Layout';
import { LayoutIcon } from 'lucide-react';

function App() {
  const [state, setState] = useState<NotebookState>({
    cells: [
      { 
        id: '2', 
        type: CellType.PROMPT, 
        content: '', 
        history: [],
        selectedFileIds: [],
        loadedFileIds: []
      }
    ],
    folderId: '18BC83uHgViAm-R16s-JDjbZEaIccU6Y4',
    folderName: '',
    files: [],
    isFetchingFiles: false,
    isConnected: false,
    isInitializing: false
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleInitialize = async () => {
    setState(prev => ({ ...prev, isInitializing: true }));
    try {
      driveService.updateFolderId(state.folderId);
      const name = await driveService.initialize();
      setState(prev => ({ ...prev, isInitializing: false, isConnected: true, folderName: name }));
    } catch (error) {
      alert("Connection failed. Please ensure the Folder ID is correct and accessible.");
      setState(prev => ({ ...prev, isInitializing: false }));
    }
  };

  const fetchDriveFiles = async () => {
    setState(prev => ({ ...prev, isFetchingFiles: true }));
    try {
      const name = await driveService.getFolderName();
      const files = await driveService.fetchFiles();
      setState(prev => ({ ...prev, files, isFetchingFiles: false, folderName: name }));
    } catch (error) {
      alert("Failed to fetch files from Drive.");
      setState(prev => ({ ...prev, isFetchingFiles: false }));
    }
  };

  const handleFolderIdChange = (id: string) => {
    setState(prev => ({ ...prev, folderId: id, isConnected: false, files: [], folderName: '' }));
  };

  const addCell = (type: CellType) => {
    const newCell: NotebookCell = {
      id: Date.now().toString(),
      type,
      content: '',
      history: [],
      selectedFileIds: [],
      loadedFileIds: []
    };
    setState(prev => ({ ...prev, cells: [...prev.cells, newCell] }));
  };

  const updateCell = (id: string, updates: Partial<NotebookCell>) => {
    setState(prev => ({
      ...prev,
      cells: prev.cells.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  const removeCell = (id: string) => {
    setState(prev => ({
      ...prev,
      cells: prev.cells.filter(c => c.id !== id)
    }));
  };

  const loadCellContext = async (id: string) => {
    const cell = state.cells.find(c => c.id === id);
    if (!cell || cell.selectedFileIds.length === 0) return;

    updateCell(id, { isLoadingContext: true });

    try {
      const selectedMetadata = state.files.filter(f => cell.selectedFileIds.includes(f.id));
      const fetchedFiles = await Promise.all(
        selectedMetadata.map(async (f) => {
          const content = await driveService.getFileContent(f.id, f.mimeType);
          return { ...f, content };
        })
      );
      
      setState(prev => ({
        ...prev,
        files: prev.files.map(f => {
          const match = fetchedFiles.find(ff => ff.id === f.id);
          return match ? match : f;
        })
      }));

      updateCell(id, { 
        isLoadingContext: false, 
        loadedFileIds: cell.selectedFileIds 
      });
    } catch (error) {
      console.error("Context load error:", error);
      updateCell(id, { isLoadingContext: false });
      alert("Failed to load file contents.");
    }
  };

  const executeCell = async (id: string) => {
    const cell = state.cells.find(c => c.id === id);
    if (!cell || cell.type !== CellType.PROMPT || !cell.content.trim()) return;

    if (cell.loadedFileIds.length === 0 && cell.selectedFileIds.length > 0) {
      await loadCellContext(id);
    }

    const userPrompt = cell.content;
    updateCell(id, { isExecuting: true, output: '', content: '' });

    const contextFiles = state.files.filter(f => cell.loadedFileIds.includes(f.id));
    
    let accumulatedOutput = "";
    await geminiService.runPromptStream(
      userPrompt,
      contextFiles,
      cell.history,
      (chunk) => {
        accumulatedOutput += chunk;
        updateCell(id, { output: accumulatedOutput });
      }
    );

    updateCell(id, { 
      isExecuting: false,
      history: [
        ...cell.history,
        { role: 'user', content: userPrompt },
        { role: 'model', content: accumulatedOutput }
      ],
      output: '' 
    });
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans">
      <Sidebar 
        isOpen={isSidebarOpen}
        files={state.files}
        isFetching={state.isFetchingFiles}
        isConnected={state.isConnected}
        isInitializing={state.isInitializing}
        onInitialize={handleInitialize}
        onRefresh={fetchDriveFiles}
        folderId={state.folderId}
        onFolderIdChange={handleFolderIdChange}
        folderName={state.folderName}
      />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <Header 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          folderName={state.folderName}
        />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-6 pb-24">
          {!state.isConnected ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                <div className="relative p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
                  <LayoutIcon className="w-16 h-16 text-blue-500 mx-auto" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">Drive Connection Required</h3>
                <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Enter your Google Drive Folder ID in the sidebar and connect to begin your session.
                </p>
              </div>
              <button 
                onClick={handleInitialize}
                disabled={!state.folderId}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-full font-semibold transition-all shadow-xl active:scale-95 flex items-center gap-2"
              >
                {state.isInitializing ? 'Connecting...' : 'Connect to Folder'}
              </button>
            </div>
          ) : (
            <Notebook 
              cells={state.cells}
              files={state.files}
              onUpdateCell={updateCell}
              onRemoveCell={removeCell}
              onExecuteCell={executeCell}
              onAddCell={addCell}
              onLoadContext={loadCellContext}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
