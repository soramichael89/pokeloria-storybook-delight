import { useRef } from 'react';
import { motion } from 'framer-motion';
import { stories, Story } from '@/data/stories';
import StoryCard from './StoryCard';

interface StoryLibraryProps {
  onOpenStory: (story: Story) => void;
}

const StoryLibrary = ({ onOpenStory }: StoryLibraryProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-body text-muted-foreground mb-1">
            Bienvenue à Pokopia ✨
          </p>
          <h1 className="text-3xl font-display font-bold text-foreground leading-tight">
            PokéLoria
          </h1>
          <p className="mt-2 text-sm font-body text-muted-foreground leading-relaxed">
            Des histoires douces et magiques à lire en famille, dans un univers Pokémon merveilleux.
          </p>
        </motion.div>
      </div>

      {/* Section title */}
      <div className="px-6 pt-4 pb-3">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg font-display font-semibold text-foreground"
        >
          📚 Bibliothèque
        </motion.h2>
      </div>

      {/* Horizontal carousel */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto hide-scrollbar px-6 pb-6 snap-x snap-mandatory"
      >
        {stories.map((story, index) => (
          <div key={story.id} className="snap-start">
            <StoryCard story={story} onOpen={onOpenStory} index={index} />
          </div>
        ))}
        {/* End spacer */}
        <div className="flex-shrink-0 w-2" />
      </div>

      {/* Bottom decorative area */}
      <div className="flex-1 flex items-end justify-center pb-10 px-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-xs text-muted-foreground text-center font-body"
        >
          Fais glisser pour découvrir les histoires →
        </motion.p>
      </div>
    </div>
  );
};

export default StoryLibrary;
