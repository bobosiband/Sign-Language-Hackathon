// Umusho: ibha yomusho eyakhiwe kanye nezinkinobho zokuhlela nokukhuluma
// (the sentence bar: the built-up sentence, plus edit and speak controls).
// Izinkinobho zisebenza ngemibhaqo yekhibhodi (Backspace, Shift+Backspace,
// Space) futhi nangokuchofoza (buttons also respond to keyboard shortcuts).
import { useEffect } from "react";

const AMAELIMENTHI_ANGENZIWA_KUWO = new Set(["INPUT", "TEXTAREA", "SELECT", "BUTTON"]);

export default function Umusho({ umusho, hlehlisa, sula, engezaIsikhala, khuluma, iyakhuluma }) {
  useEffect(() => {
    function phatha_ikhibhodi(umcimbi) {
      if (AMAELIMENTHI_ANGENZIWA_KUWO.has(umcimbi.target.tagName)) return;

      if (umcimbi.key === "Backspace" && umcimbi.shiftKey) {
        umcimbi.preventDefault();
        sula();
      } else if (umcimbi.key === "Backspace") {
        umcimbi.preventDefault();
        hlehlisa();
      } else if (umcimbi.key === " ") {
        umcimbi.preventDefault();
        engezaIsikhala();
      }
    }

    window.addEventListener("keydown", phatha_ikhibhodi);
    return () => window.removeEventListener("keydown", phatha_ikhibhodi);
  }, [hlehlisa, sula, engezaIsikhala]);

  return (
    <div className="umusho-ibha">
      <div
        className="umusho-umbhalo"
        role="textbox"
        aria-readonly="true"
        aria-label="Sentence built so far"
        data-testid="umusho-umbhalo"
      >
        {umusho || <span style={{ opacity: 0.5 }}>Hold a letter shape steady to start typing...</span>}
      </div>
      <div className="umusho-izinkinobho">
        <button type="button" className="inkinobho" onClick={engezaIsikhala} aria-keyshortcuts="Space">
          Space
        </button>
        <button type="button" className="inkinobho" onClick={hlehlisa} aria-keyshortcuts="Backspace">
          Backspace
        </button>
        <button type="button" className="inkinobho inkinobho--eyingozi" onClick={sula} aria-keyshortcuts="Shift+Backspace">
          Clear
        </button>
        <button
          type="button"
          className="inkinobho inkinobho--eqavile"
          onClick={() => khuluma(umusho)}
          disabled={!umusho.trim() || iyakhuluma}
        >
          {iyakhuluma ? "Speaking..." : "Speak sentence"}
        </button>
      </div>
    </div>
  );
}
