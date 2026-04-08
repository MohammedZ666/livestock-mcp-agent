# Baby and Me Chatbot

A React-based chatbot UI that connects to a FastAPI backend for pregnancy and parenting assistance.

## Run Locally

**Prerequisites:** Node.js and Python (for FastAPI backend)

### Backend Setup

1. Navigate to the FastAPI backend directory:
   ```bash
   cd ../langchain_chatbot
   ```

2. Install Python dependencies and run the FastAPI server:
   ```bash
   pip install -r requirements.txt
   python main.py
   ```

   The backend will run on `http://localhost:9700`

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file with:
   ```
   VITE_API_BASE_URL=http://localhost:9700
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173` and connect to the FastAPI backend.
