import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Language, useLanguage } from '@/contexts/LanguageContext';
import { useStories } from '@/contexts/StoriesContext';
import { GOLD } from '@/lib/theme';

interface SettingsScreenProps {
  onClose: () => void;
}

const ADMIN_CODE = '1234';

const LANG_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: 'FR' },
  { code: 'es', label: 'Español',  flag: 'ES' },
  { code: 'gl', label: 'Galego',   flag: 'GL' },
];

const MusicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(25,30%,28%)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V6l10-2v12"/>
    <circle cx="6" cy="18" r="2.6" fill="hsl(25,30%,28%)" stroke="none"/>
    <circle cx="16" cy="16" r="2.6" fill="hsl(25,30%,28%)" stroke="none"/>
    <path d="M20.5 3.5l0.6 1.4 1.4 0.6-1.4 0.6-0.6 1.4-0.6-1.4-1.4-0.6 1.4-0.6z" fill="hsl(25,30%,28%)" stroke="none"/>
  </svg>
);

const LangIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(25,30%,28%)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="13" r="7"/>
    <path d="M4 13h14M11 6a11 11 0 0 1 3 7 11 11 0 0 1-3 7 11 11 0 0 1-3-7 11 11 0 0 1 3-7z"/>
    <path d="M19.5 3.5l0.5 1.2 1.2 0.5-1.2 0.5-0.5 1.2-0.5-1.2-1.2-0.5 1.2-0.5z" fill="hsl(25,30%,28%)" stroke="none"/>
  </svg>
);

