import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import initDevAuth from "./utils/devAuth";
import "./setupAuth";

function mount() {
  ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
}

// Ensure dev token exists before the app makes API calls.
initDevAuth().finally(mount);
