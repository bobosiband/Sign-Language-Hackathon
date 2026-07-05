# Uxhumano

**Uxhumano** ("connection" / "communication" in isiZulu) turns webcam
fingerspelling into typed text and spoken audio, in real time, entirely in
the browser -- with a small Python backend doing only the letter
classification.

It's built as a communication aid for Deaf and hard-of-hearing users, and
as a learning tool that teaches hearing people the ASL fingerspelling
alphabet in return.

- **Privacy-first:** hand tracking runs on-device via MediaPipe WASM.
  Video never leaves your computer -- only 63 numbers (21 landmarks × x,
  y, z) per frame are sent to the backend for classification.
- **Practice Mode:** flips the tool around -- it shows you a target
  letter and its handshape, and scores your attempts.
- **Teach-your-own-signs:** record a few samples of your own gesture,
  label it, retrain, and use it immediately -- because signing varies
  between people and regions.
- **Every accessibility control is user-adjustable:** hold duration,
  confidence threshold, text size, high-contrast (AAA) theme, reduced
  motion, mirrored view, speech rate and voice.

## Honest framing

This detects **fingerspelling and trained static gestures** -- not full
sign language. Sign languages are rich, independent languages with their
own grammar, motion, and facial grammar; a single-hand landmark classifier
cannot capture that, and this project doesn't pretend to. The shipped model
is also trained on **synthetic, procedurally generated landmark data**
(see `docs/ARCHITECTURE.md`), not real signer captures, so treat its
out-of-the-box accuracy as a demo baseline, not a clinical-grade
recognizer. The Teach-your-own-signs feature is the intended path to
better real-world accuracy and to handling regional variation (e.g. ASL
vs. Auslan vs. any personal gesture vocabulary) -- retrain it on your own
hand, in your own lighting, signing your own way.

## Quickstart (under 5 minutes)

Requirements: Python 3.10+, Node.js 18+, a webcam, and an internet
connection on first load (to fetch MediaPipe's WASM assets from a CDN --
see `docs/EXTERNAL_SERVICES.md`).

**Terminal 1 -- backend** (a pretrained model already ships in the repo,
so this starts serving predictions immediately):

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 -- frontend:**

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`), allow camera
access, and hold a handshape steady in front of the camera.

More detail and troubleshooting: [docs/SETUP.md](docs/SETUP.md).

## Running the tests

```bash
# Backend (pytest) -- from backend/, with the venv active
python -m pytest -q

# Frontend (Vitest + React Testing Library) -- from frontend/
npm test
```

Both suites are green: 22 backend tests, 36 frontend tests. They cover
landmark normalization (including a fixture shared between both languages
to guarantee they agree), the classifier, every REST/WebSocket endpoint,
the hold-to-type state machine, and key component rendering/ARIA behavior.

## Repository structure

```
.
├── README.md
├── frontend/               React (Vite) -- camera, MediaPipe, UI, speech
│   ├── src/
│   │   ├── components/     One component per file
│   │   ├── hooks/          Camera, landmarks, WebSocket, speech, settings
│   │   ├── utils/          Normalization, sentence-builder state machine
│   │   └── data/           Handshape specs and default settings
│   └── tests/              Vitest + React Testing Library
├── backend/                Python FastAPI -- classifier + REST/WebSocket
│   ├── app/
│   │   ├── main.py         FastAPI app, REST routes, WebSocket
│   │   ├── ukulinganisa.py Landmark normalization (the frontend/backend contract)
│   │   ├── izimo.py        Canonical per-letter handshape specs
│   │   └── imodeli/        Model wrapper + synthetic data generation
│   ├── tests/               pytest
│   └── scripts/             Regenerate synthetic data + retrain from scratch
├── fixtures/                Cross-language test fixture (normalization)
└── docs/
    ├── ARCHITECTURE.md      System design, data flow, the normalization contract
    ├── GLOSSARY.md          Every isiZulu identifier → English meaning
    ├── API.md                Every REST + WebSocket endpoint
    ├── EXTERNAL_SERVICES.md  MediaPipe Hands, Web Speech API
    ├── ACCESSIBILITY.md      Every a11y feature ↔ the WCAG criterion it meets
    └── SETUP.md              Detailed setup + troubleshooting
```

## A note on naming

Every identifier this project's authors named -- variables, functions,
classes, CSS classes, files -- is in isiZulu/isiNdebele; third-party
imports, framework hooks, and file extensions are left as-is. See
[docs/GLOSSARY.md](docs/GLOSSARY.md) for the complete mapping. Code
comments lead with isiZulu and include a short English translation where
the logic isn't obvious from the name alone.

## License

No license file is included; treat this as source-available for
evaluation/hackathon purposes unless a license is added.
