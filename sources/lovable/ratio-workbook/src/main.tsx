import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./ratio-v2.css";
import "./ratio-layout-fixes.css";
import "./workbench.css";

createRoot(document.getElementById("root")!).render(<App />);
