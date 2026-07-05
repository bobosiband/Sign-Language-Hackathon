# Glossary: isiZulu identifiers → English

Every variable, function, class, constant, CSS class, and file-level
identifier that this project's authors named is in isiZulu, per the
project's naming convention. Third-party imports, framework hooks
(`useState`, `useEffect`), HTML attributes, and file extensions are left in
English, since those names belong to their respective libraries/standards,
not to this codebase.

This file is kept in sync with the code by hand; if you rename or add an
identifier, update this file in the same change.

## Core recurring vocabulary

These words appear across many files, so they're listed once here instead
of repeated in every table below.

| isiZulu | English | Notes |
|---|---|---|
| `isandla` | hand | |
| `amaphuzu` | points / landmarks | The 21 MediaPipe hand landmarks, or their flattened 63-float form. |
| `uhlamvu` | letter | A predicted or typed alphabet letter. |
| `izinhlamvu` | letters | Plural of the above. |
| `umbhalo` | text / writing | |
| `umusho` | sentence | |
| `izwi` | voice | |
| `ikhamera` | camera | |
| `umfanekiso` / `ukwedlula` | image / overlay | `ukwedlula` ("to pass over/overlay") names the canvas overlay specifically. |
| `imodeli` | model | The ML classifier. |
| `qinisekisa` | verify / confirm | |
| `hlola` | check / test | |
| `qala` | start | |
| `misa` | stop | |
| `susa` | remove / delete | |
| `ukuzethemba` | confidence | A classifier confidence score in `[0, 1]`. |
| `isimo` | state / status / condition | Heavily overloaded by design: component state, connection status, handshape spec. Context disambiguates. |
| `izilungiselelo` | settings | |
| `ukugoqwa` | curling | Per-finger curl amount used in the synthetic handshape spec. |
| `linganisa` | to normalize / make equal | The normalization contract (see `docs/ARCHITECTURE.md`). |
| `qeqesha` | to train | As in training a model. |
| `bikezela` | to predict | |
| `isibonelo` | sample / example | A training sample. |
| `igama` | name / label | A custom sign's label. |
| `iphutha` | error / mistake | |
| `ibalo` | count | A frame counter. |

## Backend (`backend/app/`)

### `ukulinganisa.py` -- the normalization contract

| isiZulu | English |
|---|---|
| `INANI_LAMAPHUZU` | number of landmarks (21) |
| `INANI_LEZINOMBOLO` | number of numbers (63) |
| `INDEKISI_YESIHLAKALA` | index of the wrist |
| `INDEKISI_YESISEKELO_SOMUNWE_OPHAKATHI` | index of the middle-finger base (MCP) |
| `IPHUTHA_ELINCANE` | small error/epsilon (division-by-zero guard) |
| `hlukanisa_amaphuzu` | split points (flat list → 21 (x,y,z) tuples) |
| `hlanganisa_amaphuzu` | join points (21 tuples → flat list) |
| `linganisa_amaphuzu` | normalize landmarks (the main contract function) |
| `isihlakala` | the wrist landmark (local variable) |
| `amaphuzu_asuselwe` | translated points (local variable) |
| `ibanga` | distance (local variable, the scale reference) |
| `amaphuzu_alinganisiwe` | normalized points (local variable) |

### `izimo.py` -- canonical handshape specs

| isiZulu | English |
|---|---|
| `IsimoSesihlamvu` | a letter's handshape spec (dataclass) |
| `ukugoqwa` | per-finger curl tuple (field) |
| `ukwahlukana` | finger-spread multiplier (field) |
| `incazelo` | description (field, shown in Practice Mode) |
| `IZIMO_ZEZINHLAMVU` | the handshape specs for every letter (dict) |
| `IZINHLAMVU_EZISEKELWAYO` | the supported letters (tuple) |

### `imodeli/idatha.py` -- synthetic data generation

