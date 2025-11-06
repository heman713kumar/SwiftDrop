import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define the shape of the context
interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Define the provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<string>('en'); // Default to English
  const [translations, setTranslations] = useState<any>({});
  
  // Effect to fetch translation files when the language changes
  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        // Paths are relative to the public root (index.html)
        const response = await fetch(`/i18n/${language}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load translation file: ${language}`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error(error);
        // Fallback to English if the selected language fails
        if (language !== 'en') {
          const fallbackResponse = await fetch('/i18n/en.json');
          const fallbackData = await fallbackResponse.json();
          setTranslations(fallbackData);
        }
      }
    };

    fetchTranslations();
  }, [language]);


  // The translation function `t`
  const t = (key: string, options?: { [key: string]: string | number }): string => {
    // Return key as a fallback while translations are loading
    if (Object.keys(translations).length === 0) {
        return key;
    }
      
    const keys = key.split('.');
    let result = translations;

    // Traverse the nested JSON object
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // Return the key itself if not found
      }
    }

    if (typeof result === 'string' && options) {
      // Replace placeholders like {{variable}}
      Object.keys(options).forEach(placeholder => {
        result = result.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(options[placeholder]));
      });
    }

    return typeof result === 'string' ? result : key;
  };


  const value = {
    language,
    setLanguage,
    t,
  };

  // FIX: Corrected typo in the closing tag of LanguageContext.Provider.
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

// Custom hook to use the language context
export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
