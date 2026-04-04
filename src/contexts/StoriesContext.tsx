import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Story } from '@/data/stories';
import { useLanguage } from '@/contexts/LanguageContext';

interface StoriesContextType {
  stories: Story[];
  loading: boolean;
}

type LocalizedString = string | Record<string, string>;

function resolve(val: LocalizedString, lang: string): string {
  if (typeof val === 'string') return val;
  return val[lang] ?? val['fr'] ?? '';
}

function normalizeStory(raw: any, lang: string): Story {
  return {
    ...raw,
    title: resolve(raw.title, lang),
    theme: resolve(raw.theme, lang),
    pages: (raw.pages ?? []).map((p: any) => ({
      ...p,
      text: resolve(p.text ?? p.content ?? '', lang),
      type: p.type === 'image-text' ? 'text-image' : p.type,
    })),
  };
}

const StoriesContext = createContext<StoriesContextType>({ stories: [], loading: true });

export const StoriesProvider = ({ children }: { children: ReactNode }) => {
  const { language } = useLanguage();
  const rawRef = useRef<any[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch raw data once
  useEffect(() => {
    fetch('/data/stories-index.json')
      .then(r => {
        console.log('[Stories] index status:', r.status, r.url);
        return r.json();
      })
      .then((ids: string[]) => {
        console.log('[Stories] ids from index:', ids);
        return Promise.allSettled(
          ids.map(id =>
            fetch(`/data/${id}.json`)
              .then(r => {
                console.log(`[Stories] ${id}.json status:`, r.status);
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
            console.warn(`[Stories] skipped story ${i}:`, result.reason);
          }
        });
        console.log('[Stories] loaded:', raw.length, 'stories');
        rawRef.current = raw;
        setStories(raw.map(r => normalizeStory(r, language)));
        setLoading(false);
      })
      .catch(err => {
        console.error('[Stories] index fetch failed:', err);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-resolve when language changes
  useEffect(() => {
    if (rawRef.current.length > 0) {
      setStories(rawRef.current.map(r => normalizeStory(r, language)));
    }
  }, [language]);

  return (
    <StoriesContext.Provider value={{ stories, loading }}>
      {children}
    </StoriesContext.Provider>
  );
};

export const useStories = () => useContext(StoriesContext);
