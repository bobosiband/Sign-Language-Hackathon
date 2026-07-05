// IsimoIbhena: ibhena ebonakalayo yesixwayiso noma yephutha (a visible
// status banner for warnings and errors -- never the only way information
// is conveyed, since color is always paired with text and an icon glyph).
export default function IsimoIbhena({ umlayezo, uhlobo = "olujwayelekile" }) {
  if (!umlayezo) return null;

  const uphawu = uhlobo === "iphutha" ? "[!]" : uhlobo === "isixwayiso" ? "[i]" : "[+]";

  return (
    <div
      className={`isimo-ibhena isimo-ibhena--${uhlobo}`}
      role={uhlobo === "iphutha" ? "alert" : "status"}
    >
      <span aria-hidden="true">{uphawu} </span>
      {umlayezo}
    </div>
  );
}
