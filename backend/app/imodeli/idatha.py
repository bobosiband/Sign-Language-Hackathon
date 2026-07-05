"""Ukwakha idatha eyenziwe ngobuchule (synthetic training data generation).

Asinayo idatha yangempela ye-mediphayela yezinhlamvu zonke zesandla, ngakho-ke
sakha amaphuzu esandla asengathi ayangempela ngokusekelwe ku-IZIMO_ZEZINHLAMVU
(izimo.py): isandla simodeliwe njengeketango yeminwe emihlanu, iyunwe
ngayinye igotshwa ngokwesilinganiso esifanele uhlamvu, sengeziwe ngumsindo
wamahle-ahle wangempela (jitter, ukujika, nobungako) ukuze imodeli
ifunde imikhawulo ehlukene ngempela, hhayi ubungqondo bomlingiswa
(the classifier learns real separating boundaries, not a lookup table).
"""

from __future__ import annotations

import math
import random

from app.izimo import IZIMO_ZEZINHLAMVU, IsimoSesihlamvu
from app.ukulinganisa import INANI_LAMAPHUZU, linganisa_amaphuzu

Iphuzu = tuple[float, float, float]

# Ukugotshwa okukhulu ngamunye we-segment uma umunwe ugoqwe ngokuphelele
# (degrees of bend per finger segment at full curl).
UKUGOTSHWA_NGE_SEGMENT = 55.0

# Isisekelo somunwe ngamunye: (ukususa nge-x, ukususa nge-y, ukususa nge-z,
# ubude bama-segment amathathu) -- (per-finger base offset from the wrist,
# plus the three segment lengths from that base joint to the fingertip).
_ISISEKELO_SEZIMINWE: dict[str, tuple[float, float, float, tuple[float, float, float]]] = {
    "isithupha": (-0.35, 0.15, 0.05, (0.22, 0.18, 0.15)),
    "ikhomba": (-0.15, 0.55, 0.0, (0.32, 0.18, 0.14)),
    "ophakathi": (-0.05, 0.58, 0.0, (0.36, 0.20, 0.15)),
    "insimba": (0.05, 0.55, 0.0, (0.33, 0.18, 0.14)),
    "ucikicane": (0.18, 0.50, 0.0, (0.25, 0.14, 0.11)),
}

# Ukulandelana kweminwe njengoba kuvela ku-IsimoSesihlamvu.ukugoqwa
# (finger order matching IsimoSesihlamvu.ukugoqwa).
_UKULANDELANA_KWEZIMINWE = ("isithupha", "ikhomba", "ophakathi", "insimba", "ucikicane")


def _akha_umunwe(igama_lomunwe: str, ukugoqwa: float, ukwahlukana: float) -> list[Iphuzu]:
    """Yakha amaphuzu amane omunwe owodwa (build one finger's 4 landmarks).

    Buyisela isisekelo (MCP/CMC) kanye namaphuzu amathathu alandelayo
    (returns the base joint plus the three joints that follow it).
    """
    ukususa_x, ukususa_y, ukususa_z, ubude = _ISISEKELO_SEZIMINWE[igama_lomunwe]
    ukususa_x_okugcinwe = ukususa_x if igama_lomunwe == "isithupha" else ukususa_x * ukwahlukana

    isisekelo: Iphuzu = (ukususa_x_okugcinwe, ukususa_y, ukususa_z)
    amaphuzu_omunwe = [isisekelo]

    iphuzu_lamanje = isisekelo
    for isegimenti, ubude_bemzuzwana in enumerate(ubude, start=1):
        idigri = 90.0 - ukugoqwa * UKUGOTSHWA_NGE_SEGMENT * isegimenti
        iredidiyani = math.radians(idigri)
        idayreksheni = (0.0, math.cos(iredidiyani), math.sin(iredidiyani))
        iphuzu_elilandelayo = (
            iphuzu_lamanje[0] + ubude_bemzuzwana * idayreksheni[0],
            iphuzu_lamanje[1] + ubude_bemzuzwana * idayreksheni[1],
            iphuzu_lamanje[2] + ubude_bemzuzwana * idayreksheni[2],
        )
        amaphuzu_omunwe.append(iphuzu_elilandelayo)
        iphuzu_lamanje = iphuzu_elilandelayo

    return amaphuzu_omunwe


