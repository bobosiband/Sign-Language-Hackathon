// App: isihloko esikhulu esihlanganisa yonke imisebenzi ye-Uxhumano (the
// root component wiring together every Uxhumano feature: live translation,
// practice mode, teach-your-own-signs, settings, and the session
// transcript).
import { useCallback, useEffect, useRef, useState } from "react";
import Ikhamera from "./components/Ikhamera";
import Uhlamvu from "./components/Uhlamvu";
import Umusho from "./components/Umusho";
import Izilungiselelo from "./components/Izilungiselelo";
import Ukuzijwayeza from "./components/Ukuzijwayeza";
import Fundisa from "./components/Fundisa";
import Umlando from "./components/Umlando";
import Imfihlo from "./components/Imfihlo";
import IsimoIbhena from "./components/IsimoIbhena";
import Isimemezelo from "./components/Isimemezelo";
import { useIzilungiselelo } from "./hooks/useIzilungiselelo";
import { useIzwi } from "./hooks/useIzwi";
import { useUmusho } from "./hooks/useUmusho";
import { useIxhumanisi, IZIMO_ZOXHUMANO } from "./hooks/useIxhumanisi";
import { IPHOTHI_YANGEMUVA, URL_YE_WEBSOCKET } from "./config";

const AMATHEBHU = [
  { isihluzo: "humusha", igama: "Translate" },
  { isihluzo: "zijwayeza", igama: "Practice" },
  { isihluzo: "fundisa", igama: "Teach a sign" },
  { isihluzo: "izilungiselelo", igama: "Settings" },
];

let ibalo_lomlando = 0;

