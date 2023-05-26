import torch
from transformers import pipeline
import os


def get_sample(filename: str, data_subdir=".tmp") -> str:
    file_path = os.path.join(data_subdir, filename)
    with open(file_path, 'r') as file:
        content = file.read()
        return content


# do a simple summarization
def main(model_name: str):
    summarizer = pipeline(
        "summarization",
        model_name,
        device=0 if torch.cuda.is_available() else -1,
    )

    # loads text sample for summarization
    input = get_sample("01-navy-seals-copypasta.txt")
    result = summarizer(input)
    print(result[0]["summary_text"])


if __name__ == "__main__":
    # I am not sure that this model is the best choice, but so far results are quite satisfying
    MODEL_NAME = "pszemraj/long-t5-tglobal-base-16384-book-summary"
    main(MODEL_NAME)
