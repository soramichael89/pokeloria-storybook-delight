import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WorldLocation } from '@/data/world';

interface LocationsContextType {
  locations: WorldLocation[];
  loading: boolean;
}

const LocationsContext = createContext<LocationsContextType>({ locations: [], loading: true });

export const LocationsProvider = ({ children }: { children: ReactNode }) => {
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
        const loaded: WorldLocation[] = [];
        results.forEach((result, i) => {
          if (result.status === 'fulfilled') {
            loaded.push(result.value as WorldLocation);
          } else {
            console.warn(`[Locations] skipped location ${i}:`, result.reason);
          }
        });
        console.log('[Locations] loaded:', loaded.length, 'locations');
        setLocations(loaded);
        setLoading(false);
      })
      .catch(err => {
        console.error('[Locations] index fetch failed:', err);
        setLoading(false);
      });
  }, []);

  return (
    <LocationsContext.Provider value={{ locations, loading }}>
      {children}
    </LocationsContext.Provider>
  );
};

export const useLocations = () => useContext(LocationsContext);
