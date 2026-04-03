import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WorldLocation } from '@/data/world';

const LOCATION_FILES = [
  '/data/locations/pokopia-village.json',
  '/data/locations/mushroom-forest.json',
  '/data/locations/moon-lake.json',
  '/data/locations/thunder-ridge.json',
  '/data/locations/whispering-cave.json',
  '/data/locations/star-hill.json',
];

interface LocationsContextType {
  locations: WorldLocation[];
  loading: boolean;
}

const LocationsContext = createContext<LocationsContextType>({ locations: [], loading: true });

export const LocationsProvider = ({ children }: { children: ReactNode }) => {
  const [locations, setLocations] = useState<WorldLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(LOCATION_FILES.map(f => fetch(f).then(r => r.json())))
      .then(data => {
        setLocations(data as WorldLocation[]);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load locations:', err);
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
