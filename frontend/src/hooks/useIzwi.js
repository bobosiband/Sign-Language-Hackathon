// I-hook yezwi: isebenzisa i-Web Speech API ukukhuluma umbhalo, mahhala
// futhi ngaphandle kokuxhumana ne-inthanethi (the voice hook: uses the Web
// Speech API to speak text -- free, and works offline in most browsers).
import { useCallback, useEffect, useState } from "react";

export function useIzwi() {
  const [amazwi, setAmazwi] = useState([]);
  const [iyakhuluma, setIyakhuluma] = useState(false);
  const iyatholakala = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!iyatholakala) return undefined;

    const layisha_amazwi = () => setAmazwi(window.speechSynthesis.getVoices());
    layisha_amazwi();
    window.speechSynthesis.onvoiceschanged = layisha_amazwi;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [iyatholakala]);

  const khuluma = useCallback(
    (umbhalo, { igamaLezwi, isivinini = 1 } = {}) => {
      if (!iyatholakala || !umbhalo.trim()) return;

      window.speechSynthesis.cancel();
      const umusho = new SpeechSynthesisUtterance(umbhalo);
      umusho.rate = isivinini;
      if (igamaLezwi) {
        const izwi = amazwi.find((iz) => iz.name === igamaLezwi);
        if (izwi) umusho.voice = izwi;
      }
      umusho.onstart = () => setIyakhuluma(true);
      umusho.onend = () => setIyakhuluma(false);
      umusho.onerror = () => setIyakhuluma(false);

      window.speechSynthesis.speak(umusho);
    },
    [amazwi, iyatholakala],
  );

  const misa = useCallback(() => {
    if (iyatholakala) window.speechSynthesis.cancel();
    setIyakhuluma(false);
  }, [iyatholakala]);

  return { amazwi, khuluma, misa, iyakhuluma, iyatholakala };
}
