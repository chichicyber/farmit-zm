'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';

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
  const [translations, setTranslations] = useState<Translations>({});
  const [defaultTranslations, setDefaultTranslations] = useState<Translations>({});
  const [isInitiallyLoading, setIsInitiallyLoading] = useState(true);

  // This effect runs once on mount to determine the initial language and load the default (English) translations.
  useEffect(() => {
    const storedLang = localStorage.getItem('farmit-lang') as LanguageCode;
    if (storedLang && languages[storedLang]) {
      setLanguageState(storedLang);
    }
    
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
  
  // This effect loads translations for the current language whenever it changes or when default translations become available.
  useEffect(() => {
    if (!Object.keys(defaultTranslations).length) return;

    let isMounted = true;
    const loadTranslations = async () => {
      try {
        const module = await import(`@/locales/${language}.json`);
        if(isMounted) {
            setTranslations(module.default);
        }
      } catch (error) {
        console.error(`Could not load translations for ${language}, falling back to English.`, error);
        if(isMounted){
            setTranslations(defaultTranslations);
        }
      } finally {
        if(isMounted){
            setIsInitiallyLoading(false);
        }
      }
    };
    loadTranslations();

    return () => {
        isMounted = false;
    }
  }, [language, defaultTranslations]);

  const setLanguage = useCallback((lang: string) => {
    if (languages[lang as LanguageCode]) {
      const newLang = lang as LanguageCode;
      localStorage.setItem('farmit-lang', newLang);
      setLanguageState(newLang);
    }
  }, []);

  const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
    if (isInitiallyLoading) return ''; 

    let translatedText = getTranslation(translations, key);
    
    if (translatedText === undefined) {
      translatedText = getTranslation(defaultTranslations, key);
    }

    if (translatedText === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
    }

    if (options && typeof translatedText === 'string') {
      return Object.entries(options).reduce((acc, [optKey, optValue]) => {
        return acc.replace(`{${optKey}}`, String(optValue));
      }, translatedText);
    }

    return translatedText as string;
  }, [translations, defaultTranslations, isInitiallyLoading]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
  }), [language, setLanguage, t]);
  
  if (isInitiallyLoading) {
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

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
