"""Izimo zezandla zezinhlamvu (canonical handshape specs for each letter).

Le fayela iwuchungechunge oluyisisekelo (this file is the single source of
truth) sokugoba kwemiyunwe (finger curl) nokwahlukana (spread) kwalunye
uhlamvu lwe-alfabhethi engaguquki (static ASL alphabet), esetshenziswa:

  1. Ukwakha idatha eyenziwe ngobuchule ye-mediphayela (imodeli/idatha.py) --
     to build synthetic training landmarks.
  2. Ukubonisa isibonelo semo yesandla ku-Ukuzijwayeza mode ye-frontend
     (mirrored in frontend/src/data/izimo.js) -- to render the reference
     handshape hint in Practice Mode.

AMABALA (Note): Amabhalo lawa awukhiqizi izithombe zangempela zesandla --
ayisibonelo esilula kuphela sokuthi imiyunwe igotshiwe kangakanani (0 =
yelulekile ngokuphelele, 1 = igoqiwe ngokuphelele). Awafani ncamashi
nesandla sangempela sesiZulu/sesiNgisi (ASL) ngenxa yobunzima bokulinganisa
ukuwela komunwe (finger-crossing) ne-orientation. Bheka docs/ARCHITECTURE.md
nombhalo we-README ngokugcweleyo. (These values are a deliberately
simplified approximation, not a photographically accurate reference -- see
the Honest Framing section of the README.)
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class IsimoSesihlamvu:
    """Isimo esisodwa sesandla (one letter's canonical handshape spec)."""

    # Ukugoqwa komunwe ngamunye: (isithupha, ikhomba, ophakathi, insimbi, ucikicane)
    # (per-finger curl 0..1: thumb, index, middle, ring, pinky).
    ukugoqwa: tuple[float, float, float, float, float]

    # Ukwahlukana kweminwe emine (kungasona isithupha) kusukela endaweni
    # yazo ejwayelekile (fan-spread multiplier for the four non-thumb
    # fingers; 1.0 = normal, <1 = closer together, >1 = wider apart).
    ukwahlukana: float

    # Incazelo yesandla ngamazwi, ebonwa ku-Practice Mode
    # (plain-English description shown in Practice Mode).
    incazelo: str


IZIMO_ZEZINHLAMVU: dict[str, IsimoSesihlamvu] = {
    "A": IsimoSesihlamvu((0.30, 1.00, 1.00, 1.00, 1.00), 1.0, "Fist with the thumb resting against the side of the index finger."),
    "B": IsimoSesihlamvu((1.00, 0.00, 0.00, 0.00, 0.00), 1.0, "Flat hand, four fingers straight up together, thumb folded across the palm."),
    "C": IsimoSesihlamvu((0.50, 0.50, 0.50, 0.50, 0.50), 1.0, "All fingers and thumb curved evenly to form the shape of the letter C."),
    "D": IsimoSesihlamvu((0.60, 0.00, 0.80, 1.00, 1.00), 1.0, "Index finger straight up, thumb touches the curled middle finger."),
    "E": IsimoSesihlamvu((0.80, 0.90, 0.90, 0.90, 0.90), 1.0, "Fingertips curled down to touch the tucked thumb, like a claw."),
    "F": IsimoSesihlamvu((0.50, 0.50, 0.00, 0.00, 0.00), 1.0, "Thumb and index finger touch to form a circle, other three fingers stand up straight."),
    "G": IsimoSesihlamvu((0.30, 0.10, 1.00, 1.00, 1.00), 1.0, "Index finger and thumb point straight out to the side, other fingers curled."),
    "H": IsimoSesihlamvu((0.80, 0.10, 0.10, 1.00, 1.00), 1.0, "Index and middle fingers point out to the side together, thumb folded across."),
    "I": IsimoSesihlamvu((0.80, 1.00, 1.00, 1.00, 0.00), 1.0, "Pinky finger straight up, other fingers curled into the palm."),
    "K": IsimoSesihlamvu((0.30, 0.10, 0.10, 1.00, 1.00), 1.3, "Index and middle fingers up in a V, thumb touching between them."),
    "L": IsimoSesihlamvu((0.00, 0.00, 1.00, 1.00, 1.00), 1.0, "Thumb and index finger extended to form an L, other fingers curled."),
    "M": IsimoSesihlamvu((0.90, 1.00, 1.00, 1.00, 0.70), 1.0, "Fist with the thumb tucked under the first three fingers."),
    "N": IsimoSesihlamvu((0.90, 1.00, 1.00, 0.80, 0.60), 1.0, "Fist with the thumb tucked under the first two fingers."),
    "O": IsimoSesihlamvu((0.60, 0.60, 0.60, 0.60, 0.60), 1.0, "Fingers and thumb curved together to form the shape of the letter O."),
    "P": IsimoSesihlamvu((0.40, 0.20, 0.15, 0.95, 0.95), 1.3, "Like K, but the hand points downward."),
    "Q": IsimoSesihlamvu((0.35, 0.15, 0.95, 0.95, 0.95), 1.0, "Like G, but the hand points downward."),
    "R": IsimoSesihlamvu((0.90, 0.15, 0.20, 1.00, 1.00), 0.8, "Index and middle fingers crossed, other fingers curled."),
    "S": IsimoSesihlamvu((1.00, 1.00, 1.00, 1.00, 1.00), 1.0, "Closed fist with the thumb wrapped across the front of the fingers."),
    "T": IsimoSesihlamvu((0.70, 0.95, 0.90, 1.00, 1.00), 1.0, "Fist with the thumb tucked between the index and middle fingers."),
    "U": IsimoSesihlamvu((0.80, 0.05, 0.05, 1.00, 1.00), 0.4, "Index and middle fingers together, pointing straight up."),
    "V": IsimoSesihlamvu((0.60, 0.05, 0.05, 1.00, 1.00), 1.6, "Index and middle fingers spread apart in a V, pointing up."),
    "W": IsimoSesihlamvu((0.70, 0.05, 0.05, 0.05, 1.00), 1.5, "Index, middle, and ring fingers spread apart, pointing up."),
    "X": IsimoSesihlamvu((0.60, 0.50, 1.00, 1.00, 1.00), 1.0, "Index finger hooked at the middle joint, other fingers curled."),
    "Y": IsimoSesihlamvu((0.00, 1.00, 1.00, 1.00, 0.00), 1.0, "Thumb and pinky stretched out, other fingers curled -- the 'hang loose' shape."),
}

# Uhlu lwezinhlamvu ezisekelwayo, ngokulandelana okuqinile (ordered list of
# supported letters). I-alfabhethi engaguquki ye-ASL, ihlukanisa u-J no-Z
# ngoba badinga ukunyakaza (the static ASL alphabet, excluding J and Z since
# they require in-air motion rather than a fixed handshape).
IZINHLAMVU_EZISEKELWAYO: tuple[str, ...] = tuple(IZIMO_ZEZINHLAMVU.keys())
