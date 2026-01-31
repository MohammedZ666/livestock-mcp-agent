import os
import sys
from dotenv import load_dotenv
from psycopg import AsyncConnection

# Add parent directory to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langchain_core.prompts import ChatPromptTemplate
from langchain.chat_models import init_chat_model
from langgraph.graph import MessagesState
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.prebuilt import create_react_agent

from utils.mcp_manager import get_mcp_tools_from_config
from system_prompt import sys_prompt


load_dotenv()

os.environ["LANGSMITH_TRACING"] = "true"
os.environ["LANGSMITH_ENDPOINT"] = "https://api.smith.langchain.com"
os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGSMITH_API_KEY")
os.environ["LANGSMITH_PROJECT"] = "pregnancy_bot"
DB_URI = os.getenv("DB_URI")

google = init_chat_model("google_genai:gemini-2.5-flash", temperature=0.3)

class State(MessagesState):
    thread_id: str
    remaining_steps: int

async def initialize_chat(state: State):
    try:
        print("Initializing chat...")
        config_file = os.getenv("MCP_CONFIG_FILE", "config.json")
        tools = await get_mcp_tools_from_config(config_file)
        print(f"Loaded {len(tools)} tools from MCP config")

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", sys_prompt),
                ("human", "{messages}"),
                ("placeholder", "{agent_scratchpad}"),
            ]
        )

        llm = google

        # Try to connect to database, fallback to memory if it fails
        checkpointer = None
        if DB_URI:
            try:
                print("[INFO] Attempting to connect to database...")
                conn = await AsyncConnection.connect(DB_URI)
                await conn.set_autocommit(True)
                pg_checkpointer = AsyncPostgresSaver(conn)
                await pg_checkpointer.setup()
                checkpointer = pg_checkpointer
                print("[INFO] Database connection successful - persistence enabled")
            except Exception as db_error:
                print(f"[WARNING] Database connection failed: {db_error}")
                print("[INFO] Continuing without database persistence...")
                checkpointer = None
        else:
            print("[INFO] No DB_URI provided - running without persistence")

        agent = create_react_agent(
            model=llm,
            tools=tools,
            prompt=prompt,
            name="main_agent",
            state_schema=State,
            checkpointer=checkpointer,
        )

        return agent

    except Exception as e:
        print(f"[ERROR] Error in initialize_chat: {str(e)}")
        raise