
export enum CellType {
  MARKDOWN = 'markdown',
  PROMPT = 'prompt',
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  content?: string;
  icon?: string;
}

export interface NotebookCell {
  id: string;
  type: CellType;
  content: string; // This acts as the "current" message input
  output?: string; // This acts as the "current" streaming response
  history: ChatMessage[]; // The recorded conversation
  isExecuting?: boolean;
  isLoadingContext?: boolean;
  selectedFileIds: string[];
  loadedFileIds: string[];
}

export interface NotebookState {
  cells: NotebookCell[];
  folderId: string;
  folderName: string;
  files: DriveFile[];
  isFetchingFiles: boolean;
  isConnected: boolean;
  isInitializing: boolean;
}
