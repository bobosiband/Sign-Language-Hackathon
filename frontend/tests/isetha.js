// Ukumisa ukuhlolwa: izixhumanisi ze-jest-dom kanye nezinto ze-bhrawuza
// ezingekho ku-jsdom (test setup: jest-dom matchers, plus stubs for browser
// APIs jsdom does not implement -- speech synthesis and media playback).
import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

if (!window.speechSynthesis) {
  window.speechSynthesis = {
    getVoices: () => [],
    speak: vi.fn(),
    cancel: vi.fn(),
    onvoiceschanged: null,
  };
}

if (typeof window.SpeechSynthesisUtterance === "undefined") {
  window.SpeechSynthesisUtterance = class {
    constructor(umbhalo) {
      this.text = umbhalo;
      this.rate = 1;
      this.voice = null;
    }
  };
}

// I-jsdom ayisebenzisi ukudlala kwevidiyo -- yenza i-stub (jsdom does not
// implement media playback -- stub it out).
window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
window.HTMLMediaElement.prototype.pause = vi.fn();

// I-jsdom ayisebenzisi i-canvas 2D context -- yenza i-stub engenzi lutho
// (jsdom does not implement a 2D canvas context -- stub one out that
// no-ops for any method the drawing code calls).
window.HTMLCanvasElement.prototype.getContext = vi.fn(() =>
  new Proxy(
    {},
    {
      get: (into, igama) => (igama in into ? into[igama] : vi.fn()),
    },
  ),
);

afterEach(() => {
  vi.restoreAllMocks();
});
