
export enum Author {
  USER = 'user',
  BOT = 'bot',
  SYSTEM = 'system',
}

export interface ChatMessage {
  author: Author;
  content: string;
  type?: 'thinking' | 'tool_start' | 'tool_end' | 'stream';
  toolOutputs?: ToolOutput[];
}

export interface ToolOutput {
  id: string;
  content: string;
  timestamp: Date;
}
