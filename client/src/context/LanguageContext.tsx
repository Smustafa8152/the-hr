import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type LanguageContextType = {
  language: string;
  direction: 'ltr' | 'rtl';
  changeLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [direction, setDirection] = useState<'ltr' | 'rtl'>(i18n.language === 'ar' ? 'rtl' : 'ltr');

  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    setDirection(dir);
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    
    // Update font family based on language
    if (language === 'ar') {
      document.documentElement.style.setProperty('--font-sans', '"Tajawal", "Inter", sans-serif');
      document.documentElement.style.setProperty('--font-heading', '"Tajawal", "Manrope", sans-serif');
    } else {
      document.documentElement.style.removeProperty('--font-sans');
      document.documentElement.style.removeProperty('--font-heading');
    }
  }, [language]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, direction, changeLanguage }}>
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
