import torch
from fastapi import FastAPI
from transformers import pipeline

MODEL_NAME = "pszemraj/long-t5-tglobal-base-16384-book-summary"

app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "Summarization API"}


@app.post("/summarize")
def summarize_text(text: str):
    summarizer = pipeline(
        "summarization",
        MODEL_NAME,
        device=0 if torch.cuda.is_available() else -1,
    )
    result = summarizer(text)
    summary = result[0]["summary_text"]
    return {"summary": summary}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
