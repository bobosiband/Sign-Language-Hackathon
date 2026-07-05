// Fundisa: fundisa uhlelo uphawu lwakho, ulubize ngegama, bese ulusebenzisa
// masinyane (teach the app your own sign, label it, and use it right away).
// Lokhu kuphatha inkinga yokuthi ukwenza izandla kuyahluka phakathi
// kwabantu nezindawo (this addresses how signing varies between people and
// regions, e.g. Auslan vs ASL).
import { useCallback, useState } from "react";
import IsimoIbhena from "./IsimoIbhena";

const IBALO_ELINCANE_LEZIBONELO = 5;

export default function Fundisa({ amaphuzuAlinganisiwe, isandlaSibonakele, iphothiYangemuva }) {
  const [igama, setIgama] = useState("");
  const [ibalo, setIbalo] = useState(0);
  const [umlayezo, setUmlayezo] = useState(null);
  const [kuyalayisha, setKuyalayisha] = useState(false);

  const thathaIsibonelo = useCallback(async () => {
    if (!igama.trim()) {
      setUmlayezo({ uhlobo: "iphutha", umbhalo: "Give your custom sign a label first." });
      return;
    }
    if (!isandlaSibonakele || !amaphuzuAlinganisiwe) {
      setUmlayezo({ uhlobo: "iphutha", umbhalo: "Show your hand to the camera before capturing a sample." });
      return;
    }
    try {
      const impendulo = await fetch(`${iphothiYangemuva}/api/samples`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amaphuzu: amaphuzuAlinganisiwe, igama: igama.trim() }),
      });
      if (!impendulo.ok) throw new Error("The server rejected that sample.");
      const idatha = await impendulo.json();
      setIbalo(idatha.isibalo_samanje);
      setUmlayezo({ uhlobo: "olujwayelekile", umbhalo: `Captured sample ${idatha.isibalo_samanje} for "${igama.trim()}".` });
    } catch (iphutha) {
      setUmlayezo({ uhlobo: "iphutha", umbhalo: `Could not reach the backend: ${iphutha.message}` });
    }
  }, [igama, isandlaSibonakele, amaphuzuAlinganisiwe, iphothiYangemuva]);

  const qeqesha = useCallback(async () => {
    setKuyalayisha(true);
    try {
      const impendulo = await fetch(`${iphothiYangemuva}/api/retrain`, { method: "POST" });
      if (!impendulo.ok) throw new Error("Training failed on the server.");
      setUmlayezo({ uhlobo: "olujwayelekile", umbhalo: `Model retrained -- "${igama.trim()}" is ready to use now.` });
    } catch (iphutha) {
      setUmlayezo({ uhlobo: "iphutha", umbhalo: `Could not reach the backend: ${iphutha.message}` });
    } finally {
      setKuyalayisha(false);
    }
  }, [iphothiYangemuva, igama]);

  return (
    <div className="fundisa-uhlu">
      <p>
        Teach the app one of your own signs -- perfect for gestures that vary between signers or regions
        (e.g. a wave meaning &quot;hello&quot;).
      </p>
      <div className="izilungiselelo-into">
        <label htmlFor="fundisa-igama">Label for your sign</label>
        <input
          id="fundisa-igama"
          type="text"
          value={igama}
          onChange={(umcimbi) => setIgama(umcimbi.target.value)}
          placeholder="e.g. hello"
        />
      </div>
      <div className="umusho-izinkinobho">
        <button type="button" className="inkinobho" onClick={thathaIsibonelo}>
          Capture sample ({ibalo} so far)
        </button>
        <button
          type="button"
          className="inkinobho inkinobho--eqavile"
          onClick={qeqesha}
          disabled={kuyalayisha || ibalo < IBALO_ELINCANE_LEZIBONELO}
        >
          {kuyalayisha ? "Training..." : "Train model with my samples"}
        </button>
      </div>
      {ibalo > 0 && ibalo < IBALO_ELINCANE_LEZIBONELO && (
        <p>Capture at least {IBALO_ELINCANE_LEZIBONELO} samples (from a few slightly different angles) before training.</p>
      )}
      {umlayezo && <IsimoIbhena uhlobo={umlayezo.uhlobo} umlayezo={umlayezo.umbhalo} />}
    </div>
  );
}
