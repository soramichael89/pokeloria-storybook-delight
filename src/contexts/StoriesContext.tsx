import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Story } from '@/data/stories';

const STORY_FILES = ['/data/s1.json', '/data/s2.json', '/data/s3.json', '/data/s4.json'];

interface StoriesContextType {
  stories: Story[];
  loading: boolean;
}

const StoriesContext = createContext<StoriesContextType>({ stories: [], loading: true });

export const StoriesProvider = ({ children }: { children: ReactNode }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(STORY_FILES.map(f => fetch(f).then(r => r.json())))
      .then(data => {
        setStories(data as Story[]);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load stories:', err);
        setLoading(false);
      });
  }, []);

  return (
    <StoriesContext.Provider value={{ stories, loading }}>
      {children}
    </StoriesContext.Provider>
  );
};

export const useStories = () => useContext(StoriesContext);
