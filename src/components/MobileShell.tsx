import { ReactNode } from 'react';
import wallpaper from '@/assets/papierpaint.png';

interface MobileShellProps {
  children: ReactNode;
}

const MobileShell = ({ children }: MobileShellProps) => {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/50 sm:py-8">
      <div className="relative w-full max-w-[430px] h-[100dvh] sm:h-[860px] sm:rounded-[2.5rem] sm:shadow-card-hover overflow-hidden sm:border sm:border-border">
        {/* Wallpaper background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-repeat"
          style={{ backgroundImage: `url(${wallpaper})` }}
        />
        {/* Soft cream overlay for readability */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[0.5px]" />
        {/* Content */}
        <div className="relative h-full z-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileShell;
