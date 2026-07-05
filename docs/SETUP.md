# Setup and Troubleshooting

For the fastest path from clone to running app, see the Quickstart in the
[README](../README.md). This document covers the same ground in more detail,
plus troubleshooting.

## Requirements

- **Python 3.10+** (developed and tested on 3.13) with `venv` and `pip`.
- **Node.js 18+** and `npm` (developed and tested on Node 24).
- A webcam, and a browser that supports `getUserMedia`, WebAssembly, and
  (ideally) `speechSynthesis` -- any recent Chrome, Edge, or Firefox.
- An internet connection on first load, to fetch the MediaPipe WASM/model
  assets from a CDN (see `docs/EXTERNAL_SERVICES.md`). No internet
  connection is required afterward for hand tracking itself, and none at
  all for the backend or the classifier.

## Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

A pretrained model already ships at `backend/app/imodeli/imodeli.joblib`,
so you can start the server immediately:

```bash
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/health` -- you should see
`{"isimo":"kuhamba kahle"}`.

### Regenerating the model

If you want to regenerate the synthetic training data and retrain from
scratch (e.g. after changing `backend/app/izimo.py`):

```bash
cd backend
.venv/bin/python scripts/qeqesha_imodeli.py
```

This overwrites `backend/app/imodeli/imodeli.joblib` and prints a holdout
accuracy score.

### Running backend tests

```bash
cd backend
.venv/bin/python -m pytest -q
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Visit the URL Vite prints (default `http://localhost:5173`). The frontend
expects the backend at `http://localhost:8000` / `ws://localhost:8000/ws`
by default; override with a `.env` file in `frontend/`:

```bash
VITE_BACKEND_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

### Running frontend tests

```bash
cd frontend
npm test
```

### Production build

```bash
cd frontend
npm run build   # outputs to frontend/dist/
npm run preview # serve the production build locally
```

## Troubleshooting

**"Camera permission was denied" banner won't go away.**
Browser camera permissions are sticky per-origin. Check your browser's
site settings (usually the padlock/info icon in the address bar) and
allow camera access for the frontend's origin, then reload.

**No camera picker appears at all / "No camera was found on this device."**
Some laptops disable the webcam at the OS level, or another application
(a video call, another browser tab) is holding it exclusively. Close other
apps using the camera and reload.

**Letter never gets typed even though the skeleton overlay looks right.**
Check the confidence threshold in Settings -- if it's set high and
lighting/hand angle is poor, the model's confidence may not clear the bar.
Lower the threshold, improve lighting, or hold your hand closer to a
plain background.

**"Backend unreachable" banner stays up.**
Confirm the backend is actually running (`curl http://localhost:8000/health`)
and that `VITE_BACKEND_URL`/`VITE_WS_URL` in the frontend match where it's
listening. The WebSocket hook retries automatically with backoff, so once
the backend is reachable the banner clears on its own within ~10 seconds.

**MediaPipe hand tracking never starts / console errors mentioning
`cdn.jsdelivr.net`.**
MediaPipe's WASM assets are fetched from a CDN on first load (see
`docs/EXTERNAL_SERVICES.md`). If you're on a restricted network, allow
`cdn.jsdelivr.net`, or self-host the `@mediapipe/hands` assets and update
the `locateFile` callback in `frontend/src/hooks/useAmaphuzu.js`.

**`ModuleNotFoundError` running the backend.**
Make sure the virtual environment is activated (or you're invoking
`.venv/bin/python`/`.venv/bin/uvicorn` directly) and that
`pip install -r requirements.txt` completed without errors.

**Port already in use.**
Backend: `uvicorn app.main:app --reload --port 8001` (and update the
frontend's `VITE_BACKEND_URL`/`VITE_WS_URL` to match). Frontend:
`npm run dev -- --port 5174`.
