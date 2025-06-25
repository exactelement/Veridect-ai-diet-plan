import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Fast loader removal
function hideInitialLoader() {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.classList.add('fade-out');
    setTimeout(() => loader.remove(), 150);
  }
}

createRoot(document.getElementById("root")!).render(<App />);

// Hide loader immediately when React is ready
hideInitialLoader();
