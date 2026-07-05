// I-hook yomusho: songela i-isakhiSomusho (i-reducer emsulwa) ku-isimo
// se-React (the sentence hook: wraps the pure isakhiSomusho reducer in
// React state).
import { useCallback, useReducer } from "react";
import { isimoSokuqala, simamisaUmusho } from "../utils/isakhiSomusho";

export function useUmusho(izilungiselelo) {
  const [isimo, thumela] = useReducer(
    (isimoSamanje, isenzo) => simamisaUmusho(isimoSamanje, isenzo, izilungiselelo),
    undefined,
    isimoSokuqala,
  );

  const engezaBikezelo = useCallback(
    (uhlamvu, ukuzethemba) => thumela({ uhlobo: "BIKEZELO", uhlamvu, ukuzethemba }),
    [],
  );
  const hlehlisa = useCallback(() => thumela({ uhlobo: "HLEHLISA" }), []);
  const sula = useCallback(() => thumela({ uhlobo: "SULA" }), []);
  const engezaIsikhala = useCallback(() => thumela({ uhlobo: "SIKHALA" }), []);

  return { isimo, engezaBikezelo, hlehlisa, sula, engezaIsikhala };
}
