// Isimemezelo: isigcawu esifihlekile esimemezela izinguquko kubasebenzisi
// besikrini sokufunda (the announcer: a visually-hidden ARIA live region
// that announces state changes to screen-reader users).
export default function Isimemezelo({ umlayezo }) {
  return (
    <div className="sr-only" role="status" aria-live="polite">
      {umlayezo}
    </div>
  );
}
