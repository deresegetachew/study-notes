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

Set one of these as an environment variable, or in Colab's **Secrets** panel:

| Setting | Meaning |
|---|---|
| `GEMINI_API_KEY` | Use Gemini (e.g. the Google AI plan's API credits) |
| `OPENAI_API_KEY` | Use OpenAI, or Vocareum with `LLM_PROVIDER=vocareum` |
| `LLM_PROVIDER` | Force `gemini`, `openai`, `vocareum` or `mock` |
| `LLM_MODEL` | Override the provider's default model |

With no key, notebooks still run: demo cells use scripted replies (`set_mock_replies`).

**Run the setup cell first.** It calls `check_setup()`, which lists each setting and why it's
missing, e.g. *"secret exists, but Notebook access is switched off for it"*. Cells that need a
real model start with `check_setup(require_key=True)` and stop with instructions if no key is set.
