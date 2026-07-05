# Ukuhlola ukulinganisa kwamaphuzu (tests for hand landmark normalization).

import json
import math
from pathlib import Path

import pytest

from app.ukulinganisa import (
    INANI_LEZINOMBOLO,
    linganisa_amaphuzu,
)

IDATHA_YOKUHLOLA = Path(__file__).resolve().parents[2] / "fixtures" / "ukulinganisa_fixture.json"


def _amaphuzu_ento(ubuningi: int = INANI_LEZINOMBOLO) -> list[float]:
    """Yakha uhlu lwamaphuzu ahlukene ukuze kuhlolwe ngawo (build a list of
    distinct, deterministic landmark values for testing)."""
    return [round(math.sin(i) * 0.4 + 0.5, 6) for i in range(ubuningi)]


def test_ubude_bempendulo_bulingana_nokulindelekile():
    """Impendulo kufanele ibe nezinombolo ezingu-63 njalo (output must always
    have 63 numbers)."""
    okuphumayo = linganisa_amaphuzu(_amaphuzu_ento())
    assert len(okuphumayo) == INANI_LEZINOMBOLO


def test_ukususa_akuguquki_ngokuya_kwendawo():
    """Ukuhambisa wonke amaphuzu ngokulinganayo akushintshi impendulo
    (translation invariance: shifting every point by the same constant
    offset must not change the normalized output)."""
    amaphuzu = _amaphuzu_ento()
    amaphuzu_ahanjisiwe = [v + (3.7 if i % 3 == 0 else (-1.2 if i % 3 == 1 else 0.9)) for i, v in enumerate(amaphuzu)]

    okuqhelekile = linganisa_amaphuzu(amaphuzu)
    okuhanjisiwe = linganisa_amaphuzu(amaphuzu_ahanjisiwe)

    for a, b in zip(okuqhelekile, okuhanjisiwe):
        assert a == pytest.approx(b, abs=1e-9)


def test_ubungako_abuguquki_uma_kwenziwa_uphinda():
    """Ukukhulisa noma ukuncipisa isandla sonke akushintshi impendulo
    (scale invariance: scaling every point by the same factor around the
    wrist must not change the normalized output)."""
    amaphuzu = _amaphuzu_ento()
    amaphuzu_akhulisiwe = [v * 2.5 for v in amaphuzu]

    okuqhelekile = linganisa_amaphuzu(amaphuzu)
    okukhulisiwe = linganisa_amaphuzu(amaphuzu_akhulisiwe)

    for a, b in zip(okuqhelekile, okukhulisiwe):
        assert a == pytest.approx(b, abs=1e-9)


def test_amaphuzu_angu_zero_awuphahlazi():
    """Uma wonke amaphuzu engu-zero (isandla asikho), akufanele kuphahlazeke
    noma kubuyiswe u-NaN (all-zero input -- e.g. no hand detected -- must not
    crash or produce NaN/inf)."""
    okuphumayo = linganisa_amaphuzu([0.0] * INANI_LEZINOMBOLO)
    assert len(okuphumayo) == INANI_LEZINOMBOLO
    for inombolo in okuphumayo:
        assert math.isfinite(inombolo)


def test_ubude_obungalungile_buphakamisa_iphutha():
    """Uhlu olungenabude obulindelekile kufanele luphakamise iphutha
    elicacile (a wrong-length input must raise a clear error)."""
    with pytest.raises(ValueError):
        linganisa_amaphuzu([0.1, 0.2, 0.3])


def test_isihlakala_siba_ngu_zero_emva_kokulinganiswa():
    """Isihlakala (indeksi 0) kufanele sibe ngu-(0, 0, 0) emva
    kokulinganiswa, ngoba sona uqobo iyona ndawo esisuselwa kuyo (the wrist
    landmark itself must become the origin after normalization)."""
    okuphumayo = linganisa_amaphuzu(_amaphuzu_ento())
    assert okuphumayo[0] == pytest.approx(0.0, abs=1e-9)
    assert okuphumayo[1] == pytest.approx(0.0, abs=1e-9)
    assert okuphumayo[2] == pytest.approx(0.0, abs=1e-9)


class TestUhlu:
    """Ukuhlola ngokusebenzisa idatha efanayo ne-frontend (cross-checks using
    the fixture shared with the frontend Vitest suite)."""

    @pytest.fixture(autouse=True)
    def _layisha_idatha(self):
        with open(IDATHA_YOKUHLOLA) as ifayela:
            self.idatha = json.load(ifayela)

    def test_okulinganisiwe_kuyafana_nokulindelekile(self):
        okuphumayo = linganisa_amaphuzu(self.idatha["raw"])
        for a, b in zip(okuphumayo, self.idatha["normalized"]):
            assert a == pytest.approx(b, abs=1e-6)

    def test_i_zero_iyafana_nokulindelekile(self):
        okuphumayo = linganisa_amaphuzu(self.idatha["zero_raw"])
        for a, b in zip(okuphumayo, self.idatha["zero_normalized"]):
            assert a == pytest.approx(b, abs=1e-6)

    def test_okuhanjisiwe_kuyafana_nokungahanjisiwe(self):
        okuphumayo = linganisa_amaphuzu(self.idatha["translated_raw"])
        for a, b in zip(okuphumayo, self.idatha["translated_normalized_should_match_normalized"]):
            assert a == pytest.approx(b, abs=1e-6)
