// Isiqalo se-app: yakha impande ye-React futhi udwebe i-App (the app's
// entry point: creates the React root and mounts App).
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
