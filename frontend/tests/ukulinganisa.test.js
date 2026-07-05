// Ukuhlola ukulinganisa kwamaphuzu -- kufanele kufane nempendulo ye-backend
// (tests for landmark normalization -- must match the backend's behavior
// exactly, using the shared cross-language fixture).
import { describe, expect, it } from "vitest";
import { linganisaAmaphuzu, INANI_LEZINOMBOLO } from "../src/utils/ukulinganisa";
import idatha from "../../fixtures/ukulinganisa_fixture.json";

function amaphuzuEnto(ubuningi = INANI_LEZINOMBOLO) {
  return Array.from({ length: ubuningi }, (_, i) => Math.sin(i) * 0.4 + 0.5);
}

describe("linganisaAmaphuzu", () => {
  it("ibuyisela izinombolo ezingu-63 njalo (always returns 63 numbers)", () => {
    expect(linganisaAmaphuzu(amaphuzuEnto())).toHaveLength(INANI_LEZINOMBOLO);
  });

  it("akuguquki ngokuya kwendawo (translation invariant)", () => {
    const amaphuzu = amaphuzuEnto();
    const ahanjisiwe = amaphuzu.map((inani, i) => inani + (i % 3 === 0 ? 3.7 : i % 3 === 1 ? -1.2 : 0.9));

    const okuqhelekile = linganisaAmaphuzu(amaphuzu);
    const okuhanjisiwe = linganisaAmaphuzu(ahanjisiwe);

    okuqhelekile.forEach((inani, i) => {
      expect(inani).toBeCloseTo(okuhanjisiwe[i], 9);
    });
  });

  it("abuguquki ngobungako (scale invariant)", () => {
    const amaphuzu = amaphuzuEnto();
    const akhulisiwe = amaphuzu.map((inani) => inani * 2.5);

    const okuqhelekile = linganisaAmaphuzu(amaphuzu);
    const okukhulisiwe = linganisaAmaphuzu(akhulisiwe);

    okuqhelekile.forEach((inani, i) => {
      expect(inani).toBeCloseTo(okukhulisiwe[i], 9);
    });
  });

  it("iphatha amaphuzu angu-zero ngaphandle kokuphahlazeka (handles all-zero input without crashing)", () => {
    const okuphumayo = linganisaAmaphuzu(new Array(INANI_LEZINOMBOLO).fill(0));
    expect(okuphumayo).toHaveLength(INANI_LEZINOMBOLO);
    okuphumayo.forEach((inani) => expect(Number.isFinite(inani)).toBe(true));
  });

  it("iphakamisa iphutha uma ubude bungalungile (raises on wrong-length input)", () => {
    expect(() => linganisaAmaphuzu([0.1, 0.2, 0.3])).toThrow();
  });

  it("iyafana nempendulo ye-backend kudatha efanayo (matches the backend on shared fixture data)", () => {
    const okuphumayo = linganisaAmaphuzu(idatha.raw);
    okuphumayo.forEach((inani, i) => {
      expect(inani).toBeCloseTo(idatha.normalized[i], 6);
    });
  });

  it("i-fixture ye-zero iyafana (zero fixture matches)", () => {
    const okuphumayo = linganisaAmaphuzu(idatha.zero_raw);
    okuphumayo.forEach((inani, i) => {
      expect(inani).toBeCloseTo(idatha.zero_normalized[i], 6);
    });
  });

  it("i-fixture ehanjisiwe iyafana nengahanjiswanga (translated fixture matches untranslated)", () => {
    const okuphumayo = linganisaAmaphuzu(idatha.translated_raw);
    okuphumayo.forEach((inani, i) => {
      expect(inani).toBeCloseTo(idatha.translated_normalized_should_match_normalized[i], 6);
    });
  });
});
