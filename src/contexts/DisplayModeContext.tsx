import { createContext, useContext, useState, ReactNode } from 'react';

export type DisplayMode = 'iphone' | 'ipad';

const STORAGE_KEY = 'pokeloria-display-mode';

interface DisplayModeContextType {
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  isIpad: boolean;
}

const DisplayModeContext = createContext<DisplayModeContextType | undefined>(undefined);

export const DisplayModeProvider = ({ children }: { children: ReactNode }) => {
  const [displayMode, _setDisplayMode] = useState<DisplayMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'ipad' ? 'ipad' : 'iphone';
    } catch {
      return 'iphone';
    }
  });

  const setDisplayMode = (mode: DisplayMode) => {
    try { localStorage.setItem(STORAGE_KEY, mode); } catch {}
    _setDisplayMode(mode);
  };

  return (
    <DisplayModeContext.Provider value={{ displayMode, setDisplayMode, isIpad: displayMode === 'ipad' }}>
      {children}
    </DisplayModeContext.Provider>
  );
};

export const useDisplayMode = () => {
  const ctx = useContext(DisplayModeContext);
  if (!ctx) throw new Error('useDisplayMode must be used within DisplayModeProvider');
  return ctx;
};
