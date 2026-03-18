import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LanguageProvider } from "./i18n/LanguageContext";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>
);
