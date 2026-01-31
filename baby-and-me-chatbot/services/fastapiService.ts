const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ChatResponse {
  type: 'thinking' | 'tool_start' | 'tool_end' | 'stream';
  content: string;
  toolOutput?: any;
}

export const sendMessageToFastAPI = async (
  message: string, 
  threadId: string,
  onChunk: (chunk: ChatResponse) => void
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: message,
      thread_id: threadId,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            // Parse tool output if it's JSON-like content
            if (data.type === 'tool_end' && data.content) {
              try {
                // Try to parse the content if it looks like JSON
                if (data.content.trim().startsWith('{') || data.content.trim().startsWith('[')) {
                  data.toolOutput = JSON.parse(data.content);
                }
              } catch {
                // Keep original content if parsing fails
              }
            }
            onChunk(data);
          } catch (e) {
            console.warn('Failed to parse SSE data:', line);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}; 