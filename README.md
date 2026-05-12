## TaskFlow (Frontend + FastAPI Backend)

### Backend install

This environment may block global pip installs (PEP 668). Use a venv:

```bash
python -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt
```

### Run (single server)

```bash
backend/.venv/bin/uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Open `http://localhost:8000`

### API

Frontend calls: `assets/js/api.js` → base `/api/v1`

