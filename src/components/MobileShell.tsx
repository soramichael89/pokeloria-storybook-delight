import { ReactNode } from 'react';

interface MobileShellProps {
  children: ReactNode;
}

const MobileShell = ({ children }: MobileShellProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 sm:py-8">
      <div className="relative w-full max-w-[430px] h-screen sm:h-[860px] sm:rounded-[2.5rem] sm:shadow-card-hover bg-background overflow-hidden sm:border sm:border-border">
        {children}
      </div>
    </div>
  );
};

export default MobileShell;
