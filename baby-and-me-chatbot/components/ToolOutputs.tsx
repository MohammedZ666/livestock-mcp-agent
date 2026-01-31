import React, { useState } from 'react';
import { ToolOutput } from '../types';

interface ToolOutputsProps {
  toolOutputs: ToolOutput[];
}

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
  </svg>
);

const ToolIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path fillRule="evenodd" d="M12 6.75a5.25 5.25 0 016.775-5.025.75.75 0 01.313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.641l3.318-3.319a.75.75 0 011.248.313 5.25 5.25 0 01-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 112.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.25 5.25 0 0112 6.75zM4.117 19.125a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" clipRule="evenodd" />
  </svg>
);

const ToolOutputs: React.FC<ToolOutputsProps> = ({ toolOutputs }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!toolOutputs || toolOutputs.length === 0) {
    return null;
  }

  const formatToolOutput = (content: string) => {
    try {
      // Try to parse as JSON for pretty printing
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // If not JSON, return as is
      return content;
    }
  };

  return (
    <div className="mt-3 border border-rose-200 rounded-lg bg-gradient-to-br from-rose-50 to-pink-50 overflow-hidden shadow-sm animate-fade-in-up">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left bg-gradient-to-r from-rose-100 to-pink-100 hover:from-rose-150 hover:to-pink-150 transition-all duration-300 ease-out border-b border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-inset transform hover:scale-[1.01] active:scale-[0.99]"
      >
        <div className="flex items-center gap-2">
          <ToolIcon className="w-4 h-4 text-rose-600 transition-transform duration-300 ease-out hover:rotate-12" />
          <span className="text-sm font-medium text-gray-700 font-bengali">
            Tool Usage ({toolOutputs.length} call{toolOutputs.length !== 1 ? 's' : ''})
          </span>
        </div>
        <ChevronDownIcon 
          className={`w-4 h-4 text-gray-500 transition-all duration-300 ease-out ${
            isExpanded ? 'transform rotate-180 text-rose-500' : 'hover:text-rose-400'
          }`} 
        />
      </button>
      
      {isExpanded && (
        <div className="p-4 space-y-3 bg-white animate-expand-down">
          {toolOutputs.map((output, index) => (
            <div key={output.id} className="border border-gray-200 rounded-md bg-gray-50 animate-slide-in-stagger" style={{animationDelay: `${index * 100}ms`}}>
              <div className="px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-150 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600 font-bengali animate-fade-in">
                    Tool Call #{index + 1}
                  </span>
                  <span className="text-xs text-gray-500 animate-fade-in">
                    {output.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <pre className="text-xs text-gray-800 font-mono overflow-x-auto whitespace-pre-wrap bg-white border border-gray-200 rounded p-2 animate-fade-in transition-all duration-300 hover:shadow-sm">
                  {formatToolOutput(output.content)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToolOutputs;