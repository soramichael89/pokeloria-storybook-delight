import { useDisplayMode, DisplayMode } from '@/contexts/DisplayModeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GOLD } from '@/lib/theme';

const IphoneIcon = ({ active }: { active: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#fff' : 'hsl(25,30%,28%)'} strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round"
  >
    <rect x="7" y="2" width="10" height="20" rx="2.5" />
    <circle cx="12" cy="18" r="1" fill={active ? '#fff' : 'hsl(25,30%,28%)'} stroke="none" />
    <line x1="10" y1="5" x2="14" y2="5" strokeWidth="1.5" />
  </svg>
);

const IpadIcon = ({ active }: { active: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#fff' : 'hsl(25,30%,28%)'} strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round"
  >
    <rect x="4" y="2" width="16" height="20" rx="2.5" />
    <circle cx="12" cy="18.5" r="1" fill={active ? '#fff' : 'hsl(25,30%,28%)'} stroke="none" />
    <line x1="8" y1="5" x2="16" y2="5" strokeWidth="1.5" />
  </svg>
);

const DisplayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(25,30%,28%)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="14" height="11" rx="2" />
    <rect x="17" y="7" width="5" height="8" rx="1.5" />
    <line x1="6" y1="19" x2="12" y2="19" />
    <line x1="9" y1="15" x2="9" y2="19" />
  </svg>
);

const OPTIONS: { code: DisplayMode; labelKey: 'modeIphone' | 'modeIpad'; Icon: typeof IphoneIcon }[] = [
  { code: 'iphone', labelKey: 'modeIphone', Icon: IphoneIcon },
  { code: 'ipad',   labelKey: 'modeIpad',   Icon: IpadIcon   },
];

export const DisplayModeToggle = () => {
  const { displayMode, setDisplayMode } = useDisplayMode();
  const { t } = useLanguage();

  return (
    <div style={{ padding: '14px 0', borderBottom: '0.5px solid rgba(40,20,5,0.10)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <DisplayIcon />
        <span style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 14, fontWeight: 600, color: 'hsl(25,30%,22%)' }}>
          {t.display}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {OPTIONS.map(({ code, labelKey, Icon }) => {
          const active = displayMode === code;
          return (
            <button
              key={code}
              onClick={() => setDisplayMode(code)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '10px 6px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: active ? GOLD : 'rgba(40,20,5,0.06)',
                color: active ? '#fff' : 'hsl(25,30%,22%)',
                fontFamily: "'Quicksand',sans-serif", fontSize: 13, fontWeight: 700,
                boxShadow: active ? '0 4px 10px rgba(212,165,116,0.4)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <Icon active={active} />
              {t[labelKey]}
            </button>
          );
        })}
      </div>
    </div>
  );
};
