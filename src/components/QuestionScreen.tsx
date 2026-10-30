import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Send, AlertCircle } from 'lucide-react';
import { Question, PlayerConfig, AnswersMap } from '../types/quiz';
import { formatQuestionOptions } from '../data/defaultQuestions';

interface QuestionScreenProps {
  questions: Question[];
  currentPlayer: PlayerConfig;
  playerRole: 'player1' | 'player2';
  otherPlayer: PlayerConfig;
  initialAnswers?: AnswersMap;
  onAnswersChange?: (answers: AnswersMap) => void;
  onSubmit: (answers: AnswersMap) => Promise<void>;
  isSubmitting?: boolean;
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  questions,
  currentPlayer,
  playerRole,
  otherPlayer,
  initialAnswers = {},
  onAnswersChange,
  onSubmit,
  isSubmitting = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersMap>(initialAnswers);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync initialAnswers if provided
  useEffect(() => {
    if (Object.keys(initialAnswers).length > 0 && Object.keys(answers).length === 0) {
      setAnswers(initialAnswers);
    }
  }, [initialAnswers]);

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  // Calculate personalized options using player 1 and player 2 names
  const p1Name = playerRole === 'player1' ? currentPlayer.name : otherPlayer.name;
  const p2Name = playerRole === 'player1' ? otherPlayer.name : currentPlayer.name;
  const formattedOptions = formatQuestionOptions(currentQ.options, p1Name, p2Name);

  const selectedAnswer = answers[currentQ.id];

  const handleSelectOption = (optionText: string) => {
    const updated = { ...answers, [currentQ.id]: optionText };
    setAnswers(updated);
    setValidationError(null);
    if (onAnswersChange) {
      onAnswersChange(updated);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setValidationError(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setValidationError(null);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentIndex(index);
    setValidationError(null);
  };

  const handleSubmit = async () => {
    // Validate all questions answered
    const unansweredIndex = questions.findIndex((q) => !answers[q.id]);
    if (unansweredIndex !== -1) {
      setValidationError(`Please answer Question ${unansweredIndex + 1} before submitting.`);
      setCurrentIndex(unansweredIndex);
      return;
    }

    await onSubmit(answers);
  };

  const answeredCount = Object.keys(answers).filter(
    (k) => answers[Number(k)] && answers[Number(k)].trim() !== ''
  ).length;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Player Header Banner */}
      <div className="bg-white rounded-2xl p-4 border border-[#F0D5DF] shadow-xs mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full border-2 border-[#E8A7B8] p-0.5 overflow-hidden shrink-0 shadow-xs bg-[#F8E8EE]">
            <img
              src={currentPlayer.photoUrl}
              alt={currentPlayer.name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[#873656] uppercase tracking-wider">
              {playerRole === 'player1' ? 'Player 1' : 'Player 2'} Turn
            </div>
            <div className="font-semibold text-sm text-[#333333]">
              {currentPlayer.name}'s Secret Answers
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-[#873656] bg-[#F8E8EE] px-2.5 py-1 rounded-full border border-[#F0D5DF]">
            {answeredCount} / {totalQuestions} answered
          </span>
        </div>
      </div>

      {/* Progress Bar & Question Counter */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-medium text-[#777777] mb-2">
          <span>Question {currentIndex + 1} of {totalQuestions}</span>
          <span>{progressPercent}% completed</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-white border border-[#F0D5DF] overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-[#E8A7B8] transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F0D5DF] shadow-sm mb-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Question Prompt */}
          <div className="mb-6">
            <span className="inline-block text-xs font-bold text-[#873656] bg-[#FDF2F4] px-2.5 py-1 rounded-lg border border-[#F0D5DF] mb-3">
              #{currentIndex + 1}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#333333] leading-snug">
              {currentQ.prompt}
            </h2>
          </div>

          {/* Validation Notice if attempting submit early */}
          {validationError && (
            <div className="mb-4 p-3 rounded-xl bg-[#FDF2F4] border border-[#E8A7B8] text-[#873656] text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Answer Options */}
          <div className="space-y-3">
            {formattedOptions.map((option, idx) => {
              const letters = ['A', 'B', 'C', 'D'];
              const isSelected = selectedAnswer === option;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-150 flex items-center justify-between group active:scale-[0.99] cursor-pointer ${
                    isSelected
                      ? 'border-[#E8A7B8] bg-[#FDF2F4] shadow-xs'
                      : 'border-[#F0D5DF] bg-white hover:border-[#E8A7B8]/60 hover:bg-[#F8E8EE]/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 pr-2">
                    <div
                      className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#E8A7B8] text-white'
                          : 'bg-[#F8E8EE] text-[#777777] group-hover:bg-[#E8A7B8]/20 group-hover:text-[#873656]'
                      }`}
                    >
                      {letters[idx]}
                    </div>
                    <span
                      className={`text-sm sm:text-base font-medium leading-tight ${
                        isSelected ? 'text-[#873656] font-semibold' : 'text-[#333333]'
                      }`}
                    >
                      {option}
                    </span>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'border-[#E8A7B8] bg-[#E8A7B8] text-white'
                        : 'border-[#F0D5DF] bg-white text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Question Picker Strip */}
        <div className="mt-8 pt-4 border-t border-[#F0D5DF]">
          <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(answers[q.id]);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => handleJumpToQuestion(idx)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-semibold text-xs flex items-center justify-center shrink-0 transition-all ${
                    isCurrent
                      ? 'bg-[#873656] text-white shadow-xs scale-105'
                      : isAnswered
                      ? 'bg-[#E8A7B8]/30 text-[#873656] hover:bg-[#E8A7B8]/50'
                      : 'bg-[#F8E8EE] text-[#777777] hover:bg-[#F0D5DF]'
                  }`}
                  title={`Question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-5 py-3 rounded-2xl bg-white border border-[#F0D5DF] text-[#777777] hover:text-[#333333] hover:bg-[#F8E8EE] disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {currentIndex === totalQuestions - 1 ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 px-6 rounded-2xl bg-[#E8A7B8] hover:bg-[#DF93A7] active:scale-[0.99] text-white font-semibold text-sm sm:text-base shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Saving Answers...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit My 15 Answers</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 py-3 px-6 rounded-2xl bg-[#E8A7B8] hover:bg-[#DF93A7] active:scale-[0.99] text-white font-semibold text-sm sm:text-base shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Next Question</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
