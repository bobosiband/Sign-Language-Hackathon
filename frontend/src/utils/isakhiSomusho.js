// Isakhi somusho: uhlelo lokwakha umusho ngokubamba uhlamvu isikhathi
// esanele (the sentence builder: the pure, framework-free hold-to-type
// state machine). Kuhlukaniswe ku-hook ye-React ukuze kulinganwe kalula
// ngaphandle kwe-DOM (kept separate from the React hook so it can be unit
// tested without any DOM).

// Ibalo lamafrேamu okuphumula emva kokungeza uhlamvu, ukuvimbela ukuphindwa
// ngephutha (frames of cooldown after a letter is appended, to avoid an
// accidental instant repeat).
export const UBUDE_BOKUPHUMULA_OKUMISIWE = 15;

/**
 * Isimo sokuqala se-isakhi somusho (the builder's initial state).
 */
export function isimoSokuqala() {
  return {
    umusho: "",
    uhlamvuAmanje: null,
    ibalo: 0,
    ibaloLokuphumula: 0,
    inqubekelaphambili: 0,
    okwenzekile: null,
  };
}

/**
 * Simamisa umusho: guqula isimo ngokwesenzo esiphathiwe (the reducer: apply
 * one action to the state and return the next state).
 *
 * @param {object} isimo - Isimo samanje (current state).
 * @param {object} isenzo - {uhlobo: "BIKEZELO"|"HLEHLISA"|"SULA"|"SIKHALA", ...}
 * @param {object} izilungiselelo - {ubudeBokubamba, umkhawuloWokuzethemba}
 */
export function simamisaUmusho(isimo, isenzo, izilungiselelo) {
  const { ubudeBokubamba, umkhawuloWokuzethemba } = izilungiselelo;

  switch (isenzo.uhlobo) {
    case "BIKEZELO": {
      const { uhlamvu, ukuzethemba } = isenzo;
      const akutholakalanga = !uhlamvu || ukuzethemba < umkhawuloWokuzethemba;

      if (akutholakalanga) {
        return {
          ...isimo,
          uhlamvuAmanje: null,
          ibalo: 0,
          inqubekelaphambili: 0,
          okwenzekile: null,
        };
      }

      if (isimo.ibaloLokuphumula > 0) {
        return {
          ...isimo,
          uhlamvuAmanje: uhlamvu,
          ibaloLokuphumula: isimo.ibaloLokuphumula - 1,
          inqubekelaphambili: 0,
          okwenzekile: null,
        };
      }

      const ibaloEsha = uhlamvu === isimo.uhlamvuAmanje ? isimo.ibalo + 1 : 1;
      const inqubekelaphambiliEsha = Math.min(ibaloEsha / ubudeBokubamba, 1);

      if (ibaloEsha >= ubudeBokubamba) {
        return {
          ...isimo,
          umusho: isimo.umusho + uhlamvu,
          uhlamvuAmanje: uhlamvu,
          ibalo: 0,
          ibaloLokuphumula: UBUDE_BOKUPHUMULA_OKUMISIWE,
          inqubekelaphambili: 0,
          okwenzekile: { uhlobo: "ENGEZIWE", uhlamvu },
        };
      }

      return {
        ...isimo,
        uhlamvuAmanje: uhlamvu,
        ibalo: ibaloEsha,
        inqubekelaphambili: inqubekelaphambiliEsha,
        okwenzekile: null,
      };
    }

    case "HLEHLISA":
      if (!isimo.umusho) return { ...isimo, okwenzekile: null };
      return {
        ...isimo,
        umusho: isimo.umusho.slice(0, -1),
        okwenzekile: { uhlobo: "HLEHLISIWE" },
      };

    case "SULA":
      return {
        ...isimoSokuqala(),
        okwenzekile: { uhlobo: "SULIWE" },
      };

    case "SIKHALA":
      return {
        ...isimo,
        umusho: isimo.umusho + " ",
        okwenzekile: { uhlobo: "ENGEZIWE", uhlamvu: " " },
      };

    default:
      return isimo;
  }
}
