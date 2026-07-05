# Architecture

Uxhumano ("connection/communication" in isiZulu) is a fingerspelling-to-speech
accessibility tool made of two independent halves: a React frontend that owns
everything time-sensitive (camera, hand tracking, typing, speech), and a
small Python backend that owns only the letter classifier.

## Why the split is where it is

The single most important design decision in this project is **where hand
landmark detection happens**: entirely in the browser, via MediaPipe Hands
running as WebAssembly. This means:

- Video frames never leave the user's device. There is no video upload, no
  video storage, and no video-processing endpoint anywhere in the backend.
- Only 21 hand landmarks × 3 coordinates = **63 floating-point numbers per
  frame** are sent onward, over a WebSocket, to the backend for
  classification.
- If the backend is unreachable, hand tracking and the skeleton overlay
  keep working, because they never depended on the backend in the first
  place. Only the letter-to-text step pauses.

## Data flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ Browser (frontend/)                                                  │
│                                                                       │
│  Webcam ──▶ MediaPipe Hands (WASM) ──▶ 21 landmarks {x,y,z}          │
│                                              │                       │
│                                              ▼                       │
│                              linganisaAmaphuzu() [normalize]         │
│                                              │                       │
│                     ┌────────────────────────┼───────────────────┐   │
│                     ▼                        ▼                   ▼   │
│           skeleton overlay (canvas)   63 floats over WebSocket   Practice /
│                                              │                Teach modes
└──────────────────────────────────────────────┼───────────────────────┘
                                                │  ws://.../ws
                                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Backend (backend/)                                                   │
│                                                                       │
│  63 floats ──▶ RandomForestClassifier.predict_proba() ──▶ {uhlamvu,  │
│                                                             ukuzethemba}│
└─────────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
                              Sentence builder (hold-to-type) ──▶ Web Speech API
```

The frontend then runs the predicted letter through a hold-to-type state
machine (`src/utils/isakhiSomusho.js`): a letter must be predicted steadily,
above a confidence threshold, for N consecutive frames before it's appended
to the sentence. Both N and the confidence threshold are user-adjustable in
Settings.

## The normalization contract

This is the one piece of logic that **must** behave identically on both
sides of the WebSocket, because the frontend normalizes landmarks before
sending them, and the backend's synthetic training data (and any
retraining) must be normalized the same way for the classifier's decision
boundaries to mean anything.

Implementations:
- Backend: `backend/app/ukulinganisa.py`, function `linganisa_amaphuzu`.
- Frontend: `frontend/src/utils/ukulinganisa.js`, function `linganisaAmaphuzu`.

Both take a flat array of 63 raw floats (21 landmarks × x, y, z, in
MediaPipe's landmark order) and apply the same three steps:

1. **Wrist-center (translation invariance).** Subtract the wrist landmark
   (index 0) from every point. After this step the wrist itself is always
   `(0, 0, 0)`. This makes the result independent of where the hand is
   positioned in the camera frame.
2. **Scale by the wrist-to-middle-finger-MCP distance (scale invariance).**
   Compute the Euclidean distance from the (now-centered) wrist to landmark
   9 (the middle finger's MCP joint), and divide every coordinate by that
   distance. This makes the result independent of hand size and distance
   from the camera. If that distance is smaller than `1e-6` (degenerate or
   all-zero input, e.g. no hand detected), the divisor is clamped to `1e-6`
   instead of raising a division-by-zero error, so the function always
   returns a finite vector.
3. **Flatten** back to a 63-length array in the same landmark order.

This is verified two ways:
- Both implementations have their own unit tests for translation invariance,
  scale invariance, and the zero-input edge case
  (`backend/tests/test_ukulinganisa.py`, `frontend/tests/ukulinganisa.test.js`).
- Both load the **same fixture file**, [`fixtures/ukulinganisa_fixture.json`](../fixtures/ukulinganisa_fixture.json),
  containing raw input vectors and their expected normalized output
  (precomputed once from the Python implementation), and assert their own
  output matches it to within `1e-6`. If one implementation ever drifts
  from the other, this fixture test catches it in CI on both sides.

## The synthetic training data

There is no public dataset of real MediaPipe hand landmarks for every
ASL fingerspelling letter, so `backend/app/imodeli/idatha.py` generates
plausible synthetic ones instead:

1. `backend/app/izimo.py` defines, for each of the 24 static letters
   (A-Y, excluding the motion letters J and Z), a simple handshape spec:
   a curl amount (0 = straight, 1 = fully curled) for each of the five
   fingers, plus a "spread" factor for how far apart the non-thumb fingers
   fan out. These are deliberately simplified approximations of real ASL
   handshapes -- see the Honest Framing section of the [README](../README.md).
2. `idatha.py` procedurally builds a 21-point hand from that spec: each
   finger is a short kinematic chain (base joint + three bending segments),
   with the bend angle driven by the curl value.
3. Each generated sample gets randomized whole-hand rotation, scale, and
   translation, plus small per-landmark jitter, before being normalized with
   the same `linganisa_amaphuzu` used everywhere else. This keeps the
   classifier's decision boundaries meaningful rather than memorizing one
   exact pose per letter.
4. `backend/scripts/qeqesha_imodeli.py` generates a full dataset this way,
   trains a `RandomForestClassifier` on it, and saves the result to
   `backend/app/imodeli/imodeli.joblib`, which ships in the repo so the app
   works immediately after cloning. Re-run the script any time to regenerate
   it, or replace it entirely with a model trained on real captured samples.

## Teach-your-own-signs

`POST /api/samples` accepts a normalized 63-float vector plus a text label
and holds it in memory. `POST /api/retrain` regenerates the synthetic
baseline dataset, appends every in-memory custom sample, and retrains the
live model in place -- so a custom sign becomes usable immediately, in the
same server process, without a restart. Custom samples are **not**
persisted to disk; restarting the backend reverts to the shipped baseline
model. This is a deliberate scope cut for a hackathon-sized project -- see
`docs/API.md` for the exact endpoint contract.

## Frontend module layout

- `src/hooks/useIkhamera.js` -- camera permission + stream lifecycle.
- `src/hooks/useAmaphuzu.js` -- wraps MediaPipe Hands, extracts landmarks.
- `src/hooks/useIxhumanisi.js` -- WebSocket client with exponential-backoff
  reconnect.
- `src/hooks/useIzwi.js` -- Web Speech API (`speechSynthesis`) wrapper.
- `src/hooks/useUmusho.js` -- React binding for the sentence-builder reducer.
- `src/utils/isakhiSomusho.js` -- the hold-to-type state machine, as a pure
  reducer with no DOM/React dependency, so it's trivially unit-testable.
- `src/utils/ukulinganisa.js` -- the normalization contract (see above).
- `src/components/*` -- one component per file: camera view, letter
  display, sentence bar, settings panel, practice mode, teach-a-sign flow,
  session transcript, privacy badge, status banners.

See `docs/GLOSSARY.md` for what every Zulu identifier in the codebase means.
