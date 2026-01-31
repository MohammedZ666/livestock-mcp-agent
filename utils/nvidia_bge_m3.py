from langchain_core.embeddings import Embeddings
from openai import OpenAI
from typing import List


class NvidiaOpenAIEmbeddings_BGE_M3(Embeddings):
    def __init__(self, api_key: str, base_url: str, model: str = "baai/bge-m3"):
        self.client = OpenAI(api_key=api_key, base_url=base_url)
        self.model = model

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        response = self.client.embeddings.create(
            input=texts,
            model=self.model,
            encoding_format="float",
            extra_body={"truncate": "NONE"},
        )
        return [data.embedding for data in response.data]

    def embed_query(self, text: str) -> List[float]:
        response = self.client.embeddings.create(
            input=[text],
            model=self.model,
            encoding_format="float",
            extra_body={"truncate": "NONE"},
        )
        return response.data[0].embedding
