# Runnable code for the notes

Notebooks here are shown inside the lessons (`NotebookView`) and open in Google Colab
from the **Open in Colab** button. They're our own code, not the course's notebooks
(those stay in the gitignored `excercises/` folder).

```
run_notebooks.py   re-run notebooks so the outputs shown in the notes are real
course-1/…         one folder per lesson topic
```

## Run locally

```bash
python3.12 -m venv code/.venv && code/.venv/bin/pip install -r code/requirements.txt
code/.venv/bin/python code/run_notebooks.py            # execute all, refresh outputs
```

## LLM access

Notebooks use **Colab's built-in models** (`google.colab.ai`): no API key, nothing to set up,
so open them in Colab and run the setup cell first. It prints the available models; to choose
one, uncomment its `MODEL = ...` line in that cell (default: Colab's own choice).

Colab-only cells (the setup cell and every cell that calls a model) are tagged `needs-llm`.
`run_notebooks.py` (run locally) skips them and keeps their saved outputs, so a Colab run saved
back to GitHub (*File → Save a copy in GitHub*) is what the notes show.
