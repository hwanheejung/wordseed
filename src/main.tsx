import "@seed-design/css/base.css";
import "./app/styles/global.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { SnackbarProvider } from "seed-design/ui/snackbar";
import App from "./app/App";

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  </React.StrictMode>,
);
