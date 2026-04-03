import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { Language, useLanguage } from '@/contexts/LanguageContext';

interface SettingsScreenProps {
  onClose: () => void;
}

const languages: Language[] = ['fr', 'es', 'gl'];

const SettingsScreen = ({ onClose }: SettingsScreenProps) => {
  const { language, setLanguage, t, languageLabels } = useLanguage();

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
            onClick={onClose}
            className="p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">{t.settings}</h1>
        </div>

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
      </motion.div>
    </motion.div>
  );
};

export default SettingsScreen;
