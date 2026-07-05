# API Reference

Base URL (default, local dev): `http://localhost:8000`
WebSocket URL (default, local dev): `ws://localhost:8000/ws`

Both are overridable in the frontend via the Vite env vars
`VITE_BACKEND_URL` and `VITE_WS_URL` (see `frontend/src/config.js`).

All REST endpoints are implemented in `backend/app/main.py`. Route paths
and JSON field names sent over the wire are documented here in English for
interoperability; the Python handler functions themselves have Zulu names
(see `docs/GLOSSARY.md`).

## `GET /health`

Health check.

**Response `200`:**
```json
{ "isimo": "kuhamba kahle" }
```
`isimo` means "status"; the value is a fixed success string ("going well").

## `GET /api/model-info`

Metadata about the currently active (in-memory) model.

**Response `200`:**
```json
{
  "iqeqeshiwe": true,
  "izinhlamvu_eziqeqeshiwe": ["A", "B", "C", "..."],
  "inani_lamaphuzu_alindelekile": 63,
  "izibonelo_zomsebenzisi": { "hello": 6 }
}
```

| Field | Meaning |
|---|---|
| `iqeqeshiwe` | Whether a model is trained and ready to predict. |
| `izinhlamvu_eziqeqeshiwe` | Every label (letter, or custom taught label) the current model can predict. |
| `inani_lamaphuzu_alindelekile` | Expected input vector length (always 63). |
| `izibonelo_zomsebenzisi` | Custom labels taught this session, mapped to how many samples have been captured for each. |

## `GET /api/letters`

The list of supported static letters, with a plain-English handshape
description for each (used by Practice Mode).

**Response `200`:**
```json
{
  "izinhlamvu": ["A", "B", "C", "..."],
  "izincazelo": {
    "A": "Fist with the thumb resting against the side of the index finger.",
    "...": "..."
  }
}
```

## `POST /api/samples`

Submit one labeled training sample for a custom sign (part of the
teach-your-own-signs flow). Samples are held **in memory only** -- they are
lost on server restart, and are not usable for prediction until
`/api/retrain` is called.

**Request body:**
```json
{ "amaphuzu": [0.01, 0.02, "... 63 floats total"], "igama": "hello" }
```
`amaphuzu` = "landmarks" (must be exactly 63 floats, already normalized by
the frontend); `igama` = "name/label", 1-40 characters.

**Response `201`:**
```json
{ "igama": "hello", "isibalo_samanje": 3 }
```
`isibalo_samanje` = "current count" -- how many samples are stored for that
label so far.

**Response `422`:** if `amaphuzu` is not exactly 63 numbers, or `igama` is
blank.

## `DELETE /api/samples/{igama}`

Delete all stored (not-yet-trained) samples for one custom label.

**Response `200`:** `{ "igama": "hello" }`
**Response `404`:** if that label has no stored samples.

## `POST /api/retrain`

Retrain the live model: regenerates the synthetic baseline dataset for the
24 static letters, appends every custom sample currently held in memory,
and retrains the classifier in place. The new model is immediately usable
by the WebSocket endpoint -- no restart needed.

**Response `200`:** same shape as `GET /api/model-info`, reflecting the
newly trained model (custom labels now included).

## `WS /ws`

The real-time prediction stream. Send one message per frame; receive one
prediction (or one error) per message. The connection stays open across
errors -- a malformed message never closes the socket.

**Client → server:**
```json
{ "amaphuzu": [0.01, 0.02, "... 63 floats total"] }
```

**Server → client (success):**
```json
{ "uhlamvu": "A", "ukuzethemba": 0.87 }
```
`uhlamvu` = "letter" (the predicted label -- a static letter, or a custom
taught label); `ukuzethemba` = "confidence", a float in `[0, 1]`.

**Server → client (error, connection stays open):**
```json
{ "iphutha": "Kulindeleke uhlu lwezinombolo ezingu-63 (expected a list of 63 numbers)" }
```
`iphutha` = "error". Sent when the payload isn't valid JSON with a 63-number
`amaphuzu` array, or when the model isn't ready yet.

## CORS

The backend allows all origins (`allow_origins=["*"]`) for hackathon-scale
simplicity. Tighten this before any real deployment.
