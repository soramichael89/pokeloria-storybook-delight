import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import MobileShell from '@/components/MobileShell';
import StoryLibrary from '@/components/StoryLibrary';
import StoryReader from '@/components/StoryReader';
import { Story } from '@/data/stories';

const Index = () => {
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  return (
    <>
      <MobileShell>
        <StoryLibrary onOpenStory={setActiveStory} />
      </MobileShell>

      <AnimatePresence>
        {activeStory && (
          <StoryReader
            story={activeStory}
            onClose={() => setActiveStory(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Index;