| isiZulu | English |
|---|---|
| `Iphuzu` | Point (type alias for an (x,y,z) tuple) |
| `UKUGOTSHWA_NGE_SEGMENT` | degrees of bend per finger segment |
| `_ISISEKELO_SEZIMINWE` | per-finger base offsets/segment lengths |
| `_UKULANDELANA_KWEZIMINWE` | finger ordering |
| `_akha_umunwe` | build one finger (function) |
| `_akha_isandla_esiqondile` | build an "ideal"/noise-free hand (function) |
| `_faka_umsindo` | add noise -- rotation, scale, jitter, translation (function) |
| `qamba_amaphuzu_esibonelo` | generate one sample's landmarks (function) |
| `qamba_idatha_yokuqeqesha` | generate the full training dataset (function) |
| `igama_lomunwe` | finger name (local variable) |
| `isisekelo` | base joint (local variable) |
| `amaphuzu_omunwe` | one finger's points (local variable) |
| `iphuzu_lamanje` | current point (local variable) |
| `isegimenti` | segment index (local variable) |
| `idigri` / `iredidiyani` | degrees / radians (local variables) |
| `idayreksheni` | direction vector (local variable) |
| `isibalo_semisindo` | the noise/randomness generator (local variable, an RNG) |
| `ubukhulu_bomsindo` | noise magnitude (local variable) |
| `idigri_yokujika` | rotation degrees (local variable) |
| `ubungako` | scale (local variable) |
| `ukususa` | translation offset (local variable) |
| `amaphuzu_onke` / `izinhlamvu_onke` | all points / all letters (local variables, accumulators) |

### `imodeli/imodeli.py` -- the classifier wrapper

| isiZulu | English |
|---|---|
| `Imodeli` | Model (class) |
| `isihlelo` | classifier / arrangement (the wrapped scikit-learn estimator) |
| `izinhlamvu_eziqeqeshiwe` | the labels the model was trained on |
| `iqeqeshiwe` | trained (property: is the model ready) |
| `qeqesha` | train (method) |
| `bikezela` | predict (method) |
| `londoloza` | save (method) |
| `layisha` | load (classmethod) |
| `INDLELA_EMISIWE_YEMODELI` | default model file path |

### `main.py` -- FastAPI app

| isiZulu | English |
|---|---|
| `INGXENYE_YOKUQEQESHA` | the training/logging section (module logger) |
| `imodeli_esebenzayo` | the active/working model (module-level instance) |
| `IZIBONELO_ZOMSEBENZISI` | the user's (custom) samples (in-memory store) |
| `impilo_ye_app` | the app's health/lifespan (startup/shutdown context manager) |
| `Isibikezelo` | Prediction (Pydantic model) |
| `ImininingwaneYemodeli` | Model metadata (Pydantic model) |
| `Isibonelo` | Sample (Pydantic model) |
| `qinisekisa_ubude_bamaphuzu` | verify the landmark-vector length (validator) |
| `hlola_impilo` | health check (route handler) |
| `imininingwane_yemodeli` | model info (route handler) |
| `izinhlamvu_ezitholakalayo` | the available letters (route handler) |
| `thumela_isibonelo` | submit a sample (route handler) |
| `susa_izibonelo` | delete samples (route handler) |
| `phinda_qeqesha` | retrain (route handler, literally "train again") |
| `ixhumanisi_lokubikezela` | the prediction connector (WebSocket handler) |

### `scripts/qeqesha_imodeli.py`

Script name: "train the model". Uses the same vocabulary as above (`amaphuzu`,
`izinhlamvu`, `imodeli`, `ukunemba` = "accuracy").

## Frontend (`frontend/src/`)

### `utils/ukulinganisa.js`

Mirrors `backend/app/ukulinganisa.py` identifier-for-identifier (camelCase
instead of snake_case, per JS convention): `linganisaAmaphuzu`,
`hlukanisaAmaphuzu`, `hlanganisaAmaphuzu`, `INANI_LAMAPHUZU`,
`INANI_LEZINOMBOLO`, `INDEKISI_YESIHLAKALA`,
`INDEKISI_YESISEKELO_SOMUNWE_OPHAKATHI`, `IPHUTHA_ELINCANE`.

### `utils/isakhiSomusho.js` -- the hold-to-type state machine

| isiZulu | English |
|---|---|
| `isakhi somusho` (file/concept name) | sentence builder |
| `UBUDE_BOKUPHUMULA_OKUMISIWE` | the default cooldown length (frames) |
| `isimoSokuqala` | initial state (function) |
| `simamisaUmusho` | "stabilize the sentence" -- the reducer (function) |
| `uhlamvuAmanje` | the current candidate letter (state field) |
| `ibaloLokuphumula` | cooldown counter (state field) |
| `inqubekelaphambili` | progress (state field, 0..1, drives the hold-progress ring) |
| `okwenzekile` | "what happened" -- the last event, for announcements/transcript (state field) |
| `akutholakalanga` | "not found" -- no hand / below confidence (local variable) |

### `data/izimo.js` / `data/izilungiseleloOkumisiwe.js`

