import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import MobileShell from '@/components/MobileShell';
import StoryLibrary from '@/components/StoryLibrary';
import StoryReader from '@/components/StoryReader';
import CharactersTab from '@/components/CharactersTab';
import WorldTab from '@/components/WorldTab';
import BottomNav, { TabId } from '@/components/BottomNav';
import SettingsScreen from '@/components/SettingsScreen';
import { Story } from '@/data/stories';

const Index = () => {
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('stories');

  return (
    <>
      <MobileShell>
        <div className="relative h-full min-h-screen sm:min-h-[860px] flex flex-col">
          <div className="flex-1 pb-20">
            {activeTab === 'stories' && <StoryLibrary onOpenStory={setActiveStory} />}
            {activeTab === 'characters' && <CharactersTab />}
            {activeTab === 'world' && <WorldTab />}
          </div>
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
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
