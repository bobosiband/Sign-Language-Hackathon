// Ukulinganisa kwamaphuzu esandla (hand landmark normalization) -- must stay
// byte-for-byte identical in behaviour to backend/app/ukulinganisa.py. See
// docs/ARCHITECTURE.md for the full written contract, and
// fixtures/ukulinganisa_fixture.json for the shared cross-language test data.

// Inani lamaphuzu ngokwesandla esisodwa (landmarks per hand).
export const INANI_LAMAPHUZU = 21;

// Inani lezinombolo emva kokwendlaleka (63 = 21 landmarks * 3 coordinates).
export const INANI_LEZINOMBOLO = INANI_LAMAPHUZU * 3;

// Indeksi yesihlakala (wrist landmark index).
export const INDEKISI_YESIHLAKALA = 0;

// Indeksi yesisekelo somunwe ophakathi (middle-finger MCP), esetshenziswa
// njengesikali (used as the scale reference point).
export const INDEKISI_YESISEKELO_SOMUNWE_OPHAKATHI = 9;

// Inani elincane elivimbela ukwehlukaniswa ngo-0 (epsilon guarding division
// by zero).
export const IPHUTHA_ELINCANE = 1e-6;

/**
 * Guqula uhlu oluyi-flat lube ngamaphuzu angama-21 e-[x, y, z] (convert a
 * flat 63-length array into 21 [x, y, z] point triples).
 */
export function hlukanisaAmaphuzu(amaphuzuAyindilinga) {
  if (amaphuzuAyindilinga.length !== INANI_LEZINOMBOLO) {
    throw new Error(
      `Kulindeleke izinombolo ezingu-${INANI_LEZINOMBOLO}, kodwa kutholwe ezingu-${amaphuzuAyindilinga.length} ` +
        `(expected ${INANI_LEZINOMBOLO} numbers, got ${amaphuzuAyindilinga.length})`,
    );
  }
  const amaphuzu = [];
  for (let i = 0; i < INANI_LAMAPHUZU; i += 1) {
    amaphuzu.push([
      amaphuzuAyindilinga[i * 3],
      amaphuzuAyindilinga[i * 3 + 1],
      amaphuzuAyindilinga[i * 3 + 2],
    ]);
  }
  return amaphuzu;
}

/**
 * Guqula amaphuzu abuyele kuhlu oluyi-flat (flatten points back to a list).
 */
export function hlanganisaAmaphuzu(amaphuzu) {
  const okuphumayo = [];
  for (const [x, y, z] of amaphuzu) {
    okuphumayo.push(x, y, z);
  }
  return okuphumayo;
}

/**
 * Linganisa amaphuzu esandla ukuze kuqhathwe okufanayo njalo (normalize hand
 * landmarks so comparisons are always apples-to-apples).
 *
 * Uhlelo (algorithm) -- must match backend/app/ukulinganisa.py exactly:
 *   1. Susa ukususa ngesihlakala (translate so the wrist is the origin).
 *   2. Yehlisa ngobungako besikhala phakathi kwesihlakala nesisekelo
 *      somunwe ophakathi (scale down by the wrist-to-middle-finger-MCP
 *      distance).
 *   3. Phumisela uhlu oluyi-flat lwezinombolo ezingu-63.
 *
 * @param {number[]} amaphuzuAyindilinga - 63 raw floats from MediaPipe Hands.
 * @returns {number[]} 63 normalized floats: wrist-centered and scale-invariant.
 */
export function linganisaAmaphuzu(amaphuzuAyindilinga) {
  const amaphuzu = hlukanisaAmaphuzu(amaphuzuAyindilinga);

  const [ax, ay, az] = amaphuzu[INDEKISI_YESIHLAKALA];

  // Hlukanisa ngesihlakala (translate every point relative to the wrist).
  const amaphuzuAsuselwe = amaphuzu.map(([x, y, z]) => [x - ax, y - ay, z - az]);

  // Thola ibanga phakathi kwesihlakala nesisekelo somunwe ophakathi
  // (distance used as the scale reference).
  const [rx, ry, rz] = amaphuzuAsuselwe[INDEKISI_YESISEKELO_SOMUNWE_OPHAKATHI];
  let ibanga = Math.sqrt(rx ** 2 + ry ** 2 + rz ** 2);
  if (ibanga < IPHUTHA_ELINCANE) {
    ibanga = IPHUTHA_ELINCANE;
  }

  const amaphuzuAlinganisiwe = amaphuzuAsuselwe.map(([x, y, z]) => [
    x / ibanga,
    y / ibanga,
    z / ibanga,
  ]);

  return hlanganisaAmaphuzu(amaphuzuAlinganisiwe);
}
