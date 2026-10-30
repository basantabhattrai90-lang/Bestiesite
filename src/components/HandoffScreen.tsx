import React from 'react';
import { Lock, Smartphone, ArrowRight, ShieldCheck } from 'lucide-react';
import { PlayerConfig } from '../types/quiz';

interface HandoffScreenProps {
  player1: PlayerConfig;
  player2: PlayerConfig;
  onContinueToPlayer2: () => void;
}

export const HandoffScreen: React.FC<HandoffScreenProps> = ({
  player1,
  player2,
  onContinueToPlayer2,
}) => {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-12 flex flex-col items-center text-center">
      {/* Locked Badge */}
      <div className="w-20 h-20 rounded-full bg-white border-2 border-[#E8A7B8] flex items-center justify-center text-[#873656] shadow-md mb-6 relative">
        <Lock className="w-9 h-9 text-[#873656]" />
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#EBF7EE] border border-[#A3D9B1] flex items-center justify-center text-[#1F7A3E]">
          <ShieldCheck className="w-4 h-4" />
        </div>
      </div>

      <div className="inline-block px-3.5 py-1 rounded-full bg-white border border-[#F0D5DF] text-xs font-semibold text-[#873656] mb-3">
        Answers Sealed & Encrypted
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-[#333333] mb-3 tracking-tight">
        {player1.name}'s Answers Are Locked!
      </h1>

      <p className="text-sm text-[#777777] max-w-xs mb-8 leading-relaxed">
        Your 15 answers are safely stored in secret. Neither player can see each other's answers until both have submitted!
      </p>

      {/* Pass phone card */}
      <div className="w-full bg-white rounded-3xl p-6 border border-[#F0D5DF] shadow-sm mb-8 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full border-2 border-[#E8A7B8] p-0.5 overflow-hidden mb-3 bg-[#F8E8EE]">
          <img
            src={player2.photoUrl}
            alt={player2.name}
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <div className="flex items-center gap-2 text-sm font-bold text-[#333333] mb-1">
          <Smartphone className="w-4 h-4 text-[#873656]" />
          <span>Pass the phone to {player2.name}</span>
        </div>

        <p className="text-xs text-[#777777] max-w-xs">
          Hand the device to <span className="font-semibold text-[#333333]">{player2.name}</span> so they can answer the same 15 questions independently.
        </p>
      </div>

      {/* Button to start Player 2 */}
      <button
        onClick={onContinueToPlayer2}
        className="w-full py-3.5 px-6 rounded-2xl bg-[#E8A7B8] hover:bg-[#DF93A7] active:scale-[0.99] text-white font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>I am {player2.name}, Start My Quiz</span>
        <ArrowRight className="w-5 h-5" />
      </button>

      <span className="text-[11px] text-[#777777] mt-4">
        Previous answers cannot be viewed during Player 2's turn.
      </span>
    </div>
  );
};
