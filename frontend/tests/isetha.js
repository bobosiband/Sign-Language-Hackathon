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

afterEach(() => {
  vi.restoreAllMocks();
});
