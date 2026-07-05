// I-hook ye-WebSocket: ithumela amaphuzu alinganisiwe kusekelo, izame
// kabusha uma ixhumo liphukile (the WebSocket hook: streams normalized
// landmarks to the backend and auto-reconnects if the connection drops).
import { useCallback, useEffect, useRef, useState } from "react";

export const IZIMO_ZOXHUMANO = {
  IYAXHUMA: "iyaxhuma",
  IXHUNYIWE: "ixhunyiwe",
  IPHUKILE: "iphukile",
};

const IBALO_ELIKHULU_LOKUZAMA_KABUSHA = 10;
const ISIKHATHI_ESISUSELWAYO_MS = 1000;
const ISIKHATHI_ESIKHULU_MS = 10000;

/**
 * Phatha ukuxhumana ne-WebSocket ye-backend, uphinde uzame kabusha
 * ngokwenyuka kwesikhathi uma kuphukile (manage the backend WebSocket
 * connection, with exponential backoff reconnection on drop).
 *
 * @param {string} url
 * @param {(impendulo: {uhlamvu?: string, ukuzethemba?: number, iphutha?: string}) => void} onImpendulo
 */
export function useIxhumanisi(url, onImpendulo) {
  const [isimo, setIsimo] = useState(IZIMO_ZOXHUMANO.IYAXHUMA);
  const isokhethi = useRef(null);
  const ibaloLokuzama = useRef(0);
  const ithaimawuthi = useRef(null);
  const onImpenduloRef = useRef(onImpendulo);
  const kuyaphelile = useRef(false);

  onImpenduloRef.current = onImpendulo;

  const xhuma = useCallback(() => {
    if (kuyaphelile.current) return;
    setIsimo(IZIMO_ZOXHUMANO.IYAXHUMA);

    const socket = new WebSocket(url);
    isokhethi.current = socket;

    socket.onopen = () => {
      ibaloLokuzama.current = 0;
      setIsimo(IZIMO_ZOXHUMANO.IXHUNYIWE);
    };

    socket.onmessage = (umlayezo) => {
      try {
        const idatha = JSON.parse(umlayezo.data);
        onImpenduloRef.current?.(idatha);
      } catch {
        onImpenduloRef.current?.({ iphutha: "Received a malformed message from the server." });
      }
    };

    socket.onerror = () => {
      setIsimo(IZIMO_ZOXHUMANO.IPHUKILE);
    };

    socket.onclose = () => {
      setIsimo(IZIMO_ZOXHUMANO.IPHUKILE);
      if (kuyaphelile.current) return;
      if (ibaloLokuzama.current >= IBALO_ELIKHULU_LOKUZAMA_KABUSHA) return;

      const ukulinda = Math.min(
        ISIKHATHI_ESISUSELWAYO_MS * 2 ** ibaloLokuzama.current,
        ISIKHATHI_ESIKHULU_MS,
      );
      ibaloLokuzama.current += 1;
      ithaimawuthi.current = setTimeout(xhuma, ukulinda);
    };
  }, [url]);

  useEffect(() => {
    kuyaphelile.current = false;
    xhuma();
    return () => {
      kuyaphelile.current = true;
      clearTimeout(ithaimawuthi.current);
      isokhethi.current?.close();
    };
  }, [xhuma]);

  const thumela = useCallback((amaphuzu) => {
    if (isokhethi.current?.readyState === WebSocket.OPEN) {
      isokhethi.current.send(JSON.stringify({ amaphuzu }));
    }
  }, []);

  return { isimo, thumela };
}
