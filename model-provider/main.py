import torch
from fastapi import FastAPI
from pydantic import BaseModel, Field
from transformers import pipeline

app = FastAPI()


class SummarizationRequest(BaseModel):
    text: str
    max_length: int = Field(512, ge=1)
    min_length: int = Field(256, ge=1)
    do_sample: bool = Field(True)


@app.get("/")
def read_root():
    return {"message": "Summarization API"}


@app.post("/summarize")
def summarize_text(request: SummarizationRequest):
    model_name = "pszemraj/long-t5-tglobal-base-16384-book-summary"

    summarizer = pipeline(
        task="summarization",
        model=model_name,
        device=0 if torch.cuda.is_available() else -1,
    )

    result = summarizer(
        request.text,
        max_length=request.max_length,
        min_length=request.min_length,
        do_sample=request.do_sample,
    )

    summary = result[0]["summary_text"]
    return {"summary": summary}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