export default function App() {
  const { izilungiselelo, shintsha } = useIzilungiselelo();
  const { amazwi, khuluma, iyakhuluma } = useIzwi();
  const { isimo: isimoSomusho, engezaBikezelo, hlehlisa, sula, engezaIsikhala } = useUmusho(izilungiselelo);
  const [ithebhu, setIthebhu] = useState("humusha");
  const [amaphuzuAlinganisiweAmanje, setAmaphuzuAlinganisiweAmanje] = useState(null);
  const [isandlaSibonakeleAmanje, setIsandlaSibonakeleAmanje] = useState(false);
  const [imicimbiYomlando, setImicimbiYomlando] = useState([]);
  const [isimemezelo, setIsimemezelo] = useState("");
  const okwenzekileOkugcinwe = useRef(null);

  const onImpendulo = useCallback(
    (impendulo) => {
      if (impendulo.iphutha) return;
      engezaBikezelo(impendulo.uhlamvu, impendulo.ukuzethemba);
    },
    [engezaBikezelo],
  );

  const { isimo: isimoXhumano, thumela } = useIxhumanisi(URL_YE_WEBSOCKET, onImpendulo);

  const onAmaphuzu = useCallback(
    (amaphuzuAlinganisiwe, isandlaSibonakele) => {
      setAmaphuzuAlinganisiweAmanje(amaphuzuAlinganisiwe);
      setIsandlaSibonakeleAmanje(isandlaSibonakele);
      if (amaphuzuAlinganisiwe && isandlaSibonakele) {
        thumela(amaphuzuAlinganisiwe);
      } else {
        engezaBikezelo(null, 0);
      }
    },
    [thumela, engezaBikezelo],
  );

  // Sebenzisa izilungiselelo zokufinyeleleka kuyo yonke ikhasi (apply
  // accessibility settings app-wide via CSS custom properties/attributes).
  useEffect(() => {
    const impande = document.documentElement;
    impande.style.setProperty("--uxhumano-isilinganiso-fonti", String(izilungiselelo.usayizoFonti));
    impande.setAttribute("data-umehluko", izilungiselelo.umehlukoOphezulu ? "ophezulu" : "ojwayelekile");
    impande.setAttribute("data-ukunyakaza", izilungiselelo.ukunciphisaUmnyakazo ? "ncipha" : "jwayelekile");
  }, [izilungiselelo.usayizoFonti, izilungiselelo.umehlukoOphezulu, izilungiselelo.ukunciphisaUmnyakazo]);

  // Qopha umlando futhi umemezele lapho kungezwa uhlamvu, kususwe, noma
  // kukhulunywe (log the transcript and announce to screen readers whenever
  // a letter is appended, cleared, or spoken). I-ref iyavimbela ukubhalwa
  // kabili kwesenzakalo esisodwa (the ref guards against double-logging the
  // same event across re-renders).
  useEffect(() => {
    const okwenzekile = isimoSomusho.okwenzekile;
    if (!okwenzekile || okwenzekile === okwenzekileOkugcinwe.current) return;
    okwenzekileOkugcinwe.current = okwenzekile;

    if (okwenzekile.uhlobo === "ENGEZIWE") {
      setIsimemezelo(okwenzekile.uhlamvu === " " ? "Space added" : `Letter ${okwenzekile.uhlamvu} typed`);
      ibalo_lomlando += 1;
      setImicimbiYomlando((okwamanje) => [
        ...okwamanje,
        {
          isihluzo: `m-${ibalo_lomlando}`,
          umbhalo: okwenzekile.uhlamvu === " " ? "Typed: (space)" : `Typed: "${okwenzekile.uhlamvu}"`,
          isikhathi: new Date().toLocaleTimeString(),
        },
      ]);
    } else if (okwenzekile.uhlobo === "SULIWE") {
      setIsimemezelo("Sentence cleared");
    } else if (okwenzekile.uhlobo === "HLEHLISIWE") {
      setIsimemezelo("Last character deleted");
    }
  }, [isimoSomusho.okwenzekile]);

  const khulumaUmusho = useCallback(
    (umbhalo) => {
      khuluma(umbhalo, { igamaLezwi: izilungiselelo.igamaLezwi, isivinini: izilungiselelo.isivininiSezwi });
      setIsimemezelo(`Speaking: ${umbhalo}`);
      ibalo_lomlando += 1;
      setImicimbiYomlando((okwamanje) => [
        ...okwamanje,
        { isihluzo: `m-${ibalo_lomlando}`, umbhalo: `Spoke: "${umbhalo}"`, isikhathi: new Date().toLocaleTimeString() },
      ]);
    },
    [khuluma, izilungiselelo.igamaLezwi, izilungiselelo.isivininiSezwi],
  );

  return (
    <div className="uxhumano-app">
      <Isimemezelo umlayezo={isimemezelo} />

      <header className="umqondo-wesihloko">
        <h1>Uxhumano</h1>
        <Imfihlo />
      </header>

      {isimoXhumano !== IZIMO_ZOXHUMANO.IXHUNYIWE && (
        <IsimoIbhena
          uhlobo="isixwayiso"
          umlayezo={
            isimoXhumano === IZIMO_ZOXHUMANO.IYAXHUMA
              ? "Connecting to the recognition server..."
              : "Backend unreachable -- hand tracking still works, but letter recognition is paused. Retrying automatically."
          }
        />
      )}

      <nav className="uxhumano-amathebhu" role="tablist" aria-label="Uxhumano modes">
        {AMATHEBHU.map((ithebhu_ngayinye) => (
          <button
            key={ithebhu_ngayinye.isihluzo}
            role="tab"
            type="button"
            id={`ithebhu-${ithebhu_ngayinye.isihluzo}`}
            aria-selected={ithebhu === ithebhu_ngayinye.isihluzo}
            aria-controls={`ipaneli-${ithebhu_ngayinye.isihluzo}`}
            onClick={() => setIthebhu(ithebhu_ngayinye.isihluzo)}
          >
            {ithebhu_ngayinye.igama}
          </button>
        ))}
      </nav>

      <div className="ikhamera-isigaba">
        <Ikhamera izilungiselelo={izilungiselelo} onAmaphuzu={onAmaphuzu} />
        <div className="uhlamvu-isigaba">
          <Uhlamvu
            uhlamvu={isimoSomusho.uhlamvuAmanje}
            ukuzethemba={isimoSomusho.ukuzethemba}
            inqubekelaphambili={isimoSomusho.inqubekelaphambili}
            isandlaSibonakele={isandlaSibonakeleAmanje}
          />
        </div>
      </div>

      <section
        id="ipaneli-humusha"
        role="tabpanel"
        aria-labelledby="ithebhu-humusha"
        hidden={ithebhu !== "humusha"}
        className="ipaneli"
      >
        <Umusho
          umusho={isimoSomusho.umusho}
          hlehlisa={hlehlisa}
          sula={sula}
          engezaIsikhala={engezaIsikhala}
          khuluma={khulumaUmusho}
          iyakhuluma={iyakhuluma}
        />
      </section>

      <section
        id="ipaneli-zijwayeza"
        role="tabpanel"
        aria-labelledby="ithebhu-zijwayeza"
        hidden={ithebhu !== "zijwayeza"}
        className="ipaneli"
      >
        <Ukuzijwayeza
          uhlamvuAmanje={isimoSomusho.uhlamvuAmanje}
          ukuzethemba={isimoSomusho.ukuzethemba}
          izilungiselelo={izilungiselelo}
        />
      </section>

      <section
        id="ipaneli-fundisa"
        role="tabpanel"
        aria-labelledby="ithebhu-fundisa"
        hidden={ithebhu !== "fundisa"}
        className="ipaneli"
      >
        <Fundisa
          amaphuzuAlinganisiwe={amaphuzuAlinganisiweAmanje}
          isandlaSibonakele={isandlaSibonakeleAmanje}
          iphothiYangemuva={IPHOTHI_YANGEMUVA}
        />
      </section>

      <section
        id="ipaneli-izilungiselelo"
        role="tabpanel"
        aria-labelledby="ithebhu-izilungiselelo"
        hidden={ithebhu !== "izilungiselelo"}
        className="ipaneli"
      >
        <Izilungiselelo izilungiselelo={izilungiselelo} shintsha={shintsha} amazwi={amazwi} />
      </section>

      <section className="ipaneli" aria-label="Session transcript">
        <h2>Session transcript</h2>
        <Umlando imicimbi={imicimbiYomlando} />
      </section>
    </div>
  );
}
