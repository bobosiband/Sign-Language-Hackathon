#!/usr/bin/env python3
"""Iskripthi: qamba idatha, qeqesha imodeli, ilondoloze (script to generate
synthetic training data, train the classifier, and save the artifact that
ships with the repo).

Kusetshenziswa (usage):
    python backend/scripts/qeqesha_imodeli.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

from app.imodeli.idatha import qamba_idatha_yokuqeqesha
from app.imodeli.imodeli import Imodeli, INDLELA_EMISIWE_YEMODELI


def main() -> None:
    print("Qamba idatha eyenziwe ngobuchule... (generating synthetic data)")
    amaphuzu, izinhlamvu = qamba_idatha_yokuqeqesha(ubuningi_ngalunye=90)
    print(f"  -> {len(amaphuzu)} izibonelo kuzo {len(set(izinhlamvu))} izinhlamvu (samples across letters)")

    amaphuzu_okuqeqesha, amaphuzu_okuhlola, izinhlamvu_okuqeqesha, izinhlamvu_okuhlola = train_test_split(
        amaphuzu, izinhlamvu, test_size=0.2, random_state=42, stratify=izinhlamvu
    )

    print("Qeqesha imodeli... (training model)")
    imodeli = Imodeli()
    imodeli.qeqesha(amaphuzu_okuqeqesha, izinhlamvu_okuqeqesha)

    izibikezelo = [imodeli.bikezela(iphuzu)[0] for iphuzu in amaphuzu_okuhlola]
    ukunemba = accuracy_score(izinhlamvu_okuhlola, izibikezelo)
    print(f"Ukunemba kwe-holdout (holdout accuracy): {ukunemba:.3f}")

    imodeli.londoloza(INDLELA_EMISIWE_YEMODELI)
    print(f"Imodeli ilondoloziwe (model saved) -> {INDLELA_EMISIWE_YEMODELI}")


if __name__ == "__main__":
    main()