def _akha_isandla_esiqondile(isimo: IsimoSesihlamvu) -> list[Iphuzu]:
    """Yakha amaphuzu angama-21 esandla, ngaphandle komsindo (build the 21
    ideal, noise-free landmarks for a given handshape spec)."""
    amaphuzu: list[Iphuzu] = [(0.0, 0.0, 0.0)]  # isihlakala (wrist)
    for igama_lomunwe, ukugoqwa in zip(_UKULANDELANA_KWEZIMINWE, isimo.ukugoqwa):
        amaphuzu.extend(_akha_umunwe(igama_lomunwe, ukugoqwa, isimo.ukwahlukana))
    assert len(amaphuzu) == INANI_LAMAPHUZU
    return amaphuzu


def _faka_umsindo(
    amaphuzu: list[Iphuzu],
    isibalo_semisindo: random.Random,
    ubukhulu_bomsindo: float = 0.02,
) -> list[Iphuzu]:
    """Engeza umsindo wamahle-ahle wangempela: ukujika, ubungako, nokududuzeka
    kwamaphuzu ngamunye (add realistic per-sample noise: whole-hand rotation,
    scale jitter, per-landmark jitter, and translation)."""
    idigri_yokujika = isibalo_semisindo.uniform(-15.0, 15.0)
    iredidiyani = math.radians(idigri_yokujika)
    isin, ikhosi = math.sin(iredidiyani), math.cos(iredidiyani)

    ubungako = isibalo_semisindo.uniform(0.85, 1.15)
    ukususa = (
        isibalo_semisindo.uniform(-0.3, 0.3),
        isibalo_semisindo.uniform(-0.3, 0.3),
        isibalo_semisindo.uniform(-0.3, 0.3),
    )

    okuphumayo = []
    for x, y, z in amaphuzu:
        # Ukujika esiteji se-xy (rotate in the xy-plane).
        x_jikiwe = x * ikhosi - y * isin
        y_jikiwe = x * isin + y * ikhosi

        x_bukhulu = x_jikiwe * ubungako + isibalo_semisindo.gauss(0.0, ubukhulu_bomsindo)
        y_bukhulu = y_jikiwe * ubungako + isibalo_semisindo.gauss(0.0, ubukhulu_bomsindo)
        z_bukhulu = z * ubungako + isibalo_semisindo.gauss(0.0, ubukhulu_bomsindo)

        okuphumayo.append((x_bukhulu + ukususa[0], y_bukhulu + ukususa[1], z_bukhulu + ukususa[2]))

    return okuphumayo


def qamba_amaphuzu_esibonelo(uhlamvu: str, isibalo_semisindo: random.Random | None = None) -> list[float]:
    """Qamba isibonelo esisodwa esilinganisiwe soHLAMVU olunikeziwe (generate
    one normalized synthetic sample for the given letter)."""
    if uhlamvu not in IZIMO_ZEZINHLAMVU:
        raise ValueError(f"Uhlamvu olungaziwa (unknown letter): {uhlamvu}")

    isibalo_semisindo = isibalo_semisindo or random.Random()
    isimo = IZIMO_ZEZINHLAMVU[uhlamvu]
    amaphuzu_aqondile = _akha_isandla_esiqondile(isimo)
    amaphuzu_anomsindo = _faka_umsindo(amaphuzu_aqondile, isibalo_semisindo)

    amaphuzu_ayindilinga: list[float] = []
    for x, y, z in amaphuzu_anomsindo:
        amaphuzu_ayindilinga.extend([x, y, z])

    return linganisa_amaphuzu(amaphuzu_ayindilinga)


def qamba_idatha_yokuqeqesha(
    ubuningi_ngalunye: int = 60,
    inhlanyelo: int | None = 42,
) -> tuple[list[list[float]], list[str]]:
    """Qamba isethi yonke yokuqeqesha yezinhlamvu zonke ezisekelwayo (generate
    the full training set across every supported letter).

    Args:
        ubuningi_ngalunye: Isibalo sezibonelo ngalunye uhlamvu (samples per
            letter).
        inhlanyelo: Inhlanyelo ye-random ukuze imiphumela iphindaphindeke
            (random seed, for reproducibility).

    Returns:
        Uphawu lwe-(amaphuzu, izinhlamvu): uhlu lwezibonelo ezilinganisiwe
        kanye nohlu lwamalebula afanayo ngobude (a (features, labels) tuple
        of matching length).
    """
    isibalo_semisindo = random.Random(inhlanyelo)
    amaphuzu_onke: list[list[float]] = []
    izinhlamvu_onke: list[str] = []

    for uhlamvu in IZIMO_ZEZINHLAMVU:
        for _ in range(ubuningi_ngalunye):
            amaphuzu_onke.append(qamba_amaphuzu_esibonelo(uhlamvu, isibalo_semisindo))
            izinhlamvu_onke.append(uhlamvu)

    return amaphuzu_onke, izinhlamvu_onke
