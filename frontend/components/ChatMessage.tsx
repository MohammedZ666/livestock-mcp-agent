import React from 'react';
import { Author, ChatMessage as ChatMessageType } from '../types';
import { BotIcon, UserIcon } from './icons';
import ToolOutputs from './ToolOutputs';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

const formatContent = (content: string) => {
  // Handle code blocks first to avoid processing markdown inside them
  const codeBlockParts = content.split(/```([\s\S]*?)```/g);
  
  return codeBlockParts.map((part, index) => {
    if (index % 2 === 1) {
      // This is a code block
      const lines = part.split('\n');
      const language = lines[0]?.trim() || '';
      const code = lines.slice(1).join('\n').trim();
      
      return (
        <pre key={index} className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 p-4 rounded-lg my-3 overflow-x-auto border border-gray-300 shadow-sm">
          <code className="text-sm font-mono">{code}</code>
        </pre>
      );
    }
    
    // Process regular markdown content
    return <div key={index} dangerouslySetInnerHTML={{ __html: processMarkdown(part) }} />;
  });
};

const processMarkdown = (text: string): string => {
  let html = text;
  
  // Handle tables with a more comprehensive approach
  html = processMarkdownTables(html);
  
  // Handle headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2 font-bengali">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-gray-800 mt-5 mb-3 font-bengali">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-gray-800 mt-6 mb-4 font-bengali">$1</h1>');
  
  // Handle lists
  html = html.replace(/^\* (.+)$/gm, '<li class="ml-4 mb-1 text-gray-800 font-bengali">• $1</li>');
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 mb-1 text-gray-800 font-bengali">• $1</li>');
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 mb-1 text-gray-800 font-bengali list-decimal">$1</li>');
  
  // Wrap consecutive list items
  html = html.replace(/((<li[^>]*>.*?<\/li>\s*)+)/g, '<ul class="my-2 space-y-1">$1</ul>');
  
  // Handle inline formatting
  html = processInlineMarkdown(html);
  
  // Handle line breaks
  html = html.replace(/\n\n/g, '</p><p class="mb-3 text-gray-800 font-bengali">');
  html = html.replace(/\n/g, '<br />');
  
  // Wrap in paragraph if not already wrapped
  if (!html.includes('<p>') && !html.includes('<table>') && !html.includes('<h1>') && !html.includes('<h2>') && !html.includes('<h3>') && !html.includes('<ul>')) {
    html = `<p class="mb-3 text-gray-800 font-bengali">${html}</p>`;
  } else if (html.includes('</p><p')) {
    html = `<p class="mb-3 text-gray-800 font-bengali">${html}</p>`;
  }
  
  return html;
};

const processMarkdownTables = (text: string): string => {
  const lines = text.split('\n');
  const result: string[] = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Check if this line looks like a table row
    if (line.includes('|') && line.startsWith('|') && line.endsWith('|')) {
      // Look ahead to see if next line is a separator
      const nextLine = lines[i + 1];
      if (nextLine && (nextLine.includes('-') || nextLine.includes('='))) {
        // This is likely a table - collect all table lines
        const tableLines: string[] = [];
        
        // Add header
        tableLines.push(line);
        i++; // Skip separator line
        i++; // Move to first data row
        
        // Collect data rows
        while (i < lines.length && lines[i].trim().includes('|') && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }
        
        // Convert to HTML table
        if (tableLines.length > 0) {
          const tableHtml = convertLinesToTable(tableLines);
          result.push(tableHtml);
        }
        continue;
      }
    }
    
    result.push(lines[i]);
    i++;
  }
  
  return result.join('\n');
};

