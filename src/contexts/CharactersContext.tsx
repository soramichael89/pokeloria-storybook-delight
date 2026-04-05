import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Character } from '@/data/characters';
import { useLanguage } from '@/contexts/LanguageContext';

interface CharactersContextType {
  characters: Character[];
  loading: boolean;
}

type LocalizedString = string | Record<string, string>;

function resolve(val: LocalizedString, lang: string): string {
  if (typeof val === 'string') return val;
  return val[lang] ?? val['fr'] ?? '';
}

function normalizeCharacter(raw: any, lang: string): Character {
  return {
    ...raw,
    name: resolve(raw.name, lang),
    role: resolve(raw.role, lang),
    description: resolve(raw.description, lang),
    skills: (raw.skills ?? []).map((s: any) => ({
      name: resolve(s.name, lang),
      description: resolve(s.description, lang),
    })),
  };
}

const CharactersContext = createContext<CharactersContextType>({ characters: [], loading: true });

export const CharactersProvider = ({ children }: { children: ReactNode }) => {
  const { language } = useLanguage();
  const rawRef = useRef<any[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/characters-index.json')
      .then(r => {
        console.log('[Characters] index status:', r.status, r.url);
        return r.json();
      })
      .then((ids: string[]) => {
        console.log('[Characters] ids from index:', ids);
        return Promise.allSettled(
          ids.map(id =>
            fetch(`/data/characters/${id}.json`)
              .then(r => {
                console.log(`[Characters] ${id}.json status:`, r.status);
                if (!r.ok) throw new Error(`${id}.json → HTTP ${r.status}`);
                return r.json();
              })
          )
        );
      })
      .then(results => {
        const raw: any[] = [];
        results.forEach((result, i) => {
          if (result.status === 'fulfilled') {
            raw.push(result.value);
          } else {
            console.warn(`[Characters] skipped character ${i}:`, result.reason);
          }
        });
        console.log('[Characters] loaded:', raw.length, 'characters');
        rawRef.current = raw;
        setCharacters(raw.map(r => normalizeCharacter(r, language)));
        setLoading(false);
      })
      .catch(err => {
        console.error('[Characters] index fetch failed:', err);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (rawRef.current.length > 0) {
      setCharacters(rawRef.current.map(r => normalizeCharacter(r, language)));
    }
  }, [language]);

  return (
    <CharactersContext.Provider value={{ characters, loading }}>
      {children}
    </CharactersContext.Provider>
  );
};

export const useCharacters = () => useContext(CharactersContext);
