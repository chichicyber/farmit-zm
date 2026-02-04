'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import translation files statically
import enTranslations from '@/locales/en.json';
import bemTranslations from '@/locales/bem.json';
import toiTranslations from '@/locales/toi.json';
import lozTranslations from '@/locales/loz.json';

// --- Module-level constants ---
export const languages = {
  en: 'English',
  bem: 'Bemba',
  toi: 'Tonga',
  loz: 'Lozi',
};
export type LanguageCode = keyof typeof languages;

const allTranslations: Record<string, any> = {
  en: enTranslations,
  bem: bemTranslations,
  toi: toiTranslations,
  loz: lozTranslations,
};
// ---

// --- Context Definition ---
interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: string) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
// ---

// --- Helper Function ---
const getTranslation = (translations: any, key: string): string | undefined => {
  // Navigate through the nested object based on the key (e.g., "dashboard.title")
  return key.split('.').reduce((obj, k) => {
    if (obj && typeof obj === 'object' && k in obj) {
      return obj[k];
    }
    return undefined;
  }, translations);
};
// ---

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  // On initial client-side render, load the language preference from localStorage
  useEffect(() => {
    const storedLang = localStorage.getItem('farmit-lang');
    if (storedLang && languages[storedLang as LanguageCode]) {
      setLanguageState(storedLang as LanguageCode);
    }
  }, []);

  // Function to change the language, which updates state and saves to localStorage
  const setLanguage = (lang: string) => {
    if (lang && languages[lang as LanguageCode]) {
      const newLang = lang as LanguageCode;
      localStorage.setItem('farmit-lang', newLang);
      setLanguageState(newLang);
    }
  };

  // The core translation function `t`
  const t = (key: string, options?: { [key: string]: string | number }): string => {
    const currentTranslations = allTranslations[language] || allTranslations.en;
    const defaultTranslations = allTranslations.en;

    let translatedText = getTranslation(currentTranslations, key);

    // If the key is not found in the current language, fall back to English
    if (translatedText === undefined) {
      translatedText = getTranslation(defaultTranslations, key);
    }

    // If still not found, warn and return the key itself
    if (translatedText === undefined) {
      console.warn(`Translation key not found in '${language}' or 'en': ${key}`);
      return key;
    }

    // Replace placeholders like {name} with values from the options object
    if (options && typeof translatedText === 'string') {
      return Object.entries(options).reduce((acc, [optKey, optValue]) => {
        return acc.replace(`{${optKey}}`, String(optValue));
      }, translatedText);
    }

    return translatedText;
  };

  // The value provided to all consumer components of this context
  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to easily access the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
