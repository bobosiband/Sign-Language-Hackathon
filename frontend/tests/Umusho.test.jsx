// Ukuhlola ibha yomusho: ukudwetshwa kombhalo, izinkinobho, nemibhaqo
// yekhibhodi (tests for the sentence bar: text rendering, buttons, and
// keyboard shortcuts).
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Umusho from "../src/components/Umusho";

function dweba(okugcwele = {}) {
  const izixhumanisi = {
    umusho: "HI",
    hlehlisa: vi.fn(),
    sula: vi.fn(),
    engezaIsikhala: vi.fn(),
    khuluma: vi.fn(),
    iyakhuluma: false,
    ...okugcwele,
  };
  render(<Umusho {...izixhumanisi} />);
  return izixhumanisi;
}

describe("Umusho", () => {
  it("ibonisa umusho owakhelwe (renders the built sentence)", () => {
    dweba({ umusho: "HELLO" });
    expect(screen.getByTestId("umusho-umbhalo")).toHaveTextContent("HELLO");
  });

  it("ibha yomusho inendima ye-textbox efinyelelekayo (the sentence bar has an accessible textbox role)", () => {
    dweba();
    expect(screen.getByRole("textbox", { name: /sentence built so far/i })).toBeInTheDocument();
  });

  it("ichofoza inkinobho ye-Backspace ibiza i-hlehlisa (clicking Backspace calls hlehlisa)", async () => {
    const izixhumanisi = dweba();
    await userEvent.click(screen.getByRole("button", { name: /backspace/i }));
    expect(izixhumanisi.hlehlisa).toHaveBeenCalledOnce();
  });

  it("ichofoza inkinobho ye-Clear ibiza i-sula (clicking Clear calls sula)", async () => {
    const izixhumanisi = dweba();
    await userEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(izixhumanisi.sula).toHaveBeenCalledOnce();
  });

  it("umbhaqo we-Backspace ku-khibhodi ubiza i-hlehlisa (the Backspace key shortcut calls hlehlisa)", async () => {
    const izixhumanisi = dweba();
    await userEvent.keyboard("{Backspace}");
    expect(izixhumanisi.hlehlisa).toHaveBeenCalledOnce();
  });

  it("i-Shift+Backspace ibiza i-sula, hhayi i-hlehlisa (Shift+Backspace calls sula, not hlehlisa)", async () => {
    const izixhumanisi = dweba();
    await userEvent.keyboard("{Shift>}{Backspace}{/Shift}");
    expect(izixhumanisi.sula).toHaveBeenCalledOnce();
    expect(izixhumanisi.hlehlisa).not.toHaveBeenCalled();
  });

  it("inkinobho yokukhuluma ivaliwe uma umusho ungenalutho (the speak button is disabled when the sentence is empty)", () => {
    dweba({ umusho: "" });
    expect(screen.getByRole("button", { name: /speak sentence/i })).toBeDisabled();
  });

  it("ichofoza inkinobho yokukhuluma ibiza i-khuluma nomusho (clicking Speak calls khuluma with the sentence)", async () => {
    const izixhumanisi = dweba({ umusho: "HI" });
    await userEvent.click(screen.getByRole("button", { name: /speak sentence/i }));
    expect(izixhumanisi.khuluma).toHaveBeenCalledWith("HI");
  });
});
