import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Hide the initial loader once React is ready
function hideInitialLoader() {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.classList.add('fade-out');
    setTimeout(() => {
      loader.remove();
    }, 300);
  }
}

createRoot(document.getElementById("root")!).render(<App />);

// Hide loader after React has rendered
setTimeout(hideInitialLoader, 100);
