"""Ukulinganisa kwamaphuzu esandla (hand landmark normalization).

Lokhu yikhontileka ebalulekile phakathi kwe-frontend ne-backend: zombili
kufanele zikhiqize imiphumela EFANAYO ngesikhathi zithola amaphuzu afanayo.
(This is the critical contract between frontend and backend: both must
produce IDENTICAL output when given the same input landmarks. See
docs/ARCHITECTURE.md for the full written specification.)

Uhlelo (algorithm):
  1. Susa ukususa ngesihlakala (translate so the wrist landmark is the origin).
  2. Yehlisa ngobungako besikhala phakathi kwesihlakala nesisekelo somunwe
     ophakathi (scale down by the wrist-to-middle-finger-MCP distance).
  3. Phumisela uhlu oluyi-flat lwezinombolo ezingu-63 (return a flat list of
     63 floats), ngesu elifanayo ngqo nele-frontend (utils/ukulinganisa.js).
"""

from __future__ import annotations

# Inani lamaphuzu ngokwesandla esisodwa (landmarks per hand, per MediaPipe Hands).
INANI_LAMAPHUZU = 21

# Inani lezinombolo emva kokwendlaleka (x, y, z ngalinye laphuzu).
INANI_LEZINOMBOLO = INANI_LAMAPHUZU * 3

# Indeksi yesihlakala (wrist landmark index in the MediaPipe Hands schema).
INDEKISI_YESIHLAKALA = 0

# Indeksi yesisekelo somunwe ophakathi (middle-finger MCP), esetshenziswa
# njengesikali (used as the scale reference point).
INDEKISI_YESISEKELO_SOMUNWE_OPHAKATHI = 9

# Inani elincane elivimbela ukwehlukaniswa ngo-0 (epsilon guarding division by
# zero) uma isandla singabonakali noma singahambi (e.g. all-zero input).
IPHUTHA_ELINCANE = 1e-6


def hlukanisa_amaphuzu(amaphuzu_ayindilinga: list[float]) -> list[tuple[float, float, float]]:
    """Guqula uhlu oluyi-flat lube ngamaphuzu angama-21 e-(x, y, z).

    (Convert a flat 63-length list into 21 (x, y, z) point tuples.)
    """
    if len(amaphuzu_ayindilinga) != INANI_LEZINOMBOLO:
        raise ValueError(
            f"Kulindeleke izinombolo ezingu-{INANI_LEZINOMBOLO}, kodwa kutholwe "
            f"ezingu-{len(amaphuzu_ayindilinga)} (expected {INANI_LEZINOMBOLO} "
            f"numbers, got {len(amaphuzu_ayindilinga)})"
        )
    amaphuzu = []
    for i in range(INANI_LAMAPHUZU):
        x, y, z = amaphuzu_ayindilinga[i * 3 : i * 3 + 3]
        amaphuzu.append((x, y, z))
    return amaphuzu


def hlanganisa_amaphuzu(amaphuzu: list[tuple[float, float, float]]) -> list[float]:
    """Guqula amaphuzu abuyele kuhlu oluyi-flat (flatten points back to a list)."""
    okuphumayo: list[float] = []
    for x, y, z in amaphuzu:
        okuphumayo.extend([x, y, z])
    return okuphumayo


def linganisa_amaphuzu(amaphuzu_ayindilinga: list[float]) -> list[float]:
    """Linganisa amaphuzu esandla ukuze kuqhathwe okufanayo njalo.

    (Normalize hand landmarks so comparisons are always apples-to-apples.)

    Args:
        amaphuzu_ayindilinga: Uhlu oluyi-flat lwezinombolo ezingu-63 (a flat
            list of 63 raw floats), njengoba aphuma ku-MediaPipe Hands
            (x, y, z ngalinye laphuzu, ngendlela ye-landmark 0..20).

    Returns:
        Uhlu oluyi-flat lwezinombolo ezingu-63 eselulinganisiwe: kususwe
        ngesihlakala (wrist-centered) futhi kwehliswe ngobungako
        (scale-invariant). Uma isandla singahambi nhlobo (zero input),
        kubuyiselwa uhlu lwama-zero ngaphandle kokuphahlazeka
        (a zero-filled vector is returned without crashing).
    """
    amaphuzu = hlukanisa_amaphuzu(amaphuzu_ayindilinga)

    isihlakala = amaphuzu[INDEKISI_YESIHLAKALA]
    ax, ay, az = isihlakala

    # Hlukanisa ngesihlakala (translate every point relative to the wrist).
    amaphuzu_asuselwe = [(x - ax, y - ay, z - az) for x, y, z in amaphuzu]

    # Thola ibanga phakathi kwesihlakala nesisekelo somunwe ophakathi, elisiza
    # njengesikali sokulingana (distance used as the scale reference).
    rx, ry, rz = amaphuzu_asuselwe[INDEKISI_YESISEKELO_SOMUNWE_OPHAKATHI]
    ibanga = (rx**2 + ry**2 + rz**2) ** 0.5
    if ibanga < IPHUTHA_ELINCANE:
        ibanga = IPHUTHA_ELINCANE

    amaphuzu_alinganisiwe = [(x / ibanga, y / ibanga, z / ibanga) for x, y, z in amaphuzu_asuselwe]

    return hlanganisa_amaphuzu(amaphuzu_alinganisiwe)
