'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';

import enTranslations from '@/locales/en.json';
import bemTranslations from '@/locales/bem.json';
import toiTranslations from '@/locales/toi.json';
import lozTranslations from '@/locales/loz.json';

// Define language data structure
interface Translations {
  [key: string]: string | Translations;
}

// Define context value shape
interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, options?: { [key: string]: string | number } | undefined) => string;
}

// Available languages
export const languages = {
  en: 'English',
  bem: 'Bemba',
  toi: 'Tonga',
  loz: 'Lozi',
};
export type LanguageCode = keyof typeof languages;

const allTranslations: Record<LanguageCode, Translations> = {
  en: enTranslations,
  bem: bemTranslations,
  toi: toiTranslations,
  loz: lozTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getTranslation = (translations: Translations, key: string): string | undefined => {
    return key.split('.').reduce((obj, k) => {
        if (obj && typeof obj === 'object' && k in obj) {
        return obj[k as keyof typeof obj] as string | Translations;
        }
        return undefined;
    }, translations) as string | undefined;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  // On mount, determine the initial language from localStorage or default to 'en'
  useEffect(() => {
    const storedLang = localStorage.getItem('farmit-lang') as LanguageCode;
    if (storedLang && languages[storedLang]) {
      setLanguageState(storedLang);
    }
  }, []);

  // Function to change the language
  const setLanguage = useCallback((lang: string) => {
    if (languages[lang as LanguageCode]) {
      const newLang = lang as LanguageCode;
      localStorage.setItem('farmit-lang', newLang);
      setLanguageState(newLang);
    }
  }, []);

  // The translation function, memoized to update only when the language changes
  const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
    const currentTranslations = allTranslations[language];
    const defaultTranslations = allTranslations['en'];

    let translatedText = getTranslation(currentTranslations, key);
    
    // Fallback to English if translation is not found
    if (translatedText === undefined) {
      translatedText = getTranslation(defaultTranslations, key);
    }

    // If still not found, return the key and log a warning
    if (translatedText === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
    }

    // Replace placeholders like {name}
    if (options && typeof translatedText === 'string') {
      return Object.entries(options).reduce((acc, [optKey, optValue]) => {
        return acc.replace(`{${optKey}}`, String(optValue));
      }, translatedText);
    }

    return translatedText as string;
  }, [language]); // This function now only depends on the current language state

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
  }), [language, setLanguage, t]);
  
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
