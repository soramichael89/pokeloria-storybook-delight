import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { WorldLocation } from '@/data/world';
import { useLanguage } from '@/contexts/LanguageContext';

interface LocationsContextType {
  locations: WorldLocation[];
  loading: boolean;
}

type LocalizedString = string | Record<string, string>;

function resolve(val: LocalizedString, lang: string): string {
  if (typeof val === 'string') return val;
  return val[lang] ?? val['fr'] ?? '';
}

function normalizeLocation(raw: any, lang: string): WorldLocation {
  return {
    ...raw,
    name: resolve(raw.name, lang),
    description: resolve(raw.description, lang),
  };
}

const LocationsContext = createContext<LocationsContextType>({ locations: [], loading: true });

export const LocationsProvider = ({ children }: { children: ReactNode }) => {
  const { language } = useLanguage();
  const rawRef = useRef<any[]>([]);
  const [locations, setLocations] = useState<WorldLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/locations-index.json')
      .then(r => {
        console.log('[Locations] index status:', r.status, r.url);
        return r.json();
      })
      .then((ids: string[]) => {
        console.log('[Locations] ids from index:', ids);
        return Promise.allSettled(
          ids.map(id =>
            fetch(`/data/locations/${id}.json`)
              .then(r => {
                console.log(`[Locations] ${id}.json status:`, r.status);
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
            console.warn(`[Locations] skipped location ${i}:`, result.reason);
          }
        });
        console.log('[Locations] loaded:', raw.length, 'locations');
        rawRef.current = raw;
        setLocations(raw.map(r => normalizeLocation(r, language)));
        setLoading(false);
      })
      .catch(err => {
        console.error('[Locations] index fetch failed:', err);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-resolve on language change without re-fetching
  useEffect(() => {
    if (rawRef.current.length > 0) {
      setLocations(rawRef.current.map(r => normalizeLocation(r, language)));
    }
  }, [language]);

  return (
    <LocationsContext.Provider value={{ locations, loading }}>
      {children}
    </LocationsContext.Provider>
  );
};

export const useLocations = () => useContext(LocationsContext);
