# Repository Guidelines

## Project Structure & Module Organization
- `IAFASTTRACKMODEL/`: Django project settings, URLs, WSGI.
- `model/`: Main app (`models.py`, `views.py`, `urls.py`, `tests.py`, `templates/`, `static/`).
- `static/` and `staticfiles/`: Source and collected static assets.
- `media/`: User‑uploaded files (local/dev).
- Root: `manage.py`, `requirements.txt`, `app.yaml`, `db.sqlite3` (dev only).

## Build, Test, and Development Commands
- Create env + install: `python -m venv env && .\env\Scripts\Activate.ps1 && pip install -r requirements.txt`
- Migrate DB: `python manage.py migrate`
- Run server (dev): `python manage.py runserver`
- Run tests: `python manage.py test` (e.g., `python manage.py test model`)
- Collect static (deploy): `python manage.py collectstatic --noinput`
- App Engine deploy: `gcloud app deploy app.yaml` (requires gcloud auth and project).

## Coding Style & Naming Conventions
- Python 3.10+, PEP 8, 4‑space indentation; prefer type hints in new code.
- Django: app names `lower_snake_case` (current app: `model`), models `PascalCase`, functions/variables `lower_snake_case`.
- Templates: keep logic minimal; reuse blocks/partials; reference static via `{% static %}`.
- No repo‑enforced linter; recommended locally: `black` (line length 88) and `isort`.

## Testing Guidelines
- Framework: Django `unittest` via `manage.py test`; existing tests live in `model/tests.py`.
- Name test files/functions `test_*`; group by feature (views, models, forms).
- Run subset examples: `python manage.py test model.tests`, or `python manage.py test model.tests:MyCase.test_flow`.
- Aim to cover model methods, view responses (status, template, perms), and critical utils.

## Commit & Pull Request Guidelines
- Commits: imperative mood, concise summary, optional scope. Example: `Improve AI project matching and logging` or `Refactor mobile layout`.
- Branches: follow `feature/<short>`, `fix/<short>` or existing `codex/<topic>` pattern.
- PRs: clear description, linked issue/reference, test plan, and screenshots for UI changes. Keep changes focused; update docs when behavior changes.

## Security & Configuration Tips
- Configuration via env vars: `OPENAI_*`, `PRODUCTION`, `DB_*`, `ALLOWED_HOSTS`.
- Do not commit secrets. Prefer Secret Manager/CI env vars over hard‑coding (review `app.yaml` and `settings.py`).
- Dev uses SQLite; production uses Cloud SQL. For local MySQL testing, set `PRODUCTION=true` and run the Cloud SQL connector (`cloud_sql_proxy.exe`) or provide direct MySQL creds.

