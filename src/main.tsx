import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

/*
 * StrictMode is intentionally omitted: the match session drives AI turns and
 * animation from effects with real timers, and double-invoking them in
 * development would fire duplicate dice rolls. Correctness is covered by the
 * engine test suite instead.
 */
createRoot(document.getElementById("root")!).render(<App />);
