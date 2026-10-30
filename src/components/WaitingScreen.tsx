import React, { useState } from 'react';
import { Copy, Check, Share2, Sparkles, Clock, Lock, ArrowRight } from 'lucide-react';
import { PlayerConfig } from '../types/quiz';

interface WaitingScreenProps {
  sessionId: string;
  currentPlayer: PlayerConfig;
  waitingForPlayer: PlayerConfig;
  playerRole: 'player1' | 'player2';
  bothSubmitted: boolean;
  onReveal: () => void;
}

export const WaitingScreen: React.FC<WaitingScreenProps> = ({
  sessionId,
  currentPlayer,
  waitingForPlayer,
  bothSubmitted,
  onReveal,
}) => {
  const [copied, setCopied] = useState(false);

  // Build join URL
  const joinUrl = `${window.location.origin}${window.location.pathname}?session=${sessionId}&player=2`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bestie Secret Quiz',
          text: `${currentPlayer.name} wants to see how well you two know each other! Join the secret quiz here:`,
          url: joinUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-10 flex flex-col items-center text-center">
      {bothSubmitted ? (
        // State A: Both players are done! Ready to reveal!
        <>
          <div className="w-20 h-20 rounded-full bg-white border-2 border-[#E8A7B8] flex items-center justify-center text-[#873656] shadow-md mb-6 animate-bounce">
            <Sparkles className="w-10 h-10 text-[#873656]" />
          </div>

          <div className="inline-block px-3.5 py-1 rounded-full bg-[#EBF7EE] border border-[#A3D9B1] text-xs font-semibold text-[#1F7A3E] mb-3">
            Both Players Submitted!
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#333333] mb-3 tracking-tight">
            The Secrets Are Ready to Unlock!
          </h1>

          <p className="text-sm text-[#777777] max-w-xs mb-8 leading-relaxed">
            Both you and <span className="font-semibold text-[#333333]">{waitingForPlayer.name}</span> have finished answering all 15 questions.
          </p>

          {/* Reveal Button */}
          <button
            onClick={onReveal}
            className="w-full py-4 px-6 rounded-2xl bg-[#E8A7B8] hover:bg-[#DF93A7] active:scale-[0.99] text-white font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
            <span>Reveal Both Answers</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </>
      ) : (
        // State B: Waiting for friend to submit
        <>
          <div className="w-20 h-20 rounded-full bg-white border-2 border-[#E8A7B8] flex items-center justify-center text-[#873656] shadow-md mb-6 relative">
            <Clock className="w-9 h-9 text-[#873656] animate-pulse" />
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#F8E8EE] border border-[#F0D5DF] flex items-center justify-center text-[#873656]">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="inline-block px-3.5 py-1 rounded-full bg-white border border-[#F0D5DF] text-xs font-semibold text-[#873656] mb-3">
            Answers Sealed in Vault
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#333333] mb-2 tracking-tight">
            Waiting for {waitingForPlayer.name}...
          </h1>

          <p className="text-sm text-[#777777] max-w-xs mb-8 leading-relaxed">
            Your answers are safely locked. The reveal button unlocks automatically the moment {waitingForPlayer.name} submits!
          </p>

          {/* Share Box */}
          <div className="w-full bg-white rounded-3xl p-6 border border-[#F0D5DF] shadow-sm mb-6 text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#777777] uppercase tracking-wider">
                Friend's Quiz Invite
              </span>
              <span className="text-xs font-mono font-bold text-[#873656] bg-[#F8E8EE] px-2.5 py-0.5 rounded-full border border-[#F0D5DF]">
                CODE: {sessionId}
              </span>
            </div>

            <p className="text-xs text-[#777777] mb-4">
              Send this link to <span className="font-semibold text-[#333333]">{waitingForPlayer.name}</span> so they can open the quiz on their own phone:
            </p>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8E8EE]/60 border border-[#F0D5DF] mb-3">
              <input
                type="text"
                readOnly
                value={joinUrl}
                className="bg-transparent text-xs text-[#333333] font-mono flex-1 outline-hidden truncate"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="p-2 rounded-lg bg-white border border-[#F0D5DF] hover:bg-[#F8E8EE] text-[#873656] transition-colors shrink-0"
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 py-2 px-3 rounded-xl border border-[#F0D5DF] bg-white hover:bg-[#F8E8EE] text-xs font-semibold text-[#333333] flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex-1 py-2 px-3 rounded-xl bg-[#E8A7B8] hover:bg-[#DF93A7] text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share with Bestie</span>
              </button>
            </div>
          </div>

          {/* Pulse status indicator */}
          <div className="flex items-center gap-2 text-xs text-[#777777] bg-white px-4 py-2 rounded-full border border-[#F0D5DF]">
            <span className="w-2 h-2 rounded-full bg-[#E8A7B8] animate-ping" />
            <span>Listening live for {waitingForPlayer.name}'s submission...</span>
          </div>
        </>
      )}
    </div>
  );
};
