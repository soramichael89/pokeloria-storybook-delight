import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import SplashScreen from '@/components/SplashScreen';
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
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <MobileShell>
        <div className="relative h-full flex flex-col">
          {/* Settings gear icon */}
          <button
            onClick={() => setShowSettings(true)}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-card/60 backdrop-blur-sm border border-border/30 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
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
        {showSettings && (
          <SettingsScreen onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Index;
