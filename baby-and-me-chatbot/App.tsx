import React, { useState, useEffect, useRef } from 'react';
import { Author, ChatMessage as ChatMessageType, ToolOutput } from './types';
import ChatInput from './components/ChatInput';
import ChatMessage from './components/ChatMessage';
import { sendMessageToFastAPI, ChatResponse } from './services/fastapiService';

const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadId] = useState<string>(() => crypto.randomUUID());
  const [hasStartedChatting, setHasStartedChatting] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChatHistory([
      { author: Author.BOT, content: "হাই! আমি Baby and Me বট 🥰 আপনার দিনটি সহজ করতে সাহায্য করবো। ❤️" }
    ]);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleSendMessage = async (prompt: string) => {
    if (isLoading) return;

    // Set chatting started flag after first user message
    if (!hasStartedChatting) {
      setHasStartedChatting(true);
    }

    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessageType = { author: Author.USER, content: prompt };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);

    try {
      const botMessagePlaceholder: ChatMessageType = { author: Author.BOT, content: '', toolOutputs: [] };
      setChatHistory(prev => [...prev, botMessagePlaceholder]);

      let fullResponse = '';
      let currentToolOutputs: ToolOutput[] = [];
      let currentStatus = '';

      await sendMessageToFastAPI(prompt, threadId, (chunk: ChatResponse) => {
        if (chunk.type === 'thinking') {
          currentStatus = 'Thinking...';
          setChatHistory(prev => {
            const updatedHistory = [...prev];
            const lastMessage = updatedHistory[updatedHistory.length - 1];
            if (lastMessage && lastMessage.author === Author.BOT) {
              updatedHistory[updatedHistory.length - 1] = {
                ...lastMessage,
                content: currentStatus,
                type: 'thinking'
              };
            }
            return updatedHistory;
          });
        } else if (chunk.type === 'tool_start') {
          currentStatus = 'Calling tools...';
          setChatHistory(prev => {
            const updatedHistory = [...prev];
            const lastMessage = updatedHistory[updatedHistory.length - 1];
            if (lastMessage && lastMessage.author === Author.BOT) {
              updatedHistory[updatedHistory.length - 1] = {
                ...lastMessage,
                content: currentStatus,
                type: 'tool_start'
              };
            }
            return updatedHistory;
          });
        } else if (chunk.type === 'tool_end') {
          currentStatus = 'Processing results...';
          
          // Add tool output to the collection
          if (chunk.content && chunk.content !== 'Agent has finished calling the tool.') {
            const toolOutput: ToolOutput = {
              id: crypto.randomUUID(),
              content: chunk.content,
              timestamp: new Date()
            };
            currentToolOutputs = [...currentToolOutputs, toolOutput];
          }
          
          setChatHistory(prev => {
            const updatedHistory = [...prev];
            const lastMessage = updatedHistory[updatedHistory.length - 1];
            if (lastMessage && lastMessage.author === Author.BOT) {
              updatedHistory[updatedHistory.length - 1] = {
                ...lastMessage,
                content: currentStatus,
                type: 'tool_end',
                toolOutputs: currentToolOutputs
              };
            }
            return updatedHistory;
          });
        } else if (chunk.type === 'stream') {
          // Update the bot message with streamed content
          fullResponse += chunk.content;
          setChatHistory(prev => {
            const updatedHistory = [...prev];
            const lastMessage = updatedHistory[updatedHistory.length - 1];
            if (lastMessage && lastMessage.author === Author.BOT) {
              updatedHistory[updatedHistory.length - 1] = {
                ...lastMessage,
                content: fullResponse,
                type: 'stream',
                toolOutputs: currentToolOutputs
              };
            }
            return updatedHistory;
          });
        }
      });

    } catch (e: any) {
      console.error("Streaming failed:", e);
      const errorMessage = "Sorry, something went wrong. Please try again.";
      setError(errorMessage);
      setChatHistory(prev => {
        const updatedHistory = [...prev];
        updatedHistory[updatedHistory.length - 1] = { author: Author.BOT, content: errorMessage };
        return updatedHistory;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen h-[100dvh] bg-gradient-to-br from-rose-50 to-pink-100 text-gray-800 font-bengali overflow-hidden">
      {/* Experimental Banner - hide after first message */}
      {!hasStartedChatting && (
        <div className="bg-gradient-to-r from-rose-400 to-pink-400 text-white text-center py-2 px-4 font-medium shadow-sm animate-fade-in flex-shrink-0">
          ⚠️ This system is currently experimental, expect delay in first response. We are sorry for the inconvenience.
        </div>
      )}
      
      <header className={`bg-gradient-to-r from-rose-100 to-pink-100 border-b border-rose-200 shadow-sm transition-all duration-500 ease-out flex-shrink-0 ${
        hasStartedChatting ? 'p-2' : 'p-4'
      }`}>
        <h1 className={`font-bold text-center bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent transition-all duration-500 ease-out ${
          hasStartedChatting ? 'text-xl' : 'text-3xl'
        }`}>
          Baby and Me
        </h1>
      </header>

      <main ref={chatContainerRef} className="flex-1 overflow-y-auto bg-gradient-to-br from-rose-50 to-pink-100 pb-2">
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          {chatHistory.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg}
              isStreaming={isLoading && index === chatHistory.length - 1 && msg.author === Author.BOT}
            />
          ))}
          {error && !isLoading && (
            <div className="flex justify-center p-4">
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg relative max-w-md shadow-sm" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 flex-shrink-0 safe-area-inset-bottom">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        <div className="text-center text-[10px] text-gray-500 py-1">
        This chatbot is a component of a thesis research project and provides information based on a curated dataset of medical literature. It is intended for informational and educational purposes only.
        </div>
      </footer>
    </div>
  );
};

export default App;