Mirrors the backend's `izimo.py` handshape specs for Practice Mode
(`IZINHLAMVU_EZISEKELWAYO`, `IZINCAZELO_ZEZIMO` = descriptions,
`UKUGOQWA_KWEZIMO` = curl specs, `AMAGAMA_EMINWE` = finger names), and
defines the persisted default settings (`IZILUNGISELELO_EZIMISIWE`,
`ISIKHIYA_SOKULONDOLOZA` = the localStorage key).

### `hooks/`

| isiZulu | English |
|---|---|
| `useIkhamera` | the camera hook |
| `IZIMO_ZEKHAMERA` | camera states (starting/running/denied/unavailable/error) |
| `useAmaphuzu` | the landmarks hook (wraps MediaPipe) |
| `amaphuzuOkudweba` | landmarks-for-drawing (raw, for the skeleton overlay) |
| `amaphuzuAlinganisiwe` | normalized landmarks (sent to the backend) |
| `isandlaSibonakele` | "the hand is visible" (boolean) |
| `useIxhumanisi` | the connector/WebSocket hook |
| `IZIMO_ZOXHUMANO` | connection states (connecting/connected/broken) |
| `thumela` | send (function) |
| `xhuma` | connect (function) |
| `useIzwi` | the voice/speech hook |
| `khuluma` | speak (function) |
| `amazwi` | voices (available `SpeechSynthesisVoice`s) |
| `iyakhuluma` | "is speaking" (boolean) |
| `useUmusho` | the sentence hook (binds the reducer to React) |
| `engezaBikezelo` | append-a-prediction (dispatch helper) |
| `hlehlisa` | go back / backspace (dispatch helper) |
| `sula` | clear (dispatch helper) |
| `engezaIsikhala` | add a space (dispatch helper) |
| `useIzilungiselelo` | the settings hook |
| `shintsha` | change (a setting) |

### `components/`

| File | isiZulu name meaning |
|---|---|
| `Ikhamera.jsx` | Camera (view + skeleton overlay) |
| `Uhlamvu.jsx` | Letter (big display + confidence + hold-progress ring) |
| `Umusho.jsx` | Sentence (bar: text, backspace, clear, space, speak) |
| `Izilungiselelo.jsx` | Settings (the accessibility settings panel) |
| `Ukuzijwayeza.jsx` | "to practice" (Practice Mode) |
| `Fundisa.jsx` | "teach" (the teach-your-own-signs flow) |
| `Umlando.jsx` | History (the session transcript) |
| `Imfihlo.jsx` | Privacy/secrecy (the privacy badge) |
| `IsimoIbhena.jsx` | Status banner |
| `Isimemezelo.jsx` | Announcement (the visually-hidden ARIA live region) |

Notable identifiers within components: `ikhethaUhlamvuOlusha` ("choose a
new letter", Practice Mode's next-target picker), `UkugoqwaIbhasekhwama`
("curl bar chart", the five-finger indicator), `uchungechunge` (streak),
`impumelelo` (success/correct), `okuqoshiwe` (already scored/recorded),
`kufanisiwe` (mirrored, for the camera's mirror-view CSS transform).

### `App.jsx` / `config.js` / `main.jsx`

| isiZulu | English |
|---|---|
| `AMATHEBHU` | the tabs |
| `ithebhu` | current tab (state) |
| `imicimbiYomlando` | transcript events |
| `isimemezelo` | the current screen-reader announcement (state) |
| `IPHOTHI_YANGEMUVA` | the backend endpoint ("backend port/socket") |
| `URL_YE_WEBSOCKET` | the WebSocket URL |

### CSS classes (`index.css`)

All custom CSS classes and custom properties are prefixed `uxhumano-` /
named in isiZulu, e.g. `.ikhamera-isikhwama` (camera enclosure/box),
`.uhlamvu-isiyingi` (letter ring), `.umusho-ibha` (sentence bar),
`.izilungiselelo-uhlu` (settings list), `.ukugoqwa-ibha-sekhwama` (curl bar
container), `.umlando-uhlu` (transcript list), `.imfihlo-uphawu` (privacy
badge), `--uxhumano-ingemuva` (background), `--uxhumano-umbhalo` (text),
`--uxhumano-umugqa` (border/divider), `--uxhumano-oluhle` (good/success
color), `--uxhumano-oluphuthumayo` (urgent/error color),
`--uxhumano-oluxwayisayo` (warning color), `--uxhumano-ukugqama` (accent
color), `--uxhumano-inkinobho-*` (button surface colors, kept independent
from border/text colors -- see `docs/ACCESSIBILITY.md` for why).

### Project name

**Uxhumano** = "connection" / "communication" in isiZulu -- the app's name.
