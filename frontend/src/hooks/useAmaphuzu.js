// I-hook ye-MediaPipe Hands: ikhipha amaphuzu esandla ku-frame ngayinye,
// ngaphakathi kwebhrawuza ngokuphelele (the MediaPipe Hands hook: extracts
// hand landmarks per video frame, entirely inside the browser). Ividiyo
// AYIPHUMI kule khompyutha -- amaphuzu wodwa (63 izinombolo) ayathunyelwa
// kusekelo (video NEVER leaves this device -- only the 63 landmark numbers
// are sent onward). Bheka docs/ARCHITECTURE.md.
import { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { linganisaAmaphuzu } from "../utils/ukulinganisa";

/**
 * Landela isandla kusuka kuvidiyo, ubuyisele amaphuzu angahlanjululiwe
 * (okokudweba) kanye nalawo asehlanjululiwe (okokubikezela) (track a hand
 * from video, returning both the raw landmarks for drawing and the
 * normalized vector for prediction).
 *
 * @param {import('react').RefObject<HTMLVideoElement>} videoRef
 * @param {{kuyasebenza?: boolean}} amaphuzu
 */
export function useAmaphuzu(videoRef, { kuyasebenza = true } = {}) {
  const [amaphuzuOkudweba, setAmaphuzuOkudweba] = useState(null);
  const [isandlaSibonakele, setIsandlaSibonakele] = useState(false);
  const [umyalezoWephutha, setUmyalezoWephutha] = useState(null);

  useEffect(() => {
    if (!kuyasebenza || !videoRef.current) return undefined;

    let kuyaphelile = false;
    let ikhamera;
    const hands = new Hands({
      locateFile: (ifayela) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${ifayela}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((imiphumela) => {
      if (kuyaphelile) return;
      const amaphuzuAtholiwe = imiphumela.multiHandLandmarks && imiphumela.multiHandLandmarks[0];
      if (!amaphuzuAtholiwe) {
        setIsandlaSibonakele(false);
        setAmaphuzuOkudweba(null);
        return;
      }
      setIsandlaSibonakele(true);
      setAmaphuzuOkudweba(amaphuzuAtholiwe);
    });

    try {
      ikhamera = new Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      ikhamera.start();
    } catch (iphutha) {
      setUmyalezoWephutha(iphutha.message || "Could not start hand tracking.");
    }

    return () => {
      kuyaphelile = true;
      ikhamera?.stop();
      hands.close();
    };
  }, [videoRef, kuyasebenza]);

  const amaphuzuAlinganisiwe = amaphuzuOkudweba
    ? linganisaAmaphuzu(amaphuzuOkudweba.flatMap((iphuzu) => [iphuzu.x, iphuzu.y, iphuzu.z]))
    : null;

  return { amaphuzuOkudweba, amaphuzuAlinganisiwe, isandlaSibonakele, umyalezoWephutha };
}
