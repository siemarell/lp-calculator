import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { configure } from "mobx";

configure({
  useProxies: "always",
  enforceActions: "never",
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
