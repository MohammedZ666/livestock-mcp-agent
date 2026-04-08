// import React, { useState } from 'react';
// import { SendIcon } from './icons';

// interface ChatInputProps {
//   onSendMessage: (message: string) => void;
//   isLoading: boolean;
// }

// const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
//   const [input, setInput] = useState('');

//   const handleSend = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (input.trim() && !isLoading) {
//       onSendMessage(input);
//       setInput('');
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend(e);
//     }
//   };

//   return (
//     <div className="bg-black border-t border-gray-800 p-4 w-full">
//       <form
//         onSubmit={handleSend}
//         className="max-w-3xl mx-auto flex items-end space-x-4"
//       >
//         <div className="flex-grow relative">
//           <textarea
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={handleKeyDown}
//             placeholder="আমি এখন ভাবছি ... 🤔"
//             className="w-full p-4 pr-12 bg-gray-800 border border-gray-700 text-white placeholder:text-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all duration-200"
//             rows={1}
//             style={{ minHeight: '56px', maxHeight: '200px' }}
//             disabled={isLoading}
//           />
//         </div>
//         <button
//           type="submit"
//           disabled={isLoading || !input.trim()}
//           className="bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex-shrink-0 flex items-center justify-center"
//           style={{ height: '56px', width: '56px' }}
//         >
//           <SendIcon className="w-5 h-5" />
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ChatInput;

import React, { useState } from 'react';
import { SendIcon } from './icons';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="w-full px-3 py-3 sm:px-4 sm:py-4 bg-gradient-to-r from-rose-50 to-pink-50 border-t border-rose-100">
      <form
        onSubmit={handleSend}
        className="max-w-3xl mx-auto relative flex items-center"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          rows={1}
          disabled={isLoading}
          className="w-full pr-14 p-3 sm:p-4 bg-white border border-rose-200 text-gray-800 placeholder-gray-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 resize-none shadow-sm transition-all duration-300 ease-out font-bengali hover:shadow-md focus:shadow-lg transform focus:scale-[1.02] text-sm sm:text-base"
          style={{ minHeight: '52px', maxHeight: '200px' }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className={`absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-rose-400 via-pink-400 to-rose-500 hover:from-rose-500 hover:via-pink-500 hover:to-rose-600 disabled:from-gray-300 disabled:via-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 ease-out shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 ${
            isLoading ? 'animate-pulse scale-105' : ''
          }`}
        >
          <SendIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:text-rose-50 transition-all duration-300 ease-out group-hover:scale-110 ${
            isLoading ? 'animate-spin' : ''
          }`} />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