const convertLinesToTable = (tableLines: string[]): string => {
  if (tableLines.length === 0) return '';
  
  const parseRow = (line: string): string[] => {
    return line.split('|')
      .map(cell => cell.trim())
      .filter(cell => cell !== '');
  };
  
  const headerCells = parseRow(tableLines[0]);
  const bodyRows = tableLines.slice(1).map(parseRow);
  
  let tableHtml = '<div class="my-4 overflow-x-auto"><table class="min-w-full border border-rose-200 rounded-lg overflow-hidden shadow-sm bg-white">';
  
  // Header
  if (headerCells.length > 0) {
    tableHtml += '<thead class="bg-gradient-to-r from-rose-100 to-pink-100">';
    tableHtml += '<tr>';
    headerCells.forEach((cell: string) => {
      tableHtml += `<th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-rose-200 font-bengali">${processInlineMarkdown(cell)}</th>`;
    });
    tableHtml += '</tr></thead>';
  }
  
  // Body
  if (bodyRows.length > 0) {
    tableHtml += '<tbody>';
    bodyRows.forEach((row: string[], rowIndex: number) => {
      if (row.length > 0) {
        const bgClass = rowIndex % 2 === 0 ? 'bg-white' : 'bg-rose-25';
        tableHtml += `<tr class="${bgClass} hover:bg-rose-50 transition-colors">`;
        row.forEach((cell: string) => {
          tableHtml += `<td class="px-4 py-3 text-sm text-gray-800 border-b border-rose-100 font-bengali">${processInlineMarkdown(cell)}</td>`;
        });
        tableHtml += '</tr>';
      }
    });
    tableHtml += '</tbody>';
  }
  
  tableHtml += '</table></div>';
  
  return tableHtml;
};

const processInlineMarkdown = (text: string): string => {
  let html = text;
  
  // Bold: **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
  
  // Italic: *text* -> <em>text</em>
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>');
  
  // Inline code: `text` -> <code>text</code>
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
  
  return html;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming }) => {
  const isBot = message.author === Author.BOT;

  const wrapperClasses = `flex items-start gap-4 my-6 px-4`;
  const messageClasses = `max-w-2xl px-5 py-4 rounded-2xl shadow-lg border font-bengali ${isBot
      ? 'bg-gradient-to-br from-white to-rose-50 text-gray-800 rounded-tl-md border-rose-200'
      : 'bg-gradient-to-br from-pink-200 to-rose-200 text-gray-800 rounded-tr-md ml-auto border-pink-300'
    }`;

  const Icon = isBot ? BotIcon : UserIcon;

  // Render status content for bot messages
  const renderContent = () => {
    if (isBot && message.type && message.type !== 'stream') {
      return (
        <div className="flex items-center gap-3 text-gray-600 animate-fade-in">
          {message.type === 'thinking' && (
            <>
              <div className="relative">
                <div className="w-3 h-3 bg-rose-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-rose-400 rounded-full animate-ping opacity-30"></div>
              </div>
              <span className="animate-typing">{message.content}</span>
              <div className="flex space-x-1 animate-bounce">
                <div className="w-1 h-1 bg-rose-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-1 h-1 bg-rose-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-1 h-1 bg-rose-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </>
          )}
          {message.type === 'tool_start' && (
            <>
              <div className="relative">
                <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-30"></div>
              </div>
              <span className="animate-fade-in">{message.content}</span>
              <div className="animate-spin">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </>
          )}
          {message.type === 'tool_end' && (
            <>
              <div className="relative">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-30"></div>
              </div>
              <span className="animate-fade-in">{message.content}</span>
              <div className="animate-bounce">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            </>
          )}
        </div>
      );
    }

    return (
      <>
        {formatContent(message.content)}
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-rose-400 animate-pulse ml-1 rounded-sm" />
        )}
      </>
    );
  };

  return (
    <div className={`${isBot ? wrapperClasses : `${wrapperClasses} flex-row-reverse`} animate-slide-up`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center relative transition-all duration-300 ease-out hover:scale-110 ${isBot ? 'bg-gradient-to-br from-rose-200 to-pink-200' : 'bg-gradient-to-br from-pink-300 to-rose-300'}`}>
        <Icon className={`w-6 h-6 transition-all duration-300 ease-out ${isBot ? 'text-rose-600' : 'text-white'}`} />
        {/* Tool usage indicator */}
        {isBot && message.toolOutputs && message.toolOutputs.length > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 border-2 border-white rounded-full flex items-center justify-center animate-bounce">
            <span className="text-[8px] font-bold text-white">🔧</span>
          </div>
        )}
      </div>
      <div className={`${messageClasses} animate-fade-in-scale`}>
        <div className="max-w-none">
          {renderContent()}
        </div>
        {/* Show tool outputs for bot messages */}
        {isBot && message.toolOutputs && message.toolOutputs.length > 0 && (
          <div className="animate-slide-down">
            <ToolOutputs toolOutputs={message.toolOutputs} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;