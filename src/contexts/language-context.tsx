'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Define language data structure
interface Translations {
  [key: string]: string | Translations;
}

// Define context value shape
interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, options?: { [key: string]: string | number } | undefined) => string;
  translations: Translations;
}

// Available languages
export const languages = {
  en: 'English',
  bem: 'Bemba',
  toi: 'Tonga',
  loz: 'Lozi',
};
export type LanguageCode = keyof typeof languages;

// Create context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to get nested translation
const getTranslation = (translations: Translations, key: string): string | undefined => {
  return key.split('.').reduce((obj, k) => {
    if (obj && typeof obj === 'object' && k in obj) {
      return obj[k as keyof typeof obj] as string | Translations;
    }
    return undefined;
  }, translations) as string | undefined;
};

// Provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [translations, setTranslations] = useState<Translations>({});
  const [defaultTranslations, setDefaultTranslations] = useState<Translations>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load english translations initially
  useEffect(() => {
    const loadDefault = async () => {
      try {
        const enModule = await import('@/locales/en.json');
        setDefaultTranslations(enModule.default);
      } catch (error) {
        console.error(`Could not load default (en) translations`, error);
      }
    };
    loadDefault();
  }, []);
  
  // Load translations for the current language
  useEffect(() => {
    if (!defaultTranslations) return;
    const loadTranslations = async () => {
      try {
        const module = await import(`@/locales/${language}.json`);
        setTranslations(module.default);
      } catch (error) {
        console.error(`Could not load translations for ${language}, falling back to English.`, error);
        setTranslations(defaultTranslations); // Fallback to english
      } finally {
        setIsLoaded(true);
      }
    };
    loadTranslations();
  }, [language, defaultTranslations]);

  // Set initial language from localStorage
  useEffect(() => {
    const storedLang = localStorage.getItem('farmit-lang') as LanguageCode;
    if (storedLang && languages[storedLang]) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: string) => {
    if (languages[lang as LanguageCode]) {
      localStorage.setItem('farmit-lang', lang);
      setLanguageState(lang as LanguageCode);
    }
  };

  const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
    let translatedText = getTranslation(translations, key);
    
    // Fallback to English if translation is missing
    if (translatedText === undefined) {
      translatedText = getTranslation(defaultTranslations, key);
    }

    // If still not found, return the key itself
    if (translatedText === undefined) {
      return key;
    }

    // Handle placeholder replacements
    if (options) {
      return Object.entries(options).reduce((acc, [optKey, optValue]) => {
        return acc.replace(`{${optKey}}`, String(optValue));
      }, translatedText);
    }

    return translatedText;
  }, [translations, defaultTranslations]);


  const value = { language, setLanguage, t, translations };
  
  if (!isLoaded) {
      return (
         <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
      )
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
