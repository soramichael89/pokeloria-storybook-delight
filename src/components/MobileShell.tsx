import { ReactNode } from 'react';
import wallpaper from '@/assets/papierpaint.png';
import { useDisplayMode } from '@/contexts/DisplayModeContext';

interface MobileShellProps {
  children: ReactNode;
}

const MobileShell = ({ children }: MobileShellProps) => {
  const { isIpad } = useDisplayMode();

  // iPad : même structure exacte qu'iPhone, sans max-w ni hauteur fixe
  // → la chaîne de hauteur est identique donc le Canvas Three.js fonctionne
  if (isIpad) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-muted/50 sm:py-8">
        <div className="relative w-full h-[100dvh] sm:h-[860px] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-repeat"
            style={{ backgroundImage: `url(${wallpaper})` }}
          />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[0.5px]" />
          <div className="relative h-full z-10">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // iPhone : identique à l'original, zéro changement
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/50 sm:py-8">
      <div className="relative w-full max-w-[430px] h-[100dvh] sm:h-[860px] sm:rounded-[2.5rem] sm:shadow-card-hover overflow-hidden sm:border sm:border-border">
        <div
          className="absolute inset-0 bg-cover bg-center bg-repeat"
          style={{ backgroundImage: `url(${wallpaper})` }}
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[0.5px]" />
        <div className="relative h-full z-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileShell;
