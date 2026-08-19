import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const root = document.getElementById("root")!;

createRoot(root).render(<App />);

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    // Remove prerender freeze style injected by prerender.js
    const freezeStyle = document.getElementById("__prerender-freeze__");
    if (freezeStyle) freezeStyle.remove();

    // Remove hydrating class so CSS animations can start
    root.classList.remove("hydrating");
  });
});
