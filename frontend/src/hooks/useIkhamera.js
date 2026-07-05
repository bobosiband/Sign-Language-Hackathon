// I-hook ye-khamera: icela ukufinyelela kwikhamera, iphathe amaphutha
// ngokucacile (the camera hook: requests webcam access and reports clear,
// user-facing error states for every way it can fail).
import { useCallback, useEffect, useRef, useState } from "react";

export const IZIMO_ZEKHAMERA = {
  IYAQALA: "iyaqala",
  IYASEBENZA: "iyasebenza",
  KWENQATSHELWE: "kwenqatshelwe",
  AYITHOLAKALI: "ayitholakali",
  IPHUTHA: "iphutha",
};

/**
 * Phatha ukuxhumana ne-webcam yomsebenzisi (manage the user's webcam
 * connection lifecycle).
 */
export function useIkhamera() {
  const videoRef = useRef(null);
  const [isimo, setIsimo] = useState(IZIMO_ZEKHAMERA.IYAQALA);
  const [umyalezoWephutha, setUmyalezoWephutha] = useState(null);
  const okugxilweKukho = useRef(null);

  const qala = useCallback(async () => {
    setIsimo(IZIMO_ZEKHAMERA.IYAQALA);
    setUmyalezoWephutha(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setIsimo(IZIMO_ZEKHAMERA.AYITHOLAKALI);
      setUmyalezoWephutha("This browser does not support camera access.");
      return;
    }

    try {
      const okugxilwe = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      okugxilweKukho.current = okugxilwe;
      if (videoRef.current) {
        videoRef.current.srcObject = okugxilwe;
        await videoRef.current.play();
      }
      setIsimo(IZIMO_ZEKHAMERA.IYASEBENZA);
    } catch (iphutha) {
      if (iphutha.name === "NotAllowedError" || iphutha.name === "PermissionDeniedError") {
        setIsimo(IZIMO_ZEKHAMERA.KWENQATSHELWE);
        setUmyalezoWephutha("Camera permission was denied. Allow camera access in your browser settings and try again.");
      } else if (iphutha.name === "NotFoundError") {
        setIsimo(IZIMO_ZEKHAMERA.AYITHOLAKALI);
        setUmyalezoWephutha("No camera was found on this device.");
      } else {
        setIsimo(IZIMO_ZEKHAMERA.IPHUTHA);
        setUmyalezoWephutha(iphutha.message || "Could not start the camera.");
      }
    }
  }, []);

  const misa = useCallback(() => {
    okugxilweKukho.current?.getTracks().forEach((umgudu) => umgudu.stop());
    okugxilweKukho.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsimo(IZIMO_ZEKHAMERA.IYAQALA);
  }, []);

  useEffect(() => () => misa(), [misa]);

  return { videoRef, isimo, umyalezoWephutha, qala, misa };
}
