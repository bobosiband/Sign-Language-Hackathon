# Ukuhlola imodeli: ukuqeqesha nokubikezela (tests for training + prediction).

import pytest

from app.imodeli.idatha import qamba_idatha_yokuqeqesha
from app.imodeli.imodeli import Imodeli


@pytest.fixture(scope="module")
def imodeli_eqeqeshiwe() -> Imodeli:
    amaphuzu, izinhlamvu = qamba_idatha_yokuqeqesha(ubuningi_ngalunye=30)
    imodeli = Imodeli()
    imodeli.qeqesha(amaphuzu, izinhlamvu)
    return imodeli


def test_imodeli_ayikaqeqeshwa_ekuqaleni():
    """Imodeli entsha ayikaqeqeshwa, futhi iyala ukubikezela (a fresh model
    is untrained and refuses to predict)."""
    imodeli = Imodeli()
    assert imodeli.iqeqeshiwe is False
    with pytest.raises(RuntimeError):
        imodeli.bikezela([0.0] * 63)


def test_ukuqeqesha_kufinyelela_ukunemba_okuqondile(imodeli_eqeqeshiwe: Imodeli):
    """Ukuqeqesha kwedatha eyenziwe ngobuchule kufanele kufinyelele ukunemba
    okuphezulu kudatha efanayo (training reaches high self-consistency
    accuracy on the synthetic data it was trained on -- sanity check that
    the classes are learnable, not evidence of real-world accuracy)."""
    amaphuzu, izinhlamvu = qamba_idatha_yokuqeqesha(ubuningi_ngalunye=10)
    okulungile = sum(
        1 for iphuzu, uhlamvu in zip(amaphuzu, izinhlamvu) if imodeli_eqeqeshiwe.bikezela(iphuzu)[0] == uhlamvu
    )
    ukunemba = okulungile / len(izinhlamvu)
    assert ukunemba > 0.7


def test_ukubikezela_kubuyisela_uhlamvu_nokuzethemba_okufanele(imodeli_eqeqeshiwe: Imodeli):
    """Ukubikezela kubuyisela uhlamvu olusekelwayo kanye nokuzethemba
    okuphakathi kuka-0 no-1 (prediction returns a supported letter and a
    confidence between 0 and 1)."""
    uhlamvu, ukuzethemba = imodeli_eqeqeshiwe.bikezela([0.01] * 63)
    assert uhlamvu in imodeli_eqeqeshiwe.izinhlamvu_eziqeqeshiwe
    assert 0.0 <= ukuzethemba <= 1.0


def test_ukulondoloza_nokulayisha_kuyaphindaphinda(tmp_path, imodeli_eqeqeshiwe: Imodeli):
    """Imodeli elondoloziwe futhi yalayishwa iphinda ibikezele okufanayo
    (a saved-then-loaded model reproduces the same predictions)."""
    indlela = tmp_path / "imodeli_yokuhlola.joblib"
    imodeli_eqeqeshiwe.londoloza(indlela)

    imodeli_elayishiwe = Imodeli.layisha(indlela)
    isibonelo = [0.02] * 63

    assert imodeli_elayishiwe.bikezela(isibonelo) == imodeli_eqeqeshiwe.bikezela(isibonelo)


def test_ukuqeqesha_ubude_obungafani_kuphakamisa_iphutha():
    """Uma amaphuzu nezinhlamvu zingafani ngobude, kufanele kuphakanyiswe
    iphutha elicacile (mismatched feature/label lengths raise a clear
    error)."""
    imodeli = Imodeli()
    with pytest.raises(ValueError):
        imodeli.qeqesha([[0.0] * 63], ["A", "B"])
