import os
from dotenv import load_dotenv
load_dotenv(override=True)

config_json = {
  "mcpServers": {
    "tavily-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "tavily-mcp"
      ],
      "env": {
        "TAVILY_API_KEY": os.getenv("TAVILY_API_KEY")
      },
      "disabled": False,
      "autoApprove": []
    },
    "livestock_mcp_agent": {
      "command": "python",
      "args": [
        "langchain_chatbot/server.py"
      ],
      "disabled": False,
      "autoApprove": []
    }
  }
}
