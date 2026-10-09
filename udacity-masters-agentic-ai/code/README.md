# Runnable code for the notes

Notebooks here are shown inside the lessons (`NotebookView`) and open in Google Colab
from the **Open in Colab** button. They're our own code, not the course's notebooks
(those stay in the gitignored `excercises/` folder).

```
shared/llm.py      get_completion() for every notebook (synced from the study-notes skill)
run_notebooks.py   re-run notebooks so the outputs shown in the notes are real
course-1/…         one folder per lesson topic
```

## Run locally

```bash
python3.12 -m venv code/.venv && code/.venv/bin/pip install -r code/requirements.txt
code/.venv/bin/python code/run_notebooks.py            # execute all, refresh outputs
```

## LLM access

- **In Colab:** nothing to set up. Notebooks use Colab's built-in models (`google.colab.ai`).
- **If those aren't available** on your account, or **outside Colab**: set `GEMINI_API_KEY`
  (or `OPENAI_API_KEY`) as an environment variable or a Colab secret with Notebook access on.
  `LLM_MODEL` picks a specific model.

**Run the setup cell first.** `check_setup()` prints which LLM will answer, or exactly why none
can (including Colab's own error message).

Cells that call a model are tagged `needs-llm`. `run_notebooks.py` skips them when no API key
is set locally and keeps the outputs they already have, so a run in Colab saved back to GitHub
(*File → Save a copy in GitHub*) is what the notes show.
