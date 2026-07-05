// Ukuhlola Ikhamera: i-MediaPipe kanye ne-hook yekhamera kwenziwe ngobuchule
// -- akukho khamera yangempela lapha (tests for the camera component --
// MediaPipe and the camera hook are fully mocked, no real camera involved).
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { IZILUNGISELELO_EZIMISIWE } from "../src/data/izilungiseleloOkumisiwe";

vi.mock("@mediapipe/drawing_utils", () => ({
  drawConnectors: vi.fn(),
  drawLandmarks: vi.fn(),
}));
vi.mock("@mediapipe/hands", () => ({ HAND_CONNECTIONS: [] }));

const useIkhameraEsenziweNgobuchule = vi.fn();
const useAmaphuzuOkwenziweNgobuchule = vi.fn();

vi.mock("../src/hooks/useIkhamera", async () => {
  const iyangempela = await vi.importActual("../src/hooks/useIkhamera");
  return {
    ...iyangempela,
    useIkhamera: () => useIkhameraEsenziweNgobuchule(),
  };
});
vi.mock("../src/hooks/useAmaphuzu", () => ({
  useAmaphuzu: () => useAmaphuzuOkwenziweNgobuchule(),
}));

const { IZIMO_ZEKHAMERA } = await import("../src/hooks/useIkhamera");
const { default: Ikhamera } = await import("../src/components/Ikhamera");

describe("Ikhamera", () => {
  it("ikhombisa isixwayiso uma kungabonakali sandla (shows a hint when no hand is visible)", () => {
    useIkhameraEsenziweNgobuchule.mockReturnValue({
      videoRef: { current: null },
      isimo: IZIMO_ZEKHAMERA.IYASEBENZA,
      umyalezoWephutha: null,
      qala: vi.fn(),
    });
    useAmaphuzuOkwenziweNgobuchule.mockReturnValue({
      amaphuzuOkudweba: null,
      amaphuzuAlinganisiwe: null,
      isandlaSibonakele: false,
      umyalezoWephutha: null,
    });

    render(<Ikhamera izilungiselelo={IZILUNGISELELO_EZIMISIWE} onAmaphuzu={vi.fn()} />);
    expect(screen.getByText(/show one hand to the camera/i)).toBeInTheDocument();
  });

  it("ikhombisa iphutha uma ikhamera inqatshelwe (shows an error when the camera permission was denied)", () => {
    useIkhameraEsenziweNgobuchule.mockReturnValue({
      videoRef: { current: null },
      isimo: IZIMO_ZEKHAMERA.KWENQATSHELWE,
      umyalezoWephutha: "Camera permission was denied.",
      qala: vi.fn(),
    });
    useAmaphuzuOkwenziweNgobuchule.mockReturnValue({
      amaphuzuOkudweba: null,
      amaphuzuAlinganisiwe: null,
      isandlaSibonakele: false,
      umyalezoWephutha: null,
    });

    render(<Ikhamera izilungiselelo={IZILUNGISELELO_EZIMISIWE} onAmaphuzu={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/permission was denied/i);
  });

  it("ibiza i-onAmaphuzu lapho amaphuzu esheshile (calls onAmaphuzu when landmarks update)", () => {
    useIkhameraEsenziweNgobuchule.mockReturnValue({
      videoRef: { current: null },
      isimo: IZIMO_ZEKHAMERA.IYASEBENZA,
      umyalezoWephutha: null,
      qala: vi.fn(),
    });
    const amaphuzuAlinganisiwe = new Array(63).fill(0.1);
    useAmaphuzuOkwenziweNgobuchule.mockReturnValue({
      amaphuzuOkudweba: [{ x: 0.1, y: 0.1, z: 0 }],
      amaphuzuAlinganisiwe,
      isandlaSibonakele: true,
      umyalezoWephutha: null,
    });

    const onAmaphuzu = vi.fn();
    render(<Ikhamera izilungiselelo={IZILUNGISELELO_EZIMISIWE} onAmaphuzu={onAmaphuzu} />);
    expect(onAmaphuzu).toHaveBeenCalledWith(amaphuzuAlinganisiwe, true);
  });
});
