import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations } from "./translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem("lang") || "en"; } catch { return "en"; }
  });

  const setLang = useCallback((newLang) => {
    setLangState(newLang);
    try { localStorage.setItem("lang", newLang); } catch { /* ignore */ }
  }, []);

  function t(key) {
    return translations[lang]?.[key] || translations.en[key] || key;
  }

  function localize(feature) {
    if (!feature) return { name: "", description: "" };
    return {
      name: lang === "zh" ? feature.name_zh : feature.name_en,
      description: lang === "zh" ? feature.description_zh : feature.description_en,
    };
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, localize }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
