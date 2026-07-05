// Izilungiselelo: iphaneli yokufinyeleleka -- konke okuhlelekayo kulolu
// hlelo lokusebenza (the accessibility settings panel -- everything
// adjustable in this app lives here).
export default function Izilungiselelo({ izilungiselelo, shintsha, amazwi }) {
  return (
    <div className="izilungiselelo-uhlu">
      <div className="izilungiselelo-into">
        <label htmlFor="ubude-bokubamba">Hold duration: {izilungiselelo.ubudeBokubamba} frames</label>
        <input
          id="ubude-bokubamba"
          type="range"
          min="5"
          max="60"
          step="1"
          value={izilungiselelo.ubudeBokubamba}
          onChange={(umcimbi) => shintsha("ubudeBokubamba", Number(umcimbi.target.value))}
        />
        <p className="izilungiselelo-incazelo">How many steady frames a handshape must be held before it is typed. Lower is faster; higher is more forgiving of shaky hands.</p>
      </div>

      <div className="izilungiselelo-into">
        <label htmlFor="umkhawulo-wokuzethemba">Confidence threshold: {Math.round(izilungiselelo.umkhawuloWokuzethemba * 100)}%</label>
        <input
          id="umkhawulo-wokuzethemba"
          type="range"
          min="0"
          max="0.95"
          step="0.05"
          value={izilungiselelo.umkhawuloWokuzethemba}
          onChange={(umcimbi) => shintsha("umkhawuloWokuzethemba", Number(umcimbi.target.value))}
        />
        <p className="izilungiselelo-incazelo">Minimum model confidence before a prediction counts toward typing a letter.</p>
      </div>

      <div className="izilungiselelo-into">
        <label htmlFor="usayizo-fonti">Text size</label>
        <select
          id="usayizo-fonti"
          value={izilungiselelo.usayizoFonti}
          onChange={(umcimbi) => shintsha("usayizoFonti", Number(umcimbi.target.value))}
        >
          <option value={1}>Normal</option>
          <option value={1.25}>Large</option>
          <option value={1.6}>Extra large</option>
        </select>
      </div>

      <div className="izilungiselelo-into">
        <label htmlFor="umehluko-ophezulu">
          <input
            id="umehluko-ophezulu"
            type="checkbox"
            checked={izilungiselelo.umehlukoOphezulu}
            onChange={(umcimbi) => shintsha("umehlukoOphezulu", umcimbi.target.checked)}
          />{" "}
          High-contrast theme (targets WCAG AAA)
        </label>
      </div>

      <div className="izilungiselelo-into">
        <label htmlFor="ukunciphisa-umnyakazo">
          <input
            id="ukunciphisa-umnyakazo"
            type="checkbox"
            checked={izilungiselelo.ukunciphisaUmnyakazo}
            onChange={(umcimbi) => shintsha("ukunciphisaUmnyakazo", umcimbi.target.checked)}
          />{" "}
          Reduced motion
        </label>
      </div>

      <div className="izilungiselelo-into">
        <label htmlFor="isandla-esisebenzayo">Signing hand / mirror view</label>
        <select
          id="isandla-esisebenzayo"
          value={izilungiselelo.isandlaEsisebenzayo}
          onChange={(umcimbi) => shintsha("isandlaEsisebenzayo", umcimbi.target.value)}
        >
          <option value="kokubili">Mirrored (either hand)</option>
          <option value="hhayi">Not mirrored</option>
        </select>
      </div>

      <div className="izilungiselelo-into">
        <label htmlFor="isivinini-sezwi">Speech rate: {izilungiselelo.isivininiSezwi.toFixed(1)}x</label>
        <input
          id="isivinini-sezwi"
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={izilungiselelo.isivininiSezwi}
          onChange={(umcimbi) => shintsha("isivininiSezwi", Number(umcimbi.target.value))}
        />
      </div>

      {amazwi.length > 0 && (
        <div className="izilungiselelo-into">
          <label htmlFor="igama-lezwi">Voice</label>
          <select
            id="igama-lezwi"
            value={izilungiselelo.igamaLezwi || ""}
            onChange={(umcimbi) => shintsha("igamaLezwi", umcimbi.target.value)}
          >
            <option value="">Browser default</option>
            {amazwi.map((izwi) => (
              <option key={izwi.name} value={izwi.name}>
                {izwi.name} ({izwi.lang})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
