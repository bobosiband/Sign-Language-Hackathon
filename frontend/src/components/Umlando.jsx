// Umlando: umlando wesheshini wakho konke okubhaliwe/okukhulunyiwe,
// okungakhishwa noma kukopishwe (the session transcript: a running history
// of everything typed or spoken, exportable and copyable -- useful for
// real conversations, e.g. showing a pharmacist).
import { useCallback, useState } from "react";

export default function Umlando({ imicimbi }) {
  const [ikopishiwe, setIkopishiwe] = useState(false);

  const kopisha = useCallback(async () => {
    const umbhalo = imicimbi.map((umcimbi) => `[${umcimbi.isikhathi}] ${umcimbi.umbhalo}`).join("\n");
    try {
      await navigator.clipboard.writeText(umbhalo);
      setIkopishiwe(true);
      setTimeout(() => setIkopishiwe(false), 2000);
    } catch {
      // Ukukopisha akutholakali kulencazelo yebhrawuza -- akunankinga
      // (clipboard API unavailable in this browser context -- not fatal).
    }
  }, [imicimbi]);

  const khishwa = useCallback(() => {
    const umbhalo = imicimbi.map((umcimbi) => `[${umcimbi.isikhathi}] ${umcimbi.umbhalo}`).join("\n");
    const ibhulobhu = new Blob([umbhalo], { type: "text/plain" });
    const ikhweli = URL.createObjectURL(ibhulobhu);
    const isixhumanisi = document.createElement("a");
    isixhumanisi.href = ikhweli;
    isixhumanisi.download = "uxhumano-transcript.txt";
    isixhumanisi.click();
    URL.revokeObjectURL(ikhweli);
  }, [imicimbi]);

  return (
    <div>
      <div className="umusho-izinkinobho" style={{ marginBottom: "0.75rem" }}>
        <button type="button" className="inkinobho" onClick={kopisha} disabled={imicimbi.length === 0}>
          {ikopishiwe ? "Copied!" : "Copy transcript"}
        </button>
        <button type="button" className="inkinobho" onClick={khishwa} disabled={imicimbi.length === 0}>
          Download transcript
        </button>
      </div>
      {imicimbi.length === 0 ? (
        <p>Nothing typed or spoken yet this session.</p>
      ) : (
        <ul className="umlando-uhlu" aria-label="Session transcript">
          {imicimbi.map((umcimbi) => (
            <li key={umcimbi.isihluzo} className="umlando-into">
              <span>{umcimbi.umbhalo}</span>
              <span className="umlando-isikhathi">{umcimbi.isikhathi}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
