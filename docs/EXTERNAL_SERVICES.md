# External Services

This project depends on two browser-side technologies and no third-party
backend services. There are no API keys, no accounts, and no billing
anywhere in this stack.

## MediaPipe Hands (`@mediapipe/hands`, `@mediapipe/camera_utils`, `@mediapipe/drawing_utils`)

- **What it does:** runs a hand-landmark detection model entirely inside
  the browser via WebAssembly. For each video frame, it returns up to 21
  (x, y, z) landmarks per detected hand (wrist, thumb, and four fingers,
  each with several joints).
- **Where it runs:** on-device, in the browser tab. The video frame is
  never sent anywhere -- MediaPipe processes the `<video>` element's pixels
  locally and returns coordinates.
- **Network dependency:** the JS packages are bundled by Vite/npm like any
  other dependency, but MediaPipe's WASM binary and model assets are
  fetched at runtime from a CDN (`https://cdn.jsdelivr.net/npm/@mediapipe/hands/`),
  configured via the `locateFile` option in `frontend/src/hooks/useAmaphuzu.js`.
  This means **hand tracking requires an internet connection on first load**
  (the assets are cached by the browser afterward), even though no video
  data is ever uploaded. If you need a fully offline build, download the
  MediaPipe assets and self-host them, then update `locateFile`.
- **Where it's used in this repo:** `frontend/src/hooks/useAmaphuzu.js`
  (extraction), `frontend/src/components/Ikhamera.jsx` (skeleton overlay
  drawing via `drawConnectors`/`drawLandmarks`).
- **Limits:** configured for a single hand (`maxNumHands: 1`) since
  fingerspelling is one-handed; detection/tracking confidence thresholds
  are fixed in code (0.6 / 0.5) and are separate from the user-adjustable
  "confidence threshold" setting, which applies to the letter classifier's
  output, not MediaPipe's hand-detection confidence.
- **License/docs:** https://developers.google.com/mediapipe/solutions/vision/hand_landmarker
  (the legacy `@mediapipe/hands` JS solution used here is in maintenance
  mode upstream but remains functional and widely used; the newer MediaPipe
  Tasks API is a drop-in replacement path if this project is extended).

## Web Speech API (`window.speechSynthesis`)

- **What it does:** converts the built sentence to spoken audio, with
  selectable voice and speech rate.
- **Where it runs:** entirely in the browser, using whatever
  text-to-speech voices the operating system/browser provides. No text is
  sent to a server for speech synthesis.
- **Network dependency:** none for most voices (offline, OS-provided).
  Some browsers (notably Chrome on some platforms) route certain "network"
  voices through Google's servers; if privacy purity matters for your
  deployment, prefer local/offline voices, which are typically listed
  without a "network" tag in the voice picker in `frontend/src/components/Izilungiselelo.jsx`.
- **Where it's used in this repo:** `frontend/src/hooks/useIzwi.js`.
- **Limits:** voice availability differs by browser and OS; some browsers
  populate the voice list asynchronously (handled via the
  `onvoiceschanged` event in `useIzwi.js`). If `speechSynthesis` doesn't
  exist at all (very old browsers), the hook reports `iyatholakala: false`
  and the Speak button is simply unavailable -- no crash.
- **Docs:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

## No other external services

- The backend (`backend/`) is self-contained: FastAPI + scikit-learn,
  no external APIs, no database, no cloud model-hosting.
- The shipped classifier is trained entirely on synthetic data generated
  locally (`backend/scripts/qeqesha_imodeli.py`) -- no dataset download.
