// Ukuhlola isakhi somusho: ibalo lokubamba, ukuphumula, nokuhlela komusho
// (tests for the sentence builder: hold-to-type stability counting,
// cooldown, and sentence editing).
import { describe, expect, it } from "vitest";
import { isimoSokuqala, simamisaUmusho, UBUDE_BOKUPHUMULA_OKUMISIWE } from "../src/utils/isakhiSomusho";

const IZILUNGISELELO = { ubudeBokubamba: 5, umkhawuloWokuzethemba: 0.6 };

function bikezela(isimo, uhlamvu, ukuzethemba = 0.9) {
  return simamisaUmusho(isimo, { uhlobo: "BIKEZELO", uhlamvu, ukuzethemba }, IZILUNGISELELO);
}

describe("simamisaUmusho", () => {
  it("ayengezi lutho uma kungabambekile kwaneleyo (does not type before the hold duration is reached)", () => {
    let isimo = isimoSokuqala();
    for (let i = 0; i < IZILUNGISELELO.ubudeBokubamba - 1; i += 1) {
      isimo = bikezela(isimo, "A");
    }
    expect(isimo.umusho).toBe("");
    expect(isimo.inqubekelaphambili).toBeCloseTo(0.8, 5);
  });

  it("iyangeza uhlamvu emva kokubamba isikhathi esanele (types the letter once the hold duration is reached)", () => {
    let isimo = isimoSokuqala();
    for (let i = 0; i < IZILUNGISELELO.ubudeBokubamba; i += 1) {
      isimo = bikezela(isimo, "A");
    }
    expect(isimo.umusho).toBe("A");
    expect(isimo.okwenzekile).toEqual({ uhlobo: "ENGEZIWE", uhlamvu: "A" });
    expect(isimo.inqubekelaphambili).toBe(0);
  });

  it("iyaphumula emva kokungeza, ingaphindi ingeze ngokushesha (cools down after typing, not re-adding instantly)", () => {
    let isimo = isimoSokuqala();
    for (let i = 0; i < IZILUNGISELELO.ubudeBokubamba; i += 1) {
      isimo = bikezela(isimo, "A");
    }
    expect(isimo.umusho).toBe("A");

    // Iqhubeka ibanjwe, kodwa isesikhathini sokuphumula (still held, but
    // within the cooldown window) -- must not double-type immediately.
    isimo = bikezela(isimo, "A");
    expect(isimo.umusho).toBe("A");
  });

  it("ukubamba isikhathi eside kuyaphinda kungeze uhlamvu, emva kokuphumula (holding long enough -- through the cooldown -- repeats the letter)", () => {
    let isimo = isimoSokuqala();
    const ibalo_elanele = IZILUNGISELELO.ubudeBokubamba * 2 + UBUDE_BOKUPHUMULA_OKUMISIWE;
    for (let i = 0; i < ibalo_elanele; i += 1) {
      isimo = bikezela(isimo, "A");
    }
    expect(isimo.umusho).toBe("AA");
  });

  it("ukuzethemba okuphansi kususa ibalo (low confidence resets the stability counter)", () => {
    let isimo = isimoSokuqala();
    isimo = bikezela(isimo, "A");
    isimo = bikezela(isimo, "A");
    isimo = bikezela(isimo, "A", 0.1);
    expect(isimo.ibalo).toBe(0);
    expect(isimo.uhlamvuAmanje).toBeNull();
  });

  it("ukushintsha uhlamvu kuqala ibalo kabusha (switching letters restarts the counter)", () => {
    let isimo = isimoSokuqala();
    isimo = bikezela(isimo, "A");
    isimo = bikezela(isimo, "A");
    isimo = bikezela(isimo, "B");
    expect(isimo.ibalo).toBe(1);
    expect(isimo.uhlamvuAmanje).toBe("B");
  });

  it("i-HLEHLISA isusa uhlamvu lokugcina (backspace removes the last character)", () => {
    let isimo = { ...isimoSokuqala(), umusho: "AB" };
    isimo = simamisaUmusho(isimo, { uhlobo: "HLEHLISA" }, IZILUNGISELELO);
    expect(isimo.umusho).toBe("A");
  });

  it("i-SULA isusa yonke into (clear empties the whole sentence)", () => {
    let isimo = { ...isimoSokuqala(), umusho: "ABC" };
    isimo = simamisaUmusho(isimo, { uhlobo: "SULA" }, IZILUNGISELELO);
    expect(isimo.umusho).toBe("");
  });

  it("i-SIKHALA ingeza isikhala (space appends a space character)", () => {
    let isimo = { ...isimoSokuqala(), umusho: "AB" };
    isimo = simamisaUmusho(isimo, { uhlobo: "SIKHALA" }, IZILUNGISELELO);
    expect(isimo.umusho).toBe("AB ");
  });
});
