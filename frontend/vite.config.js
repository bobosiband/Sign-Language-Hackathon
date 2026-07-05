// Ukumisa i-Vite: i-build ye-React kanye nokumiswa kuka-Vitest (Vite config:
// the React build plus Vitest test-runner setup).
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/isetha.js"],
    globals: true,
  },
});
