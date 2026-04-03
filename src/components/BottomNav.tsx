import { BookOpen, Users, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export type TabId = 'stories' | 'characters' | 'world';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs = [
  { id: 'stories' as TabId, label: 'Histoires', icon: BookOpen },
  { id: 'characters' as TabId, label: 'Personnages', icon: Users },
  { id: 'world' as TabId, label: 'Monde', icon: Globe },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-30">
      <div className="mx-4 mb-4 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-card-hover">
        <div className="flex items-center justify-around py-2 px-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-bg"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                <span
                  className={`text-[10px] font-display font-semibold relative z-10 transition-colors duration-200 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
