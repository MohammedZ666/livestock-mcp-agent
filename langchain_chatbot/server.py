# stdio transport

import os
import sys
from fastmcp import FastMCP
from langchain_postgres import PGVector
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.nvidia_bge_m3 import NvidiaOpenAIEmbeddings_BGE_M3

load_dotenv(".env")

mcp = FastMCP("Pregnancy_kb_server")
SUPABASE_PG_CONN_URL = os.getenv("DB_URI")


embedding_engine = NvidiaOpenAIEmbeddings_BGE_M3(
    api_key=os.getenv("NVIDIA_API_KEY"),
    base_url="https://integrate.api.nvidia.com/v1",
    model="baai/bge-m3",
)


@mcp.tool
def knowledgebase(messages: str):
    """
    keyword: /kb
    Retrieve the query information from knowledgebase stored in postgres database.
    This tool will be used if user only asks to get information from the knowledgebase.

    Args:
        messages (str): The query message.
    Returns:
        list: A list of documents' contents.
    """

    vector_store = PGVector(
        embeddings=embedding_engine,
        collection_name="pregnancy_bot",
        connection=SUPABASE_PG_CONN_URL,
        use_jsonb=True,
    )

    retriever = vector_store.as_retriever(
        search_type="similarity", search_kwargs={"k": 5}
    )
    docs = retriever.invoke(messages)

    return [doc.page_content for doc in docs]


if __name__ == "__main__":
    mcp.run(transport="stdio")
