import React from 'react';
import { Heart, ShieldCheck, Home } from 'lucide-react';

interface NavbarProps {
  onGoHome: () => void;
  onOpenAdmin: () => void;
  sessionCode?: string | null;
  isAdminOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onGoHome,
  onOpenAdmin,
  sessionCode,
  isAdminOpen,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F0D5DF] shadow-xs">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
          aria-label="Go to home"
        >
          <div className="w-9 h-9 rounded-full bg-[#F8E8EE] border border-[#F0D5DF] flex items-center justify-center text-[#E8A7B8] shadow-xs group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 fill-[#E8A7B8] text-[#E8A7B8]" />
          </div>
          <div>
            <span className="font-semibold text-base text-[#333333] tracking-tight block">
              Bestie Secret Quiz
            </span>
            <span className="text-[11px] text-[#777777] block -mt-0.5">
              Secret Friendship Quiz
            </span>
          </div>
        </button>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {sessionCode && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8E8EE] border border-[#F0D5DF] text-xs font-medium text-[#777777]">
              <span>Code:</span>
              <span className="font-mono font-semibold text-[#873656] tracking-wider">
                {sessionCode}
              </span>
            </div>
          )}

          <button
            onClick={onGoHome}
            className="p-2 rounded-xl text-[#777777] hover:text-[#333333] hover:bg-[#F8E8EE] transition-colors"
            title="Home"
            aria-label="Home"
          >
            <Home className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenAdmin}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              isAdminOpen
                ? 'bg-[#E8A7B8] text-white shadow-xs'
                : 'text-[#777777] hover:text-[#333333] hover:bg-[#F8E8EE] border border-transparent hover:border-[#F0D5DF]'
            }`}
            title="Creator Admin Access"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
