"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { Language } from "../lib/i18n";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({
  children,
  initialLanguage = "vi",
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) => {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  // Khi đổi ngôn ngữ, set cookie và reload để SSR đồng bộ
  const setLanguage = (lang: Language) => {
    document.cookie = `language=${lang}; path=/`;
    setLanguageState(lang);
    window.location.reload(); // reload để SSR lấy đúng ngôn ngữ
  };

  useEffect(() => {
    // Nếu client khác initialLanguage (do cookie), cập nhật lại state
    const match = document.cookie.match(/language=(vi|en)/);
    if (match && match[1] !== language) {
      setLanguageState(match[1] as Language);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguageContext must be used within LanguageProvider");
  return ctx;
}; 