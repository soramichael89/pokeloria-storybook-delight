import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'fr' | 'es' | 'gl';

interface Translations {
  stories: string;
  characters: string;
  world: string;
  settings: string;
  language: string;
  back: string;
}

const translations: Record<Language, Translations> = {
  fr: {
    stories: 'Histoires',
    characters: 'Personnages',
    world: 'Monde',
    settings: 'Réglages',
    language: 'Langue',
    back: 'Retour',
  },
  es: {
    stories: 'Historias',
    characters: 'Personajes',
    world: 'Mundo',
    settings: 'Ajustes',
    language: 'Idioma',
    back: 'Volver',
  },
  gl: {
    stories: 'Historias',
    characters: 'Personaxes',
    world: 'Mundo',
    settings: 'Axustes',
    language: 'Lingua',
    back: 'Volver',
  },
};

const languageLabels: Record<Language, string> = {
  fr: 'Français',
  es: 'Español',
  gl: 'Galego',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  languageLabels: Record<Language, string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('fr');

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: translations[language], languageLabels }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
