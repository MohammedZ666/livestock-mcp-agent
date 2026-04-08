# Shobarkhamar Chatbot

A modern, AI-powered chatbot designed to help farmers answer their livestock related questions. Built with React frontend and FastAPI backend.

## 🏗️ Project Structure

```
livestock_mcp_agent/
├── frontend/          # React Frontend
│   ├── components/               # UI Components
│   │   ├── ChatInput.tsx        # Message input component
│   │   ├── ChatMessage.tsx      # Individual message display
│   │   └── icons.tsx            # SVG icons
│   ├── services/                # API Services
│   │   └── fastapiService.ts    # FastAPI communication
│   ├── App.tsx                  # Main application component
│   ├── types.ts                 # TypeScript type definitions
│   ├── package.json             # Frontend dependencies
│   └── vite.config.ts           # Vite configuration
│
└── langchain_chatbot/           # FastAPI Backend
    ├── main.py                  # FastAPI server with LangChain
    ├── system_prompt.py         # AI system instructions
    ├── config.json              # MCP server configuration
    └── requirements.txt         # Python dependencies
```

## 🚀 Features

### Frontend (React + TypeScript)
- **Modern Dark UI**: ChatGPT-style interface with dark theme
- **Real-time Streaming**: Live message streaming from backend
- **Tool Call Animation**: Visual feedback for AI tool usage
- **Responsive Design**: Works on desktop and mobile
- **Bengali Support**: Multilingual interface

### Backend (FastAPI + LangChain + FastMCP)
- **AI Integration**: Google Gemini 2.5 Flash model
- **Tool Calling**: MCP (Model Context Protocol) integration
- **Streaming Responses**: Server-sent events for real-time updates
- **Conversation Memory**: PostgreSQL-based conversation history
- **Multi-tool Support**: Healthcare, Search, Extraction, and other tools

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling

### Backend
- **FastAPI** - Python web framework
- **LangChain** - AI/LLM framework
- **Google Gemini** - AI model
- **PostgreSQL** - Conversation storage
- **MCP** - Tool integration protocol

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- Python 3.12+
- Gemini API Key (change if using different LLM)
- Nvidia API Key (change if using different embedding model)
- Vector Database

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd langchain_chatbot
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   pip install -e .
   ```
  Also setup `.env` file

3. **Start the FastAPI server:**
   ```bash
   python langchain_chatbot/main.py
   ```
   Server runs on `http://localhost:9700`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   echo "VITE_API_BASE_URL=http://localhost:6500" > .env.local
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

## 🔄 Data Flow

1. **User Input** → React ChatInput component
2. **API Call** → FastAPI `/stream` endpoint
3. **AI Processing** → LangChain with Gemini model
4. **Tool Execution** → MCP servers (if needed)
5. **Streaming Response** → Server-sent events back to frontend
6. **UI Update** → Real-time message display with animations

## 🎨 UI Components

### ChatMessage
- Displays individual messages with bubble styling
- Handles different message types (user, bot, system)
- Shows tool call animations (thinking, calling tools, processing)
- Supports markdown formatting and code blocks

### ChatInput
- Text input with auto-resize
- Send button with loading states
- Keyboard shortcuts (Enter to send)
- Placeholder text in Bengali

### App
- Main chat interface
- Message history management
- Real-time streaming updates
- Error handling and display

## 🔧 Configuration

### Frontend Configuration
- **API Base URL**: Set in `.env.local`
- **Theme**: Dark theme with material design colors
- **Language**: Bengali and English support

### Backend Configuration
- **MCP Servers**: Configured in `utils/config.py`
- **Database**: Supabase connection string
- **AI Model**: Google Gemini 2.5 Flash
- **System Prompt**: Customized for livstock-rearing domain

## 🚀 Deployment

### Frontend Build
```bash
cd baby-and-me-chatbot
npm run build
```

### Backend Deployment
- Use any ASGI server (uvicorn)
- Set up pgvector/any vector database
- Configure environment variables
- Deploy to cloud platform (AWS, GCP, etc.)

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for expecting parents and new families By Fahim Muntasir**
