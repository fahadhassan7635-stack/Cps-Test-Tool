import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const root = document.getElementById("root")!;

// Pause all animations during first paint to prevent double-fire on hydration.
// Removed after two rAF ticks — by then React has committed and the DOM is stable.
root.classList.add("hydrating");

createRoot(root).render(<App />);

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    root.classList.remove("hydrating");
  });
});
