from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid
import os

from main import initialize_chat
from stream_generator import event_generator
from langchain_core.messages import HumanMessage

app = FastAPI(
    name="Pregnancy Bot",
    description="A chatbot for pregnancy",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    messages: str
    thread_id: Optional[str] = str(uuid.uuid4())

@app.post("/stream")
async def stream_response(request: ChatRequest):
    messages = request.messages
    thread_id = request.thread_id

    agent = await initialize_chat({
        "messages": [HumanMessage(content=messages)],
        "thread_id": thread_id,
    })

    return StreamingResponse(event_generator(agent, messages, thread_id), media_type="text/event-stream")

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "environment": "docker" if os.path.exists("/.dockerenv") else "native",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=6500)