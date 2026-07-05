// Ukuhlola iphaneli yezilungiselelo: ukuguqulwa kwamanani nokutholakala
// kwe-ARIA (tests for the settings panel: value changes and ARIA presence).
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Izilungiselelo from "../src/components/Izilungiselelo";
import { IZILUNGISELELO_EZIMISIWE } from "../src/data/izilungiseleloOkumisiwe";

describe("Izilungiselelo", () => {
  it("ibonisa amanani amisiwe njengamanje (renders the current setting values)", () => {
    render(<Izilungiselelo izilungiselelo={IZILUNGISELELO_EZIMISIWE} shintsha={vi.fn()} amazwi={[]} />);
    expect(screen.getByLabelText(/hold duration/i)).toHaveValue(String(IZILUNGISELELO_EZIMISIWE.ubudeBokubamba));
  });

  it("ibiza i-shintsha lapho isilaidi sokubamba sishintshiwe (calls shintsha when the hold-duration slider changes)", async () => {
    const shintsha = vi.fn();
    render(<Izilungiselelo izilungiselelo={IZILUNGISELELO_EZIMISIWE} shintsha={shintsha} amazwi={[]} />);

    const isilaidi = screen.getByLabelText(/hold duration/i);
    fireChange(isilaidi, "30");

    expect(shintsha).toHaveBeenCalledWith("ubudeBokubamba", 30);
  });

  it("ivumela ukuguqulwa kwethimu enomehluko omkhulu (toggles the high-contrast theme)", async () => {
    const shintsha = vi.fn();
    const umsebenzisi = userEvent.setup();
    render(<Izilungiselelo izilungiselelo={IZILUNGISELELO_EZIMISIWE} shintsha={shintsha} amazwi={[]} />);

    await umsebenzisi.click(screen.getByLabelText(/high-contrast theme/i));
    expect(shintsha).toHaveBeenCalledWith("umehlukoOphezulu", true);
  });

  it("konke okulawulwayo kunamalebula afinyelelekayo (every control has an accessible name)", () => {
    render(<Izilungiselelo izilungiselelo={IZILUNGISELELO_EZIMISIWE} shintsha={vi.fn()} amazwi={[]} />);
    for (const into of screen.getAllByRole("slider")) {
      expect(into).toHaveAccessibleName();
    }
  });
});

function fireChange(ielementhi, inani) {
  ielementhi.value = inani;
  ielementhi.dispatchEvent(new Event("change", { bubbles: true }));
}
