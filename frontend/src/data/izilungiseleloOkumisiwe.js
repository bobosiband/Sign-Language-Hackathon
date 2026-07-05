// Izilungiselelo ezimisiwe zokufinyeleleka, ezilondolozwa ku-localStorage
// (default accessibility settings, persisted to localStorage).

export const ISIKHIYA_SOKULONDOLOZA = "uxhumano.izilungiselelo";

export const IZILUNGISELELO_EZIMISIWE = {
  // Ibalo lamafreymu okubamba uhlamvu ngaphambi kokuba lingezwe (frames a
  // letter must be held steady before it is appended).
  ubudeBokubamba: 20,
  // Umkhawulo omncane wokuzethemba ukuze ibalo liqalwe (minimum confidence
  // before a frame counts toward the hold).
  umkhawuloWokuzethemba: 0.6,
  // Isilinganiso sosayizi wamagama (font-size multiplier).
  usayizoFonti: 1,
  // Ithimu enomehluko omkhulu, efaka i-AAA (high-contrast theme).
  umehlukoOphezulu: false,
  // Ncipha noma susa yonke imidwebo enyakazayo (reduced-motion mode).
  ukunciphisaUmnyakazo: false,
  // Isandla esisebenzayo: kokubili, sokudla, noma sokunxele (active hand:
  // both, right, or left).
  isandlaEsisebenzayo: "kokubili",
  // Isivinini sokukhuluma se-Web Speech API (speech rate).
  isivininiSezwi: 1,
  // Ulimi lohlelo lokusebenzisa (UI language toggle -- stretch feature).
  ulimi: "en",
};
