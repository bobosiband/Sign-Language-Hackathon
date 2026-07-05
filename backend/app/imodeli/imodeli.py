"""Imodeli yokuhlukanisa izinhlamvu (the letter classifier model).

Isongela i-RandomForestClassifier ye-scikit-learn ukuze kube nezindlela
ezilula zokuqeqesha, ukubikezela, ukulondoloza, nokulayisha (wraps a
scikit-learn RandomForestClassifier with simple train / predict / save /
load methods used throughout the backend).
"""

from __future__ import annotations

from pathlib import Path

import joblib
from sklearn.ensemble import RandomForestClassifier

# Indawo yokuqondwa yokulondoloza imodeli esifundisiwe kusengaphambili
# (default path where the pretrained model artifact ships in the repo).
INDLELA_EMISIWE_YEMODELI = Path(__file__).parent / "imodeli.joblib"


class Imodeli:
    """Isihlelo esihlukanisa amaphuzu alinganisiwe abe uhlamvu (classifier
    that turns normalized landmarks into a predicted letter)."""

    def __init__(self) -> None:
        self.isihlelo: RandomForestClassifier | None = None
        self.izinhlamvu_eziqeqeshiwe: list[str] = []

    @property
    def iqeqeshiwe(self) -> bool:
        """Ngabe imodeli isiqeqeshiwe yini (has the model been trained)?"""
        return self.isihlelo is not None

    def qeqesha(self, amaphuzu: list[list[float]], izinhlamvu: list[str]) -> None:
        """Qeqesha isihlelo ngamaphuzu alinganisiwe namalebula (train the
        classifier on normalized landmark vectors and their labels)."""
        if len(amaphuzu) != len(izinhlamvu):
            raise ValueError("Amaphuzu nezinhlamvu kufanele kube nobude obufanayo (must be the same length)")
        if not amaphuzu:
            raise ValueError("Ayikho idatha yokuqeqesha (no training data supplied)")

        isihlelo = RandomForestClassifier(
            n_estimators=150,
            max_depth=None,
            random_state=42,
            n_jobs=-1,
        )
        isihlelo.fit(amaphuzu, izinhlamvu)

        self.isihlelo = isihlelo
        self.izinhlamvu_eziqeqeshiwe = sorted(set(izinhlamvu))

    def bikezela(self, amaphuzu_alinganisiwe: list[float]) -> tuple[str, float]:
        """Bikezela uhlamvu kanye nokuzethemba kwalo (predict a letter and
        its confidence) for one normalized 63-length landmark vector."""
        if not self.iqeqeshiwe:
            raise RuntimeError("Imodeli ayikaqeqeshwa (the model has not been trained or loaded yet)")

        isihlelo = self.isihlelo
        assert isihlelo is not None

        amathuba = isihlelo.predict_proba([amaphuzu_alinganisiwe])[0]
        indeksi_ephezulu = amathuba.argmax()
        uhlamvu = isihlelo.classes_[indeksi_ephezulu]
        ukuzethemba = float(amathuba[indeksi_ephezulu])

        return str(uhlamvu), ukuzethemba

    def londoloza(self, indlela: Path | str = INDLELA_EMISIWE_YEMODELI) -> None:
        """Londoloza imodeli efayelini (save the trained model to disk)."""
        if not self.iqeqeshiwe:
            raise RuntimeError("Ayikho imodeli eqeqeshiwe okufanele ilondolozwe (nothing trained to save)")
        joblib.dump({"isihlelo": self.isihlelo, "izinhlamvu": self.izinhlamvu_eziqeqeshiwe}, indlela)

    @classmethod
    def layisha(cls, indlela: Path | str = INDLELA_EMISIWE_YEMODELI) -> "Imodeli":
        """Layisha imodeli esuka efayelini (load a previously saved model)."""
        okulondoloziwe = joblib.load(indlela)
        imodeli = cls()
        imodeli.isihlelo = okulondoloziwe["isihlelo"]
        imodeli.izinhlamvu_eziqeqeshiwe = okulondoloziwe["izinhlamvu"]
        return imodeli
