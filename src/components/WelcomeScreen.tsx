import React, { useState } from 'react';
import { Sparkles, PlusCircle, LogIn, Smartphone, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { PlayerConfig } from '../types/quiz';

interface WelcomeScreenProps {
  player1: PlayerConfig;
  player2: PlayerConfig;
  quizTitle: string;
  welcomeMessage?: string;
  onOpenCreateRoom: () => void;
  onOpenJoinRoom: (prefillCode?: string) => void;
  onStartSinglePhone: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  player1,
  player2,
  quizTitle,
  welcomeMessage,
  onOpenCreateRoom,
  onOpenJoinRoom,
  onStartSinglePhone,
}) => {
  const [quickCode, setQuickCode] = useState('');

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickCode.trim()) {
      onOpenJoinRoom(quickCode.trim().toUpperCase());
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Top Banner Tag */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#F0D5DF] shadow-xs text-xs font-semibold text-[#873656] mb-5">
        <Sparkles className="w-3.5 h-3.5 text-[#E8A7B8]" />
        <span>15 Secret Questions • 2 Players • One Big Reveal</span>
      </div>

      {/* Main Title & Subtitle */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-[#333333] text-center tracking-tight mb-2">
        {quizTitle || 'Bestie Secret Quiz'}
      </h1>
      <p className="text-xs sm:text-sm text-[#777777] text-center max-w-md mb-8 leading-relaxed">
        {welcomeMessage || 'Two best friends answer 15 secret friendship questions on their own phones. Neither can see the other’s answers until both submit!'}
      </p>

      {/* Main Two-Player Action Cards: Create Quiz vs Join Quiz */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Card 1: Create Quiz */}
        <div className="bg-white rounded-3xl p-6 border-2 border-[#E8A7B8] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#FDF2F4] border border-[#F0D5DF] flex items-center justify-center text-[#873656] mb-4 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-6 h-6 text-[#873656]" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#873656] block mb-1">
              Start as Player 1
            </span>
            <h2 className="text-lg font-bold text-[#333333] mb-1.5">
              Create Quiz Room
            </h2>
            <p className="text-xs text-[#777777] leading-relaxed mb-6">
              Enter your real name, upload your photo, and generate a 6-character room code or invite link for your bestie.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenCreateRoom}
            className="w-full py-3 px-4 rounded-xl bg-[#E8A7B8] hover:bg-[#DF93A7] active:scale-[0.99] text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Create New Room</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 2: Join Quiz */}
        <div className="bg-white rounded-3xl p-6 border border-[#F0D5DF] shadow-sm hover:border-[#E8A7B8]/70 hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#F8E8EE] border border-[#F0D5DF] flex items-center justify-center text-[#873656] mb-4 group-hover:scale-105 transition-transform">
              <LogIn className="w-6 h-6 text-[#873656]" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#873656] block mb-1">
              Join as Player 2
            </span>
            <h2 className="text-lg font-bold text-[#333333] mb-1.5">
              Join Quiz Room
            </h2>
            <p className="text-xs text-[#777777] leading-relaxed mb-6">
              Have a room code or link from your bestie? Enter the code, upload your photo, and join the secret room!
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenJoinRoom()}
            className="w-full py-3 px-4 rounded-xl border-2 border-[#E8A7B8] bg-white hover:bg-[#FDF2F4] text-[#873656] font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Join with Room Code</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Code Join Bar */}
      <div className="w-full bg-white rounded-2xl p-4 border border-[#F0D5DF] shadow-2xs mb-6">
        <form onSubmit={handleQuickJoin} className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={quickCode}
            onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
            placeholder="Enter Room Code (e.g. BESTIE)"
            maxLength={8}
            className="w-full sm:flex-1 px-4 py-2 rounded-xl border border-[#F0D5DF] font-mono uppercase text-xs sm:text-sm font-semibold tracking-wider outline-hidden focus:border-[#E8A7B8]"
          />
          <button
            type="submit"
            disabled={!quickCode.trim()}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#F8E8EE] hover:bg-[#F0D5DF] text-[#873656] disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition-colors shrink-0"
          >
            Fast Join
          </button>
        </form>
      </div>

      {/* Or Single Phone Pass-and-Play Option */}
      <div className="w-full bg-white/70 rounded-2xl p-4 border border-[#F0D5DF] flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white border border-[#F0D5DF] flex items-center justify-center text-[#873656] shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-[#333333]">Together right now in person?</h3>
            <p className="text-[11px] text-[#777777]">
              Play in Pass-and-Play mode on a single shared phone
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onStartSinglePhone}
          className="px-4 py-2 rounded-xl bg-white border border-[#F0D5DF] hover:bg-[#F8E8EE] text-[#873656] font-semibold text-xs transition-colors shrink-0"
        >
          Single Phone Mode
        </button>
      </div>

      {/* Feature Guarantee Pillars */}
      <div className="w-full grid grid-cols-3 gap-2 text-center">
        <div className="bg-white p-3 rounded-2xl border border-[#F0D5DF] shadow-2xs">
          <div className="w-6 h-6 rounded-full bg-[#F8E8EE] mx-auto mb-1.5 flex items-center justify-center text-[#873656]">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-[11px] text-[#333333] block">100% Private</span>
          <span className="text-[10px] text-[#777777]">Answers sealed</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-[#F0D5DF] shadow-2xs">
          <div className="w-6 h-6 rounded-full bg-[#F8E8EE] mx-auto mb-1.5 flex items-center justify-center text-[#873656]">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-[11px] text-[#333333] block">2 Phones</span>
          <span className="text-[10px] text-[#777777]">Live sync</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-[#F0D5DF] shadow-2xs">
          <div className="w-6 h-6 rounded-full bg-[#F8E8EE] mx-auto mb-1.5 flex items-center justify-center text-[#873656]">
            <Heart className="w-3.5 h-3.5 fill-[#E8A7B8] text-[#E8A7B8]" />
          </div>
          <span className="font-bold text-[11px] text-[#333333] block">Big Reveal</span>
          <span className="text-[10px] text-[#777777]">Match score & photos</span>
        </div>
      </div>
    </div>
  );
};
