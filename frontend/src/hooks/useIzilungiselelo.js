// I-hook yezilungiselelo: igcina izilungiselelo zokufinyeleleka ku-state
// futhi ku-localStorage (the settings hook: keeps accessibility settings in
// state and mirrors them to localStorage so they survive a reload).
import { useCallback, useEffect, useState } from "react";
import { ISIKHIYA_SOKULONDOLOZA, IZILUNGISELELO_EZIMISIWE } from "../data/izilungiseleloOkumisiwe";

function layishaOkulondoloziwe() {
  try {
    const okulondoloziwe = window.localStorage.getItem(ISIKHIYA_SOKULONDOLOZA);
    if (!okulondoloziwe) return IZILUNGISELELO_EZIMISIWE;
    return { ...IZILUNGISELELO_EZIMISIWE, ...JSON.parse(okulondoloziwe) };
  } catch {
    return IZILUNGISELELO_EZIMISIWE;
  }
}

export function useIzilungiselelo() {
  const [izilungiselelo, setIzilungiselelo] = useState(layishaOkulondoloziwe);

  useEffect(() => {
    try {
      window.localStorage.setItem(ISIKHIYA_SOKULONDOLOZA, JSON.stringify(izilungiselelo));
    } catch {
      // Ukulondoloza akutholakali (localStorage unavailable) -- akunankinga,
      // izilungiselelo zisasebenza kulesi sesheni (not fatal, settings still
      // work for this session).
    }
  }, [izilungiselelo]);

  const shintsha = useCallback((igama, inani) => {
    setIzilungiselelo((okwamanje) => ({ ...okwamanje, [igama]: inani }));
  }, []);

  const setha_konke = useCallback(() => setIzilungiselelo(IZILUNGISELELO_EZIMISIWE), []);

  return { izilungiselelo, shintsha, setha_konke };
}
