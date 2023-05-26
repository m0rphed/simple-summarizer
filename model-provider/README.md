# Summarization model provider API

## Build locally

Main dependencies:

- transformers, torch
- fastapi, uvicron

Dev dependencies:
> I use [pdm](https://pdm.fming.dev/) for python packaging hustle, but it's not required to build this repo

- pyenv && **pdm** (opinionated package manager 👻)
- yapf

```bash
# skip this if you already have PyTorch
# installing may take a looong time ⏳
pip3 install torch --index-url https://download.pytorch.org/whl/cu117
```

⚠️ If you are not sure about what version of PyTorch / CUDA you need, read 👉 [the docs](https://pytorch.org/get-started/locally/) first.

```bash
pip install fastapi
pip install "uvicorn[standard]"
```
