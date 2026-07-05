// Ikhamera: ibonisa ividiyo yekhamera kanye nesiketelo sesandla esidwetshiwe
// phezu kwayo (the camera view, with the hand skeleton drawn as an overlay).
// Ividiyo ihlala kule khompyutha kuphela -- ayithunyelwa ndawo (video stays
// on this device only -- it is never transmitted anywhere).
import { useEffect, useRef } from "react";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { useIkhamera, IZIMO_ZEKHAMERA } from "../hooks/useIkhamera";
import { useAmaphuzu } from "../hooks/useAmaphuzu";
import IsimoIbhena from "./IsimoIbhena";

export default function Ikhamera({ izilungiselelo, onAmaphuzu }) {
  const { videoRef, isimo, umyalezoWephutha, qala } = useIkhamera();
  const ukwedlulaRef = useRef(null);
  const kuyasebenza = isimo === IZIMO_ZEKHAMERA.IYASEBENZA;
  const { amaphuzuOkudweba, amaphuzuAlinganisiwe, isandlaSibonakele, umyalezoWephutha: umyalezoWamaphuzu } = useAmaphuzu(
    videoRef,
    { kuyasebenza },
  );

  useEffect(() => {
    qala();
  }, [qala]);

  useEffect(() => {
    onAmaphuzu?.(amaphuzuAlinganisiwe, isandlaSibonakele);
  }, [amaphuzuAlinganisiwe, isandlaSibonakele, onAmaphuzu]);

  useEffect(() => {
    const ukwedlula = ukwedlulaRef.current;
    if (!ukwedlula) return;
    const ikonteksti = ukwedlula.getContext("2d");
    ikonteksti.clearRect(0, 0, ukwedlula.width, ukwedlula.height);
    if (!amaphuzuOkudweba) return;

    drawConnectors(ikonteksti, amaphuzuOkudweba, HAND_CONNECTIONS, {
      color: "#35d488",
      lineWidth: 3,
    });
    drawLandmarks(ikonteksti, amaphuzuOkudweba, { color: "#5b8cff", lineWidth: 1, radius: 3 });
  }, [amaphuzuOkudweba]);

  const kufanisiwe = izilungiselelo.isandlaEsisebenzayo !== "hhayi";

  return (
    <div>
      <div className="ikhamera-isikhwama">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          className={`ikhamera-ividiyo ${kufanisiwe ? "ikhamera-ividiyo--fanisiwe" : ""}`}
          autoPlay
          playsInline
          muted
          aria-hidden="true"
        />
        <canvas
          ref={ukwedlulaRef}
          className="ikhamera-ukwedlula"
          width={640}
          height={480}
          style={kufanisiwe ? { transform: "scaleX(-1)" } : undefined}
          aria-hidden="true"
        />
      </div>
      {isimo === IZIMO_ZEKHAMERA.KWENQATSHELWE && (
        <IsimoIbhena uhlobo="iphutha" umlayezo={umyalezoWephutha} />
      )}
      {isimo === IZIMO_ZEKHAMERA.AYITHOLAKALI && <IsimoIbhena uhlobo="iphutha" umlayezo={umyalezoWephutha} />}
      {isimo === IZIMO_ZEKHAMERA.IPHUTHA && <IsimoIbhena uhlobo="iphutha" umlayezo={umyalezoWephutha} />}
      {umyalezoWamaphuzu && <IsimoIbhena uhlobo="isixwayiso" umlayezo={umyalezoWamaphuzu} />}
      {kuyasebenza && !isandlaSibonakele && (
        <IsimoIbhena uhlobo="olujwayelekile" umlayezo="Show one hand to the camera to begin." />
      )}
    </div>
  );
}
