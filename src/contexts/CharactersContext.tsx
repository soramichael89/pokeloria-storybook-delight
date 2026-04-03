import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Character } from '@/data/characters';

const CHARACTER_FILES = [
  '/data/characters/cadavra.json',
  '/data/characters/tartar.json',
  '/data/characters/arco.json',
  '/data/characters/captain-pikachu.json',
  '/data/characters/noctachou.json',
  '/data/characters/rondoudou.json',
  '/data/characters/evolis.json',
];

interface CharactersContextType {
  characters: Character[];
  loading: boolean;
}

const CharactersContext = createContext<CharactersContextType>({ characters: [], loading: true });

export const CharactersProvider = ({ children }: { children: ReactNode }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(CHARACTER_FILES.map(f => fetch(f).then(r => r.json())))
      .then(data => {
        setCharacters(data as Character[]);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load characters:', err);
        setLoading(false);
      });
  }, []);

  return (
    <CharactersContext.Provider value={{ characters, loading }}>
      {children}
    </CharactersContext.Provider>
  );
};

export const useCharacters = () => useContext(CharactersContext);
