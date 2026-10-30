import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Check, Heart, RefreshCw, Home, Filter, Award } from 'lucide-react';
import { PlayerConfig, Question, RevealData, ComparisonItem } from '../types/quiz';

interface RevealScreenProps {
  player1: PlayerConfig;
  player2: PlayerConfig;
  revealData: RevealData;
  questions: Question[];
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const RevealScreen: React.FC<RevealScreenProps> = ({
  player1,
  player2,
  revealData,
  questions,
  onPlayAgain,
  onGoHome,
}) => {
  const [filter, setFilter] = useState<'all' | 'matches' | 'different'>('all');

  // Launch tasteful celebratory confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#E8A7B8', '#DF93A7', '#F0D5DF', '#FFD1DC', '#F8E8EE'],
      });
    } catch {
      // Ignored if canvas not supported
    }
  }, []);

  // Prepare comparison items
  const comparisons: ComparisonItem[] = questions.map((q) => {
    const p1Ans = revealData.player1Answers[q.id] || 'No answer recorded';
    const p2Ans = revealData.player2Answers[q.id] || 'No answer recorded';
    const isMatch = p1Ans === p2Ans;
    return {
      questionId: q.id,
      prompt: q.prompt,
      player1Answer: p1Ans,
      player2Answer: p2Ans,
      isMatch,
    };
  });

  const matchingCount = comparisons.filter((c) => c.isMatch).length;
  const totalCount = comparisons.length || 15;
  const matchPercentage = Math.round((matchingCount / totalCount) * 100);

  const filteredComparisons = comparisons.filter((item) => {
    if (filter === 'matches') return item.isMatch;
    if (filter === 'different') return !item.isMatch;
    return true;
  });

  // Warm, balanced friendship commentary
  const getFriendlyMessage = (percent: number) => {
    if (percent >= 80) {
      return 'You two are on the exact same wavelength! A rare, telepathic connection.';
    } else if (percent >= 50) {
      return 'The perfect balance of matching vibes and fun individuality! You keep each other entertained.';
    } else {
      return 'Opposites attract in the best way possible! Your unique perspectives make your friendship one of a kind.';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Top Banner Tag */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#F0D5DF] shadow-xs text-xs font-semibold text-[#873656] mb-4">
        <Sparkles className="w-4 h-4 text-[#E8A7B8]" />
        <span>Grand Reveal • Friendship Comparison</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-[#333333] text-center tracking-tight mb-2">
        Let's See Your Answers!
      </h1>
      <p className="text-sm sm:text-base text-[#777777] text-center max-w-md mb-8">
        The secrets are out! Here is how your answers compare across all 15 friendship questions.
      </p>

      {/* Hero Score & Bestie Avatars Card */}
      <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#F0D5DF] shadow-sm mb-8 text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-36 bg-[#F8E8EE] rounded-full blur-2xl -z-0 opacity-70" />

        <div className="relative z-10">
          {/* Dual Avatars with heart connect */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6">
            {/* Player 1 */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-3 border-[#E8A7B8] p-1 bg-white shadow-xs overflow-hidden mb-2">
                <img
                  src={player1.photoUrl}
                  alt={player1.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="font-bold text-sm sm:text-base text-[#333333] max-w-[110px] truncate">
                {player1.name}
              </span>
              <span className="text-[11px] font-medium text-[#777777]">Player 1</span>
            </div>

            {/* Heart Badge in Center */}
            <div className="w-12 h-12 rounded-full bg-[#F8E8EE] border border-[#F0D5DF] flex items-center justify-center text-[#873656] shadow-xs shrink-0">
              <Heart className="w-6 h-6 fill-[#E8A7B8] text-[#E8A7B8]" />
            </div>

            {/* Player 2 */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-3 border-[#E8A7B8] p-1 bg-white shadow-xs overflow-hidden mb-2">
                <img
                  src={player2.photoUrl}
                  alt={player2.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="font-bold text-sm sm:text-base text-[#333333] max-w-[110px] truncate">
                {player2.name}
              </span>
              <span className="text-[11px] font-medium text-[#777777]">Player 2</span>
            </div>
          </div>

          {/* Score Counter */}
          <div className="bg-[#F8E8EE]/50 border border-[#F0D5DF] rounded-2xl p-4 sm:p-5 max-w-md mx-auto mb-4">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#873656] uppercase tracking-wider mb-1">
              <Award className="w-4 h-4 text-[#873656]" />
              <span>Matching Score</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#333333] tracking-tight">
              {matchingCount} / {totalCount}
            </div>
            <div className="text-sm font-semibold text-[#873656] mt-0.5">
              {matchPercentage}% Answer Compatibility
            </div>
            <div className="w-full h-2 rounded-full bg-white border border-[#F0D5DF] overflow-hidden mt-3 max-w-xs mx-auto">
              <div
                className="h-full rounded-full bg-[#E8A7B8] transition-all duration-500"
                style={{ width: `${matchPercentage}%` }}
              />
            </div>
          </div>

          {/* Friendly commentary note */}
          <p className="text-xs sm:text-sm text-[#777777] max-w-md mx-auto italic">
            "{getFriendlyMessage(matchPercentage)}"
          </p>
        </div>
      </div>

      {/* Filter Tabs & Answer List Header */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-[#333333]">All 15 Questions</span>
          <span className="text-xs text-[#777777]">
            ({comparisons.filter((c) => c.isMatch).length} matched)
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-[#F0D5DF] shadow-2xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-[#E8A7B8] text-white shadow-xs'
                : 'text-[#777777] hover:text-[#333333]'
            }`}
          >
            All (15)
          </button>
          <button
            type="button"
            onClick={() => setFilter('matches')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'matches'
                ? 'bg-[#E8A7B8] text-white shadow-xs'
                : 'text-[#777777] hover:text-[#333333]'
            }`}
          >
            Same ({matchingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('different')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'different'
                ? 'bg-[#E8A7B8] text-white shadow-xs'
                : 'text-[#777777] hover:text-[#333333]'
            }`}
          >
            Different ({totalCount - matchingCount})
          </button>
        </div>
      </div>

      {/* 15 Question Answer Comparison Cards */}
      <div className="w-full space-y-4 mb-8">
        {filteredComparisons.map((item, idx) => {
          return (
            <div
              key={item.questionId}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-[#F0D5DF] shadow-xs transition-all hover:border-[#E8A7B8]/40"
            >
              {/* Question Title & Match Badge */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#873656] bg-[#F8E8EE] px-2 py-0.5 rounded-lg border border-[#F0D5DF]">
                    Q{item.questionId}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-[#333333]">
                    {item.prompt}
                  </h3>
                </div>

                {item.isMatch ? (
                  <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF7EE] text-[#1F7A3E] border border-[#C3E6CB]">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Same answer</span>
                  </span>
                ) : (
                  <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDF2F4] text-[#9C385B] border border-[#F7CCD7]">
                    <span>Different answers</span>
                  </span>
                )}
              </div>

              {/* Answers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Player 1 Selection */}
                <div
                  className={`p-3 rounded-2xl border transition-colors ${
                    item.isMatch
                      ? 'bg-[#EBF7EE]/40 border-[#C3E6CB]/80'
                      : 'bg-[#FDF2F4]/50 border-[#F7CCD7]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={player1.photoUrl}
                      alt={player1.name}
                      className="w-5 h-5 rounded-full object-cover border border-[#E8A7B8]"
                    />
                    <span className="text-xs font-semibold text-[#777777]">
                      {player1.name}'s Answer:
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-[#333333] pl-7">
                    {item.player1Answer}
                  </div>
                </div>

                {/* Player 2 Selection */}
                <div
                  className={`p-3 rounded-2xl border transition-colors ${
                    item.isMatch
                      ? 'bg-[#EBF7EE]/40 border-[#C3E6CB]/80'
                      : 'bg-[#FDF2F4]/50 border-[#F7CCD7]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={player2.photoUrl}
                      alt={player2.name}
                      className="w-5 h-5 rounded-full object-cover border border-[#E8A7B8]"
                    />
                    <span className="text-xs font-semibold text-[#777777]">
                      {player2.name}'s Answer:
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-[#333333] pl-7">
                    {item.player2Answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onPlayAgain}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#E8A7B8] hover:bg-[#DF93A7] active:scale-[0.99] text-white font-semibold text-sm sm:text-base shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Play Again</span>
        </button>

        <button
          type="button"
          onClick={onGoHome}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border border-[#F0D5DF] text-[#777777] hover:text-[#333333] hover:bg-[#F8E8EE] font-semibold text-sm sm:text-base shadow-2xs transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
};
