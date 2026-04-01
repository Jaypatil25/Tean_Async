import faiss
import numpy as np
import os
import json
import sys
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

INDEX_FILE = "faiss.index"
DOC_FILE = "docs.json"

def load_index():
    if os.path.exists(INDEX_FILE) and os.path.exists(DOC_FILE):
        index = faiss.read_index(INDEX_FILE)
        with open(DOC_FILE, "r") as f:
            docs = json.load(f)
    else:
        index = None
        docs = []
    return index, docs


# 🔹 Save index
def save_index(index, docs):
    faiss.write_index(index, INDEX_FILE)
    with open(DOC_FILE, "w") as f:
        json.dump(docs, f)


# 🔹 Chunk text
def chunk_text(text, chunk_size=300):
    words = text.split()
    return [" ".join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]


# 🔹 Add documents
def add_documents(text):
    index, docs = load_index()

    chunks = chunk_text(text)
    embeddings = model.encode(chunks)

    if index is None:
        dimension = embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)

    index.add(np.array(embeddings))
    docs.extend(chunks)

    save_index(index, docs)

    return {"status": "indexed", "chunks": len(chunks)}

def search(query):
    index, docs = load_index()

    if index is None:
        return ["No data indexed"]

    query_vec = model.encode([query])
    D, I = index.search(np.array(query_vec), k=3)

    results = [docs[i] for i in I[0]]
    return results

if __name__ == "__main__":
    mode = sys.argv[1]

    if mode == "add":
        text = sys.argv[2]
        print(json.dumps(add_documents(text)))

    elif mode == "search":
        query = sys.argv[2]
        print(json.dumps(search(query)))