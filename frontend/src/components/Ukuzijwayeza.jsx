// Ukuzijwayeza: imodi yokufunda -- ibonisa uhlamvu okuhloswe ngalo, incazelo
// yesimo sesandla, bese inikeza impendulo ngokushesha (Practice Mode: shows
// a target letter and handshape hint, then gives instant feedback). Lokhu
// kuguqula ithuluzi kusuka ekuhumusheni kuphela kuya ekufundiseni abantu
// abezwayo ukuxhumana ngezandla (this flips the tool from translation-only
// into teaching hearing people to sign).
import { useEffect, useState } from "react";
import { AMAGAMA_EMINWE, IZINCAZELO_ZEZIMO, IZINHLAMVU_EZISEKELWAYO, UKUGOQWA_KWEZIMO } from "../data/izimo";

function ikhethaUhlamvuOlusha(ongakhethwa) {
  const okukhethwayo = IZINHLAMVU_EZISEKELWAYO.filter((u) => u !== ongakhethwa);
  return okukhethwayo[Math.floor(Math.random() * okukhethwayo.length)];
}

function UkugoqwaIbhasekhwama({ uhlamvu }) {
  const ukugoqwa = UKUGOQWA_KWEZIMO[uhlamvu];
  return (
    <div className="ukugoqwa-ibha-sekhwama" role="img" aria-label={IZINCAZELO_ZEZIMO[uhlamvu]}>
      {ukugoqwa.map((inani, indeksi) => (
        <div
          key={AMAGAMA_EMINWE[indeksi]}
          className="ukugoqwa-ibha"
          style={{ height: `max(6px, ${Math.round((1 - inani) * 100)}%)` }}
          title={AMAGAMA_EMINWE[indeksi]}
        />
      ))}
    </div>
  );
}

export default function Ukuzijwayeza({ uhlamvuAmanje, ukuzethemba, izilungiselelo }) {
  const [iphuzu, setIphuzu] = useState(() => ikhethaUhlamvuOlusha(null));
  const [uchungechunge, setUchungechunge] = useState(0);
  const [impumelelo, setImpumelelo] = useState(false);
  const [okuqoshiwe, setOkuqoshiwe] = useState(false);

  useEffect(() => {
    const kuyafana = uhlamvuAmanje === iphuzu && ukuzethemba >= izilungiselelo.umkhawuloWokuzethemba;

    if (!kuyafana) {
      setOkuqoshiwe(false);
      return undefined;
    }
    if (okuqoshiwe) return undefined;

    setOkuqoshiwe(true);
    setUchungechunge((okwamanje) => okwamanje + 1);
    setImpumelelo(true);

    const ithaimawuthi = setTimeout(() => {
      setImpumelelo(false);
      setIphuzu((okwamanje) => ikhethaUhlamvuOlusha(okwamanje));
      setOkuqoshiwe(false);
    }, 1200);

    return () => clearTimeout(ithaimawuthi);
  }, [uhlamvuAmanje, ukuzethemba, iphuzu, izilungiselelo.umkhawuloWokuzethemba, okuqoshiwe]);

  return (
    <div className="ukuzijwayeza-isigaba">
      <div>
        <p style={{ margin: 0, color: "var(--uxhumano-umbhalo-omncane)" }}>Try to make this handshape:</p>
        <div className="uhlamvu-inombolo" data-testid="ukuzijwayeza-iphuzu">
          {iphuzu}
        </div>
        <p>{IZINCAZELO_ZEZIMO[iphuzu]}</p>
        <UkugoqwaIbhasekhwama uhlamvu={iphuzu} />
      </div>
      <div>
        <p style={{ fontSize: "1.2rem" }}>
          Streak: <strong data-testid="uchungechunge">{uchungechunge}</strong>
        </p>
        <p aria-live="polite">{impumelelo ? "Correct! Well done." : "Hold the handshape steady in front of the camera."}</p>
      </div>
    </div>
  );
}
