import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Immediate loader removal
function hideInitialLoader() {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.classList.add('fade-out');
    setTimeout(() => loader.remove(), 100);
  }
}

// Create root and render immediately
const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Hide loader as soon as React starts rendering
requestAnimationFrame(hideInitialLoader);
