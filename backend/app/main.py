"""I-app ye-FastAPI: izindlela ze-REST kanye ne-WebSocket yokubikezela
ngesikhathi sangempela (the FastAPI app: REST routes plus the real-time
prediction WebSocket).

Bheka docs/API.md ukuze uthole yonke imininingwane yezicelo nezimpendulo
(see docs/API.md for the full request/response contract of every endpoint).
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from app.imodeli.idatha import qamba_idatha_yokuqeqesha
from app.imodeli.imodeli import Imodeli, INDLELA_EMISIWE_YEMODELI
from app.izimo import IZIMO_ZEZINHLAMVU, IZINHLAMVU_EZISEKELWAYO
from app.ukulinganisa import INANI_LEZINOMBOLO

INGXENYE_YOKUQEQESHA = logging.getLogger("uxhumano")

app = FastAPI(
    title="Uxhumano API",
    description="I-backend ye-Uxhumano: uhlelo lokuguqula uphawu lwesandla lube umbhalo (backend for Uxhumano, the sign-to-text-to-speech accessibility tool).",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Imodeli esesikhundleni, ilayishwa uma i-app iqala (the live in-memory model,
# loaded once at process startup).
imodeli_esebenzayo = Imodeli()

# Izibonelo zomsebenzisi ezingakaqeqeshwa, ziqoqwa ngegama/ngefrasi
# (unretrained user-submitted samples, grouped by their custom label). Zonke
# lezi zihlala kumemori kuphela -- uma iseva iqala kabusha, kususwa
# (in-memory only -- restarting the server clears custom samples/labels,
# reverting to the shipped baseline model. Documented in docs/API.md).
IZIBONELO_ZOMSEBENZISI: dict[str, list[list[float]]] = {}


@app.on_event("startup")
def qala_imodeli() -> None:
    """Layisha imodeli esifundisiwe kusengaphambili, noma yakhe entsha uma
    ingekho (load the shipped pretrained model, or train a fresh one if the
    artifact is missing)."""
    try:
        global imodeli_esebenzayo
        imodeli_esebenzayo = Imodeli.layisha(INDLELA_EMISIWE_YEMODELI)
        INGXENYE_YOKUQEQESHA.info("Imodeli ilayishiwe (model loaded) from %s", INDLELA_EMISIWE_YEMODELI)
    except FileNotFoundError:
        INGXENYE_YOKUQEQESHA.warning("Ayikho imodeli elondoloziwe, kuqeqeshwa entsha (no saved model found, training a fresh one)")
        amaphuzu, izinhlamvu = qamba_idatha_yokuqeqesha()
        imodeli_esebenzayo.qeqesha(amaphuzu, izinhlamvu)


# --------------------------------------------------------------------------
# Uphawu lwezicelo nezimpendulo (request / response schemas)
# --------------------------------------------------------------------------


class Isibikezelo(BaseModel):
    """Impendulo yokubikezela uhlamvu (a single letter prediction response)."""

    uhlamvu: str
    ukuzethemba: float = Field(ge=0.0, le=1.0)


class ImininingwaneYemodeli(BaseModel):
    """Imininingwane yemodeli esebenzayo njengamanje (metadata about the
    currently active model)."""

    iqeqeshiwe: bool
    izinhlamvu_eziqeqeshiwe: list[str]
    inani_lamaphuzu_alindelekile: int
    izibonelo_zomsebenzisi: dict[str, int]


class Isibonelo(BaseModel):
    """Isibonelo esisodwa esifakwa umsebenzisi ukuze afundise uphawu
    lwakhe (one user-submitted training sample for a custom sign)."""

    amaphuzu: list[float]
    igama: str = Field(min_length=1, max_length=40)

    @field_validator("amaphuzu")
    @classmethod
    def qinisekisa_ubude_bamaphuzu(cls, amaphuzu: list[float]) -> list[float]:
        if len(amaphuzu) != INANI_LEZINOMBOLO:
            raise ValueError(f"Kulindeleke izinombolo ezingu-{INANI_LEZINOMBOLO} (expected {INANI_LEZINOMBOLO} numbers)")
        return amaphuzu


# --------------------------------------------------------------------------
# Izindlela ze-REST (REST routes)
# --------------------------------------------------------------------------


@app.get("/health")
def hlola_impilo() -> dict[str, str]:
    """Hlola ukuthi iseva iyaphila (health check)."""
    return {"isimo": "kuhamba kahle"}


@app.get("/api/model-info", response_model=ImininingwaneYemodeli)
def imininingwane_yemodeli() -> ImininingwaneYemodeli:
    """Buyisela imininingwane yemodeli esebenzayo (return metadata describing
    the currently active model)."""
    return ImininingwaneYemodeli(
        iqeqeshiwe=imodeli_esebenzayo.iqeqeshiwe,
        izinhlamvu_eziqeqeshiwe=imodeli_esebenzayo.izinhlamvu_eziqeqeshiwe,
        inani_lamaphuzu_alindelekile=INANI_LEZINOMBOLO,
        izibonelo_zomsebenzisi={igama: len(izibonelo) for igama, izibonelo in IZIBONELO_ZOMSEBENZISI.items()},
    )


@app.get("/api/letters")
def izinhlamvu_ezitholakalayo() -> dict[str, object]:
    """Buyisela uhlu lwezinhlamvu ezisekelwayo kanye nezincazelo zazo
    (return the list of supported letters with their handshape
    descriptions, for the Practice Mode reference panel)."""
    return {
        "izinhlamvu": list(IZINHLAMVU_EZISEKELWAYO),
        "izincazelo": {uhlamvu: isimo.incazelo for uhlamvu, isimo in IZIMO_ZEZINHLAMVU.items()},
    }


@app.post("/api/samples", status_code=201)
def thumela_isibonelo(isibonelo: Isibonelo) -> dict[str, object]:
    """Yamukela isibonelo esisodwa esiqeqeshelwe uphawu olusha
    lomsebenzisi, ulugcine kumemori kuze kubizwe i-/api/retrain (accept one
    training sample for a new custom sign, held in memory until
    /api/retrain is called)."""
    igama = isibonelo.igama.strip()
    if not igama:
        raise HTTPException(status_code=422, detail="Igama alingabi ngamagama angenalutho (label cannot be blank)")

    IZIBONELO_ZOMSEBENZISI.setdefault(igama, []).append(isibonelo.amaphuzu)
    return {"igama": igama, "isibalo_samanje": len(IZIBONELO_ZOMSEBENZISI[igama])}


@app.delete("/api/samples/{igama}")
def susa_izibonelo(igama: str) -> dict[str, str]:
    """Susa zonke izibonelo zegama/uphawu olunikeziwe (delete all stored
    samples for the given custom label)."""
    if igama not in IZIBONELO_ZOMSEBENZISI:
        raise HTTPException(status_code=404, detail="Igama alitholakali (label not found)")
    del IZIBONELO_ZOMSEBENZISI[igama]
    return {"igama": igama}


@app.post("/api/retrain", response_model=ImininingwaneYemodeli)
def phinda_qeqesha() -> ImininingwaneYemodeli:
    """Phinda uqeqeshe imodeli, uhlanganisa idatha eyenziwe ngobuchule
    nezibonelo zomsebenzisi (retrain the model, combining the baseline
    synthetic dataset with any custom user-submitted samples)."""
    amaphuzu, izinhlamvu = qamba_idatha_yokuqeqesha()

    for igama, izibonelo in IZIBONELO_ZOMSEBENZISI.items():
        amaphuzu.extend(izibonelo)
        izinhlamvu.extend([igama] * len(izibonelo))

    imodeli_esebenzayo.qeqesha(amaphuzu, izinhlamvu)
    return imininingwane_yemodeli()


# --------------------------------------------------------------------------
# I-WebSocket yokubikezela ngesikhathi sangempela (real-time prediction)
# --------------------------------------------------------------------------


@app.websocket("/ws")
async def ixhumanisi_lokubikezela(websocket: WebSocket) -> None:
    """Yamukela amaphuzu alinganisiwe avela ku-frontend, ibuyisele
    ukubikezela ngesikhathi sangempela (accept normalized landmarks from the
    frontend and stream back real-time predictions).

    Uhlu lwe-JSON oluthunyelwayo (expected inbound JSON message shape):
        {"amaphuzu": [<63 floats>]}
    Impendulo uma kuphumelele (successful response):
        {"uhlamvu": "A", "ukuzethemba": 0.87}
    Impendulo uma kuphutha (error response, connection stays open):
        {"iphutha": "<description>"}
    """
    await websocket.accept()
    try:
        while True:
            idatha = await websocket.receive_json()
            try:
                amaphuzu = idatha.get("amaphuzu") if isinstance(idatha, dict) else None
                if not isinstance(amaphuzu, list) or len(amaphuzu) != INANI_LEZINOMBOLO:
                    raise ValueError(f"Kulindeleke uhlu lwezinombolo ezingu-{INANI_LEZINOMBOLO} (expected a list of {INANI_LEZINOMBOLO} numbers)")
                amaphuzu = [float(inombolo) for inombolo in amaphuzu]

                if not imodeli_esebenzayo.iqeqeshiwe:
                    raise RuntimeError("Imodeli ayikaqeqeshwa (model not ready yet)")

                uhlamvu, ukuzethemba = imodeli_esebenzayo.bikezela(amaphuzu)
                await websocket.send_json({"uhlamvu": uhlamvu, "ukuzethemba": ukuzethemba})
            except (ValueError, TypeError, RuntimeError) as iphutha:
                await websocket.send_json({"iphutha": str(iphutha)})
    except WebSocketDisconnect:
        INGXENYE_YOKUQEQESHA.info("Ikhulumo ye-WebSocket iqedile (client disconnected)")
