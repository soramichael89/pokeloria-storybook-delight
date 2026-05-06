import { useState, useEffect } from 'react';
import { TabId } from '@/components/BottomNav';
import { useLanguage } from '@/contexts/LanguageContext';
import logo from '@/assets/logo.png';
import { GOLD, THEME } from '@/lib/theme';

const TAB_ACCENT: Record<TabId, string> = {
  stories:    THEME.peach.spine,
  characters: THEME.peach.spine,
  world:      THEME.sky.spine,
};

interface TopBarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  onSettings: () => void;
}

// Per-tab icons matching the magic-app design
const TabIcon = ({ tab, active, accent }: { tab: TabId; active: boolean; accent: string }) => {
  const c = active ? accent : 'rgba(40,20,5,0.45)';
  if (tab === 'stories') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5.2c2.6-.6 5.4-.6 8 0v13c-2.6-.6-5.4-.6-8 0V5.2z"/>
      <path d="M21 5.2c-2.6-.6-5.4-.6-8 0v13c2.6-.6 5.4-.6 8 0V5.2z"/>
      <path d="M12 5.2v13"/>
      <path d="M12 2.5 12.5 3.6 13.6 4 12.5 4.4 12 5.5 11.5 4.4 10.4 4 11.5 3.6z" fill={c} stroke="none"/>
    </svg>
  );
  if (tab === 'characters') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9.5c0-3.6 2.7-6 6-6s6 2.4 6 6v2.5c0 4-2.7 7.5-6 7.5s-6-3.5-6-7.5V9.5z"/>
      <path d="M7.5 8 5.5 3.5 9 6.2"/>
      <path d="M16.5 8 18.5 3.5 15 6.2"/>
      <circle cx="10" cy="11.5" r="0.6" fill={c} stroke="none"/>
      <circle cx="14" cy="11.5" r="0.6" fill={c} stroke="none"/>
      <path d="M10.8 14.6c.4.4.8.6 1.2.6s.8-.2 1.2-.6"/>
    </svg>
  );
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="7"/>
      <path d="M6.5 11.5c1.8 1.6 9.2 1.6 11 0"/>
      <path d="M9 7.5c.6-.8 1.6-1.4 2.6-1.5" strokeWidth="1.2"/>
      <path d="M8 17.5c1 1.4 2.5 2 4 2s3-.6 4-2"/>
      <path d="M7.5 20.5h9"/>
    </svg>
  );
};

const TABS: TabId[] = ['stories', 'characters', 'world'];

const TopBar = ({ activeTab, setActiveTab, onSettings }: TopBarProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const accent = TAB_ACCENT[activeTab];

  const TAB_LABELS: Record<TabId, string> = {
    stories:    t.stories,
    characters: t.characters,
    world:      t.world,
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const timer = setTimeout(() => document.addEventListener('click', close, { once: true }), 0);
    return () => { clearTimeout(timer); document.removeEventListener('click', close); };
  }, [open]);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      zIndex: 30,
      paddingTop: 52,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Grouped: logo + dropdown + gear — all centered together */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <img src={logo} alt="" style={{ width: 30, height: 30, borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', flexShrink: 0 }} />

      {/* Centered dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
          style={{
            background: open ? 'rgba(255,255,255,0.50)' : 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(8px)',
            border: 'none', borderRadius: 18,
            padding: '7px 14px',
            display: 'flex', alignItems: 'center', gap: 6,
            cursor: 'pointer',
            fontFamily: "'Quicksand',sans-serif",
            fontWeight: 700, fontSize: 12,
            color: 'rgba(40,20,5,0.75)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            transition: 'background 0.2s',
          }}
        >
          <span>{TAB_LABELS[activeTab]}</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)',
              left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(16px)',
              border: `1px solid rgba(201,168,76,0.4)`,
              borderRadius: 18,
              padding: 6,
              boxShadow: '0 12px 40px rgba(40,20,5,0.25), inset 0 0 0 1px rgba(255,255,255,0.5)',
              minWidth: 200,
              animation: 'dropdownIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              zIndex: 50,
            }}
          >
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: tab === activeTab ? `linear-gradient(135deg, ${accent}22, transparent)` : 'transparent',
                  border: 'none', borderRadius: 12,
                  cursor: 'pointer',
                  fontFamily: "'Quicksand',sans-serif",
                  fontWeight: tab === activeTab ? 700 : 600,
                  fontSize: 13,
                  color: 'hsl(25,30%,22%)',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <TabIcon tab={tab} active={tab === activeTab} accent={accent} />
                  {TAB_LABELS[tab]}
                </span>
                {tab === activeTab && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>{/* end centered dropdown */}

      {/* Gear — adjacent right */}
      <button
        onClick={onSettings}
        style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(255,255,255,0.45)',
          backdropFilter: 'blur(8px)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(25,30%,22%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
      </div>{/* end group */}
    </div>
  );
};

export default TopBar;
