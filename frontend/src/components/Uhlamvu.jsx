// Uhlamvu: ibonisa uhlamvu olubikezelwe njengamanje, ukuzethemba kwalo,
// nendandatho yenqubekelaphambili yokubamba (displays the currently
// predicted letter, its confidence, and a circular hold-progress ring).
const IRADIUSI = 90;
const INDIMA = 2 * Math.PI * IRADIUSI;

export default function Uhlamvu({ uhlamvu, ukuzethemba, inqubekelaphambili, isandlaSibonakele }) {
  const ubude_bomugqa = INDIMA * (1 - inqubekelaphambili);

  return (
    <div className="uhlamvu-isiyingi">
      <svg width="220" height="220" viewBox="0 0 220 220" aria-hidden="true">
        <circle cx="110" cy="110" r={IRADIUSI} fill="none" stroke="var(--uxhumano-umugqa)" strokeWidth="10" />
        <circle
          cx="110"
          cy="110"
          r={IRADIUSI}
          fill="none"
          stroke="var(--uxhumano-oluhle)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={INDIMA}
          strokeDashoffset={ubude_bomugqa}
          transform="rotate(-90 110 110)"
        />
      </svg>
      <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span className="uhlamvu-inombolo" data-testid="uhlamvu-inombolo">
          {isandlaSibonakele && uhlamvu ? uhlamvu : "-"}
        </span>
        <span className="uhlamvu-ukuzethemba">
          {isandlaSibonakele && uhlamvu ? `${Math.round(ukuzethemba * 100)}% confident` : "No hand detected"}
        </span>
      </div>
    </div>
  );
}
