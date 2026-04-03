import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, ChevronRight, Download, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Language, useLanguage } from '@/contexts/LanguageContext';
import { stories } from '@/data/stories';

interface SettingsScreenProps {
  onClose: () => void;
}

const languages: Language[] = ['fr', 'es', 'gl'];

const ADMIN_CODE = '1234';

const SettingsScreen = ({ onClose }: SettingsScreenProps) => {
  const { language, setLanguage, t, languageLabels } = useLanguage();
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
      className="fixed inset-0 z-50 flex items-start justify-center bg-muted/50 sm:py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-[430px] min-h-screen sm:min-h-[860px] sm:rounded-[2.5rem] sm:shadow-card-hover bg-background overflow-hidden sm:border sm:border-border"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-14 pb-4">
          <button
            onClick={selectedStory ? () => setSelectedStory(null) : onClose}
            className="p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">
            {selectedStory ? selected?.title : t.settings}
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {selectedStory && selected ? (
            /* ─── Story detail (admin) ─── */
            <motion.div
              key="story-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-5 mt-4"
            >
              <div className="rounded-2xl overflow-hidden border border-border/50 mb-5">
                <img src={selected.coverImage} alt="" className="w-full aspect-[16/9] object-cover" />
              </div>
              <p className="text-sm font-body text-muted-foreground mb-1">{selected.theme}</p>
              <p className="text-sm font-body text-muted-foreground mb-6">
                {selected.pages.length} pages
              </p>
              <button
                onClick={() => handleExport(selected.id)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground font-display font-semibold text-sm transition-all active:scale-[0.97]"
              >
                <Download className="w-4 h-4" />
                {t.exportPdf}
              </button>
            </motion.div>
          ) : (
            /* ─── Main settings ─── */
            <motion.div
              key="main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Language section */}
              <div className="px-5 mt-4">
                <p className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {t.language}
                </p>
                <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
                  {languages.map((lang, i) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors ${
                        i < languages.length - 1 ? 'border-b border-border/30' : ''
                      } ${language === lang ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                    >
                      <span className="font-body text-sm text-foreground">{languageLabels[lang]}</span>
                      {language === lang && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin section */}
              {isAdmin ? (
                <div className="px-5 mt-8">
                  <p className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {t.adminStories}
                  </p>
                  <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
                    {stories.map((story, i) => (
                      <button
                        key={story.id}
                        onClick={() => setSelectedStory(story.id)}
                        className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-muted/50 ${
                          i < stories.length - 1 ? 'border-b border-border/30' : ''
                        }`}
                      >
                        <span className="font-body text-sm text-foreground">{story.title}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-5 mt-8">
                  {showAdminPrompt ? (
                    <div className="rounded-2xl bg-card border border-border/50 p-5">
                      <p className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Code admin
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={adminCode}
                          onChange={e => setAdminCode(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAdminUnlock()}
                          placeholder="••••"
                          className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                          autoFocus
                        />
                        <button
                          onClick={handleAdminUnlock}
                          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm"
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAdminPrompt(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-border/30 text-muted-foreground hover:text-foreground font-body text-xs transition-colors"
                    >
                      <Lock className="w-3 h-3" />
                      Admin
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default SettingsScreen;
