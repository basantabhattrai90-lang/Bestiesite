import React, { useState } from 'react';
import { Copy, Check, Share2, Sparkles, Smartphone, ShieldCheck, ArrowRight, Clock } from 'lucide-react';
import { QuizSession, PlayerConfig } from '../types/quiz';

interface RoomLobbyProps {
  session: QuizSession;
  currentPlayerRole: 'player1' | 'player2';
  onStartQuiz: () => void;
}

export const RoomLobby: React.FC<RoomLobbyProps> = ({
  session,
  currentPlayerRole,
  onStartQuiz,
}) => {
  const [copied, setCopied] = useState(false);

  // Link for Player 2 to join
  const joinUrl = `${window.location.origin}${window.location.pathname}?room=${session.sessionId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Bestie Secret Quiz!',
          text: `${session.player1.name} invited you to the Bestie Secret Quiz! Join Room Code: ${session.sessionId}`,
          url: joinUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const isPlayer2Joined = Boolean(session.player2Joined);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Room Code & AI Theme Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#F0D5DF] shadow-xs text-xs font-semibold text-[#873656]">
          <Sparkles className="w-3.5 h-3.5 text-[#E8A7B8]" />
          <span>Room Code: {session.sessionId}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FDF2F4] border border-[#E8A7B8] shadow-xs text-xs font-semibold text-[#873656]">
          <span>✨ 15 New AI Questions</span>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-[#333333] text-center tracking-tight mb-2">
        {session.quizTitle}
      </h1>
      <p className="text-xs sm:text-sm text-[#777777] text-center max-w-md mb-6">
        Both players answer on separate phones. Keep your screen private while answering!
      </p>

      {/* Two Players Status Board */}
      <div className="w-full bg-white rounded-3xl p-6 border border-[#F0D5DF] shadow-sm mb-6">
        <div className="grid grid-cols-2 gap-4 relative">
          {/* Subtle center VS badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-[#E8A7B8] flex items-center justify-center text-[#873656] font-bold text-xs shadow-xs">
            &
          </div>

          {/* Player 1 Card */}
          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#F8E8EE]/40 border border-[#F0D5DF]">
            <div className="w-20 h-20 rounded-full border-3 border-[#E8A7B8] p-1 bg-white shadow-xs overflow-hidden mb-2">
              <img
                src={session.player1.photoUrl}
                alt={session.player1.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="font-bold text-sm sm:text-base text-[#333333] truncate max-w-[120px]">
              {session.player1.name}
            </span>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-[#EBF7EE] text-[#1F7A3E] border border-[#C3E6CB] text-[10px] font-bold">
              Player 1 (Host) Ready ✓
            </span>
          </div>

          {/* Player 2 Card */}
          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#F8E8EE]/40 border border-[#F0D5DF]">
            {isPlayer2Joined ? (
              <>
                <div className="w-20 h-20 rounded-full border-3 border-[#E8A7B8] p-1 bg-white shadow-xs overflow-hidden mb-2 animate-scale-in">
                  <img
                    src={session.player2.photoUrl}
                    alt={session.player2.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="font-bold text-sm sm:text-base text-[#333333] truncate max-w-[120px]">
                  {session.player2.name}
                </span>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-[#EBF7EE] text-[#1F7A3E] border border-[#C3E6CB] text-[10px] font-bold">
                  Player 2 Joined ✓
                </span>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-2">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#E8A7B8] flex items-center justify-center text-[#873656] mb-2 bg-white">
                  <Clock className="w-6 h-6 animate-spin text-[#E8A7B8]" />
                </div>
                <span className="font-semibold text-xs text-[#777777]">
                  Waiting for Player 2...
                </span>
                <span className="text-[10px] text-[#777777] mt-0.5">
                  Share code: <strong className="text-[#873656]">{session.sessionId}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Share Invite Link Section */}
        {!isPlayer2Joined && (
          <div className="mt-5 pt-4 border-t border-[#F0D5DF]">
            <span className="text-xs font-semibold text-[#777777] uppercase tracking-wider block mb-2">
              Invite Player 2 to This Room:
            </span>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F8E8EE]/50 border border-[#F0D5DF] mb-2.5">
              <input
                type="text"
                readOnly
                value={joinUrl}
                className="bg-transparent text-xs text-[#333333] font-mono flex-1 outline-hidden truncate"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-white border border-[#F0D5DF] hover:bg-[#F8E8EE] text-[#873656] transition-colors shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="py-2 px-3 rounded-xl border border-[#F0D5DF] bg-white hover:bg-[#F8E8EE] text-xs font-semibold text-[#333333] flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Link!' : 'Copy Invite Link'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="py-2 px-3 rounded-xl bg-[#E8A7B8] hover:bg-[#DF93A7] text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share with Friend</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Secret Privacy Banner */}
      <div className="w-full bg-white rounded-2xl p-4 border border-[#F0D5DF] shadow-2xs mb-6 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#F8E8EE] flex items-center justify-center text-[#873656] shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="text-xs text-[#777777] leading-relaxed">
          <strong className="text-[#333333] font-semibold block mb-0.5">
            Strict Secret Answer Privacy Guaranteed
          </strong>
          Each player answers 15 friendship questions independently. Neither player can see the other's selections until both players have completely submitted.
        </div>
      </div>

      {/* Start Quiz Button */}
      <button
        type="button"
        onClick={onStartQuiz}
        className="w-full py-4 px-6 rounded-2xl bg-[#E8A7B8] hover:bg-[#DF93A7] active:scale-[0.99] text-white font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>Start Answering Questions ({currentPlayerRole === 'player1' ? 'Player 1' : 'Player 2'})</span>
        <ArrowRight className="w-5 h-5" />
      </button>

      {!isPlayer2Joined && (
        <span className="text-[11px] text-[#777777] mt-3 text-center">
          You can start answering now! Player 2 can join at any time using code <strong>{session.sessionId}</strong>.
        </span>
      )}
    </div>
  );
};
