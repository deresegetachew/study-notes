# Runnable code for the notes

Notebooks here are shown inside the lessons (`NotebookView`) and open in Google Colab
from the **Open in Colab** button. They're our own code, not the course's notebooks
(those stay in the gitignored `excercises/` folder).

```
shared/llm.py      get_completion() on Colab's built-in models (synced from the study-notes skill)
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
so open them in Colab. In the setup cell, `check_setup()` lists the available models; choose
one with `use_model("google/…")` there, or keep `use_model(None)` for Colab's default.

Cells that call a model are tagged `needs-llm`. `run_notebooks.py` (run locally) skips them
and keeps the outputs they already have, so a Colab run saved back to GitHub
(*File → Save a copy in GitHub*) is what the notes show.