const SettingsScreen = ({ onClose }: SettingsScreenProps) => {
  const { language, setLanguage, t } = useLanguage();
  const { stories } = useStories();
  const [sound, setSound] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [selectedStory, setSelectedStory] = useState<string | null>(null);

  const handleAdminUnlock = () => {
    if (adminCode === ADMIN_CODE) {
      setIsAdmin(true);
      setShowAdminPrompt(false);
      setAdminCode('');
    } else {
      setAdminCode('');
    }
  };

  const handleExport = (storyId: string) => {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;
    toast.loading(t.exporting, { id: 'pdf-export' });
    setTimeout(() => {
      toast.success(t.exportSuccess, { id: 'pdf-export' });
    }, 1500);
  };

  const selected = stories.find(s => s.id === selectedStory);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(40,20,5,0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 430,
          background: 'rgba(255,250,242,0.97)',
          borderRadius: '24px 24px 0 0',
          padding: '14px 22px 36px',
          boxShadow: '0 -10px 30px rgba(40,20,5,0.25)',
        }}
      >
        {/* Handle */}
        <div style={{ width: 42, height: 4, borderRadius: 2, background: 'rgba(40,20,5,0.2)', margin: '0 auto 16px' }} />

        <AnimatePresence mode="wait">
          {selectedStory && selected ? (
            <motion.div key="story-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <button
                  onClick={() => setSelectedStory(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'hsl(25,30%,40%)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                  </svg>
                </button>
                <span style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 16, fontWeight: 700, color: 'hsl(25,30%,18%)' }}>{selected.title}</span>
              </div>
              <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
                <img src={selected.coverImage} alt="" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
              </div>
              <p style={{ fontSize: 13, fontFamily: "'Nunito',sans-serif", color: 'hsl(25,15%,50%)', marginBottom: 4 }}>{selected.theme}</p>
              <p style={{ fontSize: 13, fontFamily: "'Nunito',sans-serif", color: 'hsl(25,15%,50%)', marginBottom: 20 }}>{selected.pages.length} pages</p>
              <button
                onClick={() => handleExport(selected.id)}
                style={{
                  width: '100%', padding: '13px 0', borderRadius: 16, border: 'none',
                  background: GOLD, color: '#fff', cursor: 'pointer',
                  fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                {t.exportPdf}
              </button>
            </motion.div>
          ) : (
            <motion.div key="main" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {/* Title */}
              <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 17, fontWeight: 700, color: 'hsl(25,30%,18%)', marginBottom: 8 }}>
                {t.settings}
              </div>

              {/* Sound toggle */}
              <div
                onClick={() => setSound(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 0', borderBottom: '0.5px solid rgba(40,20,5,0.10)', cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <MusicIcon />
                  <span style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 14, fontWeight: 600, color: 'hsl(25,30%,22%)' }}>{t.sounds}</span>
                </div>
                {/* iOS-style pill toggle */}
                <div style={{
                  width: 42, height: 24, borderRadius: 12, padding: 2,
                  background: sound ? GOLD : 'rgba(40,20,5,0.18)',
                  transition: 'background 0.2s',
                  display: 'flex', alignItems: 'center', flexShrink: 0,
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 10, background: '#fff',
                    transform: `translateX(${sound ? 18 : 0}px)`,
                    transition: 'transform 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
              </div>

              {/* Language picker */}
              <div style={{ padding: '14px 0', borderBottom: '0.5px solid rgba(40,20,5,0.10)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <LangIcon />
                  <span style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 14, fontWeight: 600, color: 'hsl(25,30%,22%)' }}>{t.language}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {LANG_OPTIONS.map(opt => {
                    const active = opt.code === language;
                    return (
                      <button
                        key={opt.code}
                        onClick={() => setLanguage(opt.code)}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '10px 6px', borderRadius: 14, border: 'none', cursor: 'pointer',
                          background: active ? GOLD : 'rgba(40,20,5,0.06)',
                          color: active ? '#fff' : 'hsl(25,30%,22%)',
                          fontFamily: "'Quicksand',sans-serif", fontSize: 12, fontWeight: 700,
                          boxShadow: active ? '0 4px 10px rgba(212,165,116,0.4)' : 'none',
                          transition: 'all 0.2s',
                        }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.5px' }}>
                          {opt.flag}
                        </span>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Admin section */}
              <div style={{ paddingTop: 14 }}>
                {isAdmin ? (
                  <>
                    <p style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 11, fontWeight: 700, color: 'hsl(25,15%,50%)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                      {t.adminStories}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {stories.map(story => (
                        <button
                          key={story.id}
                          onClick={() => setSelectedStory(story.id)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 12px', borderRadius: 12, border: 'none',
                            background: 'rgba(40,20,5,0.04)', cursor: 'pointer',
                            fontFamily: "'Nunito',sans-serif", fontSize: 13, color: 'hsl(25,30%,22%)',
                          }}
                        >
                          <span>{story.title}</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                      ))}
                    </div>
                  </>
                ) : showAdminPrompt ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="password"
                      value={adminCode}
                      onChange={e => setAdminCode(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAdminUnlock()}
                      placeholder="••••"
                      style={{
                        flex: 1, padding: '10px 14px', borderRadius: 12,
                        border: '1px solid rgba(40,20,5,0.15)', background: 'rgba(40,20,5,0.04)',
                        fontFamily: "'Nunito',sans-serif", fontSize: 14, outline: 'none',
                        color: 'hsl(25,30%,22%)',
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleAdminUnlock}
                      style={{
                        padding: '10px 16px', borderRadius: 12, border: 'none',
                        background: GOLD, color: '#fff', cursor: 'pointer',
                        fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 13,
                      }}
                    >OK</button>
                    <button
                      onClick={() => { setShowAdminPrompt(false); setAdminCode(''); }}
                      style={{
                        padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(40,20,5,0.15)',
                        background: 'transparent', cursor: 'pointer', color: 'hsl(25,15%,50%)',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAdminPrompt(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(40,20,5,0.12)',
                      background: 'transparent', cursor: 'pointer',
                      fontFamily: "'Quicksand',sans-serif", fontSize: 12, color: 'hsl(25,15%,55%)',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Admin
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default SettingsScreen;
