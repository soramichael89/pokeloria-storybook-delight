import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import SplashScreen from '@/components/SplashScreen';
import MobileShell from '@/components/MobileShell';
import StoryLibrary from '@/components/StoryLibrary';
import CharactersTab from '@/components/CharactersTab';
import WorldTab from '@/components/WorldTab';
import TopBar from '@/components/TopBar';
import { TabId } from '@/components/BottomNav';
import SettingsScreen from '@/components/SettingsScreen';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('stories');
  const [showSettings, setShowSettings] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const header = (
    <TopBar
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onSettings={() => setShowSettings(true)}
    />
  );

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      </AnimatePresence>

      {!showSplash && (
        <>
          <MobileShell>
            <div className="relative h-full">
              {activeTab === 'stories' && <StoryLibrary header={header} />}
              {activeTab === 'characters' && <CharactersTab header={header} />}
              {activeTab === 'world' && <WorldTab header={header} />}
            </div>
          </MobileShell>

          <AnimatePresence>
            {showSettings && (
              <SettingsScreen onClose={() => setShowSettings(false)} />
            )}
          </AnimatePresence>
        </>
      )}
    </>
  );
};

export default Index;
