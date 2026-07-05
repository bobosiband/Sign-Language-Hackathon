// Ukuhlola i-hook ye-WebSocket: kusetshenziswa i-WebSocket eyenziwe
// ngobuchule, hhayi eyangempela (tests for the WebSocket hook, using a mock
// WebSocket -- never a real network connection).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useIxhumanisi, IZIMO_ZOXHUMANO } from "../src/hooks/useIxhumanisi";

class IsokhethiEsenziweNgobuchule {
  static izinhlaka = [];

  constructor(url) {
    this.url = url;
    this.readyState = IsokhethiEsenziweNgobuchule.CONNECTING;
    this.sentMessages = [];
    IsokhethiEsenziweNgobuchule.izinhlaka.push(this);
  }

  send(idatha) {
    this.sentMessages.push(idatha);
  }

  close() {
    this.readyState = IsokhethiEsenziweNgobuchule.CLOSED;
    this.onclose?.();
  }

  vula() {
    this.readyState = IsokhethiEsenziweNgobuchule.OPEN;
    this.onopen?.();
  }

  yehlukanisa() {
    this.readyState = IsokhethiEsenziweNgobuchule.CLOSED;
    this.onclose?.(new Event("close"));
  }
}
IsokhethiEsenziweNgobuchule.CONNECTING = 0;
IsokhethiEsenziweNgobuchule.OPEN = 1;
IsokhethiEsenziweNgobuchule.CLOSING = 2;
IsokhethiEsenziweNgobuchule.CLOSED = 3;

beforeEach(() => {
  IsokhethiEsenziweNgobuchule.izinhlaka = [];
  vi.stubGlobal("WebSocket", IsokhethiEsenziweNgobuchule);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useIxhumanisi", () => {
  it("iba ku-IXHUNYIWE lapho i-socket ivuliwe (becomes IXHUNYIWE once the socket opens)", () => {
    const { result } = renderHook(() => useIxhumanisi("ws://test", vi.fn()));
    expect(result.current.isimo).toBe(IZIMO_ZOXHUMANO.IYAXHUMA);

    act(() => IsokhethiEsenziweNgobuchule.izinhlaka[0].vula());
    expect(result.current.isimo).toBe(IZIMO_ZOXHUMANO.IXHUNYIWE);
  });

  it("i-thumela ithumela amaphuzu njenge-JSON (thumela sends landmarks as JSON)", () => {
    const { result } = renderHook(() => useIxhumanisi("ws://test", vi.fn()));
    act(() => IsokhethiEsenziweNgobuchule.izinhlaka[0].vula());

    act(() => result.current.thumela([0.1, 0.2, 0.3]));

    const isokhethi = IsokhethiEsenziweNgobuchule.izinhlaka[0];
    expect(JSON.parse(isokhethi.sentMessages[0])).toEqual({ amaphuzu: [0.1, 0.2, 0.3] });
  });

  it("ibiza i-onImpendulo lapho kufika umlayezo (calls onImpendulo when a message arrives)", () => {
    const onImpendulo = vi.fn();
    renderHook(() => useIxhumanisi("ws://test", onImpendulo));
    const isokhethi = IsokhethiEsenziweNgobuchule.izinhlaka[0];

    act(() => isokhethi.onmessage({ data: JSON.stringify({ uhlamvu: "A", ukuzethemba: 0.9 }) }));

    expect(onImpendulo).toHaveBeenCalledWith({ uhlamvu: "A", ukuzethemba: 0.9 });
  });

  it("iba ku-IPHUKILE futhi izame kabusha lapho ixhumo liphukile (becomes IPHUKILE and retries after a drop)", () => {
    const { result } = renderHook(() => useIxhumanisi("ws://test", vi.fn()));
    act(() => IsokhethiEsenziweNgobuchule.izinhlaka[0].vula());
    act(() => IsokhethiEsenziweNgobuchule.izinhlaka[0].yehlukanisa());

    expect(result.current.isimo).toBe(IZIMO_ZOXHUMANO.IPHUKILE);
    expect(IsokhethiEsenziweNgobuchule.izinhlaka).toHaveLength(1);

    act(() => vi.advanceTimersByTime(1000));
    expect(IsokhethiEsenziweNgobuchule.izinhlaka).toHaveLength(2);
  });
});
