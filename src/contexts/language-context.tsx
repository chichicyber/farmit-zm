'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';

// --- Module-level constants ---
import enTranslations from '@/locales/en.json';
import bemTranslations from '@/locales/bem.json';
import toiTranslations from '@/locales/toi.json';
import lozTranslations from '@/locales/loz.json';

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

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);
// ---

const getTranslation = (
  translations: any,
  key: string
): string | undefined => {
  return key.split('.').reduce((obj, k) => {
    if (obj && typeof obj === 'object' && k in obj) {
      return obj[k];
    }
    return undefined;
  }, translations);
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('farmit-lang');
    if (storedLang && languages[storedLang as LanguageCode]) {
      setLanguageState(storedLang as LanguageCode);
    }
  }, []);

  const setLanguage = useCallback((lang: string) => {
    if (lang && languages[lang as LanguageCode]) {
      const newLang = lang as LanguageCode;
      localStorage.setItem('farmit-lang', newLang);
      setLanguageState(newLang);
    }
  }, []);

  const t = useCallback(
    (key: string, options?: { [key: string]: string | number }): string => {
      const currentTranslations = allTranslations[language] || allTranslations.en;
      const defaultTranslations = allTranslations.en;

      let translatedText = getTranslation(currentTranslations, key);

      if (translatedText === undefined) {
        translatedText = getTranslation(defaultTranslations, key);
      }

      if (translatedText === undefined) {
        console.warn(
          `Translation key not found in '${language}' or 'en': ${key}`
        );
        return key;
      }

      if (options && typeof translatedText === 'string') {
        return Object.entries(options).reduce((acc, [optKey, optValue]) => {
          return acc.replace(`{${optKey}}`, String(optValue));
        }, translatedText);
      }

      return translatedText;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
