# rag-engine/rag.py
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import sys
import json

model = SentenceTransformer('all-MiniLM-L6-v2')

documents = [
    "Manufacturing businesses have moderate risk",
    "High EMI reduces creditworthiness",
    "Consistent GST and bank data increases trust",
    "Collateral improves approval chances",
]

embeddings = model.encode(documents)

dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(np.array(embeddings))


def search(query):
    query_vec = model.encode([query])
    D, I = index.search(np.array(query_vec), k=2)

    results = [documents[i] for i in I[0]]
    return results


if __name__ == "__main__":
    query = sys.argv[1]
    result = search(query)
    print(json.dumps(result))