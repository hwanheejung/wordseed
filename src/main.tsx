import "@seed-design/css/base.css";
import "./styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { ensureSeedData } from "./data/db";

registerSW({ immediate: true });

void ensureSeedData().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
