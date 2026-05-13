import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'fr' | 'es' | 'gl';

interface Translations {
  stories: string;
  characters: string;
  world: string;
  settings: string;
  language: string;
  back: string;
  adminStories: string;
  exportPdf: string;
  exporting: string;
  exportSuccess: string;
  illustration: string;
  figurine: string;
  dessin: string;
  capacites: string;
  // Book tab
  swipeHint: string;
  releaseToOpen: string;
  theEnd: string;
  readStory: string;
  touchToChoose: string;
  discover: string;
  explore: string;
  sounds: string;
  display: string;
  modeIphone: string;
  modeIpad: string;
}

const translations: Record<Language, Translations> = {
  fr: {
    stories: 'Bibliothèque Magique',
    characters: 'Personnages',
    world: 'Monde',
    settings: 'Réglages',
    language: 'Langue',
    back: 'Retour',
    adminStories: 'Histoires',
    exportPdf: 'Exporter en PDF',
    exporting: 'Export en cours…',
    exportSuccess: 'PDF exporté avec succès !',
    illustration: 'Illustration',
    figurine: 'Figurine',
    dessin: 'Dessin',
    capacites: 'Capacités',
    swipeHint: 'Glisser pour ouvrir',
    releaseToOpen: 'Lâche pour ouvrir !',
    theEnd: 'Fin',
    readStory: 'Lire l\'histoire',
    touchToChoose: 'Touche pour choisir',
    discover: 'Découvrir',
    explore: 'Explorer',
    sounds: 'Sons & musique',
    display: 'Affichage', modeIphone: 'iPhone', modeIpad: 'iPad',
  },
  es: {
    stories: 'Biblioteca Mágica',
    characters: 'Personajes',
    world: 'Mundo',
    settings: 'Ajustes',
    language: 'Idioma',
    back: 'Volver',
    adminStories: 'Historias',
    exportPdf: 'Exportar como PDF',
    exporting: 'Exportando…',
    exportSuccess: '¡PDF exportado con éxito!',
    illustration: 'Ilustración',
    figurine: 'Figurina',
    dessin: 'Dibujo',
    capacites: 'Habilidades',
    swipeHint: 'Deslizar para abrir',
    releaseToOpen: '¡Suelta para abrir!',
    theEnd: 'Fin',
    readStory: 'Leer la historia',
    touchToChoose: 'Toca para elegir',
    discover: 'Descubrir',
    explore: 'Explorar',
    sounds: 'Sonidos y música',
    display: 'Pantalla', modeIphone: 'iPhone', modeIpad: 'iPad',
  },
  gl: {
    stories: 'Biblioteca Máxica',
    characters: 'Personaxes',
    world: 'Mundo',
    settings: 'Axustes',
    language: 'Lingua',
    back: 'Volver',
    adminStories: 'Historias',
    exportPdf: 'Exportar como PDF',
    exporting: 'Exportando…',
    exportSuccess: 'PDF exportado con éxito!',
    illustration: 'Ilustración',
    figurine: 'Figuriña',
    dessin: 'Debuxo',
    capacites: 'Habilidades',
    swipeHint: 'Deslizar para abrir',
    releaseToOpen: 'Solta para abrir!',
    theEnd: 'Fin',
    readStory: 'Ler a historia',
    touchToChoose: 'Toca para escoller',
    discover: 'Descobrir',
    explore: 'Explorar',
    sounds: 'Sons e música',
    display: 'Pantalla', modeIphone: 'iPhone', modeIpad: 'iPad',
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
