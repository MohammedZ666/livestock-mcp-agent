import os
from typing import List
from google import genai
from google.genai import types
from dotenv import load_dotenv
from langchain_core.embeddings import Embeddings
load_dotenv(override=True)


class GeminiEmbedder(Embeddings):
    def __init__(self, api_key: str, model: str = "gemini-embedding-2-preview"):
        self.client = genai.Client(api_key=api_key)
        self.model = model

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        embeddings = self.client.models.embed_content(
        model=self.model,
        contents=texts,
        config=types.EmbedContentConfig(
            task_type="retrieval_document",
         )
        ).embeddings

        return [embedding.values for embedding in embeddings]

    def embed_query(self, text: str) -> List[float]:
        embeddings = self.client.models.embed_content(
        model=self.model,
        contents=text,
        config=types.EmbedContentConfig(
            task_type="retrieval_document",
         )
       ).embeddings
        return embeddings[0].values


embedding_engine = GeminiEmbedder(
    api_key=os.getenv("GOOGLE_API_KEY"),
    model="gemini-embedding-2-preview",
)