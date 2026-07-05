// Izincazelo zezimo zezandla, ezisetshenziswa yi-Practice Mode (handshape
// descriptions used by Practice Mode). Kuvela kokufanayo ne-
// backend/app/izimo.py -- kufanele kuhlale kuvumelana (mirrored from
// backend/app/izimo.py -- must be kept in sync; see docs/GLOSSARY.md).

export const IZINHLAMVU_EZISEKELWAYO = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N",
  "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y",
];

export const IZINCAZELO_ZEZIMO = {
  A: "Fist with the thumb resting against the side of the index finger.",
  B: "Flat hand, four fingers straight up together, thumb folded across the palm.",
  C: "All fingers and thumb curved evenly to form the shape of the letter C.",
  D: "Index finger straight up, thumb touches the curled middle finger.",
  E: "Fingertips curled down to touch the tucked thumb, like a claw.",
  F: "Thumb and index finger touch to form a circle, other three fingers stand up straight.",
  G: "Index finger and thumb point straight out to the side, other fingers curled.",
  H: "Index and middle fingers point out to the side together, thumb folded across.",
  I: "Pinky finger straight up, other fingers curled into the palm.",
  K: "Index and middle fingers up in a V, thumb touching between them.",
  L: "Thumb and index finger extended to form an L, other fingers curled.",
  M: "Fist with the thumb tucked under the first three fingers.",
  N: "Fist with the thumb tucked under the first two fingers.",
  O: "Fingers and thumb curved together to form the shape of the letter O.",
  P: "Like K, but the hand points downward.",
  Q: "Like G, but the hand points downward.",
  R: "Index and middle fingers crossed, other fingers curled.",
  S: "Closed fist with the thumb wrapped across the front of the fingers.",
  T: "Fist with the thumb tucked between the index and middle fingers.",
  U: "Index and middle fingers together, pointing straight up.",
  V: "Index and middle fingers spread apart in a V, pointing up.",
  W: "Index, middle, and ring fingers spread apart, pointing up.",
  X: "Index finger hooked at the middle joint, other fingers curled.",
  Y: "Thumb and pinky stretched out, other fingers curled -- the 'hang loose' shape.",
};

// Ukugoqwa komunwe ngamunye ngalunye uhlamvu: (isithupha, ikhomba,
// ophakathi, insimba, ucikicane), 0 = yelulekile, 1 = igoqiwe ngokuphelele
// (per-finger curl for the simple bar-chart handshape indicator).
export const UKUGOQWA_KWEZIMO = {
  A: [0.30, 1.00, 1.00, 1.00, 1.00],
  B: [1.00, 0.00, 0.00, 0.00, 0.00],
  C: [0.50, 0.50, 0.50, 0.50, 0.50],
  D: [0.60, 0.00, 0.80, 1.00, 1.00],
  E: [0.80, 0.90, 0.90, 0.90, 0.90],
  F: [0.50, 0.50, 0.00, 0.00, 0.00],
  G: [0.30, 0.10, 1.00, 1.00, 1.00],
  H: [0.80, 0.10, 0.10, 1.00, 1.00],
  I: [0.80, 1.00, 1.00, 1.00, 0.00],
  K: [0.30, 0.10, 0.10, 1.00, 1.00],
  L: [0.00, 0.00, 1.00, 1.00, 1.00],
  M: [0.90, 1.00, 1.00, 1.00, 0.70],
  N: [0.90, 1.00, 1.00, 0.80, 0.60],
  O: [0.60, 0.60, 0.60, 0.60, 0.60],
  P: [0.40, 0.20, 0.15, 0.95, 0.95],
  Q: [0.35, 0.15, 0.95, 0.95, 0.95],
  R: [0.90, 0.15, 0.20, 1.00, 1.00],
  S: [1.00, 1.00, 1.00, 1.00, 1.00],
  T: [0.70, 0.95, 0.90, 1.00, 1.00],
  U: [0.80, 0.05, 0.05, 1.00, 1.00],
  V: [0.60, 0.05, 0.05, 1.00, 1.00],
  W: [0.70, 0.05, 0.05, 0.05, 1.00],
  X: [0.60, 0.50, 1.00, 1.00, 1.00],
  Y: [0.00, 1.00, 1.00, 1.00, 0.00],
};

export const AMAGAMA_EMINWE = ["Thumb", "Index", "Middle", "Ring", "Pinky"];
