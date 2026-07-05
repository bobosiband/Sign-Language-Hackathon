# Ukuhlola i-API: izindlela ze-REST kanye ne-WebSocket (tests for the REST
# routes and the WebSocket endpoint).

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.ukulinganisa import INANI_LEZINOMBOLO


@pytest.fixture(scope="module")
def iklayenti():
    # I-lifespan ye-app iyaqalwa kuphela uma i-TestClient isetshenziswa
    # njenge-context manager (the app's startup/shutdown lifespan only runs
    # when TestClient is used as a context manager).
    with TestClient(app) as iklayenti_yangempela:
        yield iklayenti_yangempela


def test_impilo_ibuyisela_impendulo_ephumelele(iklayenti):
    impendulo = iklayenti.get("/health")
    assert impendulo.status_code == 200
    assert impendulo.json()["isimo"] == "kuhamba kahle"


def test_imininingwane_yemodeli_ibuyisela_imininingwane_efanele(iklayenti):
    impendulo = iklayenti.get("/api/model-info")
    assert impendulo.status_code == 200
    idatha = impendulo.json()
    assert idatha["iqeqeshiwe"] is True
    assert idatha["inani_lamaphuzu_alindelekile"] == INANI_LEZINOMBOLO
    assert "A" in idatha["izinhlamvu_eziqeqeshiwe"]


def test_izinhlamvu_ezitholakalayo_zibuyisela_uhlu_oluzeleyo(iklayenti):
    impendulo = iklayenti.get("/api/letters")
    assert impendulo.status_code == 200
    idatha = impendulo.json()
    assert "A" in idatha["izinhlamvu"]
    assert "J" not in idatha["izinhlamvu"]
    assert "Z" not in idatha["izinhlamvu"]
    assert idatha["izincazelo"]["A"]


def test_i_websocket_ibuyisela_ukubikezela_okuqondile(iklayenti):
    with iklayenti.websocket_connect("/ws") as isokhethi:
        isokhethi.send_json({"amaphuzu": [0.01] * INANI_LEZINOMBOLO})
        impendulo = isokhethi.receive_json()
        assert "uhlamvu" in impendulo
        assert 0.0 <= impendulo["ukuzethemba"] <= 1.0


def test_i_websocket_iphatha_ubude_obungalungile_ngaphandle_kokuphahlazeka(iklayenti):
    with iklayenti.websocket_connect("/ws") as isokhethi:
        isokhethi.send_json({"amaphuzu": [0.1, 0.2, 0.3]})
        impendulo = isokhethi.receive_json()
        assert "iphutha" in impendulo

        # Ikhulumo iyaqhubeka emva kwephutha (the connection survives the
        # error and keeps serving valid requests).
        isokhethi.send_json({"amaphuzu": [0.01] * INANI_LEZINOMBOLO})
        impendulo_elandelayo = isokhethi.receive_json()
        assert "uhlamvu" in impendulo_elandelayo


def test_i_websocket_iphatha_idatha_engelona_uhlu_ngaphandle_kokuphahlazeka(iklayenti):
    with iklayenti.websocket_connect("/ws") as isokhethi:
        isokhethi.send_json({"amaphuzu": "not-a-list"})
        impendulo = isokhethi.receive_json()
        assert "iphutha" in impendulo


def test_ukuthumela_isibonelo_nokuphinda_ukuqeqesha(iklayenti):
    impendulo = iklayenti.post(
        "/api/samples",
        json={"amaphuzu": [0.05] * INANI_LEZINOMBOLO, "igama": "hello"},
    )
    assert impendulo.status_code == 201
    assert impendulo.json()["igama"] == "hello"

    impendulo_yokuqeqesha = iklayenti.post("/api/retrain")
    assert impendulo_yokuqeqesha.status_code == 200
    assert "hello" in impendulo_yokuqeqesha.json()["izinhlamvu_eziqeqeshiwe"]

    impendulo_yokususa = iklayenti.delete("/api/samples/hello")
    assert impendulo_yokususa.status_code == 200


def test_ukuthumela_isibonelo_esinobude_obungalungile_kubuyisela_iphutha(iklayenti):
    impendulo = iklayenti.post(
        "/api/samples",
        json={"amaphuzu": [0.05, 0.06], "igama": "hello"},
    )
    assert impendulo.status_code == 422
