import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// The SDK self-initialises; no explicit setup needed here.

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
