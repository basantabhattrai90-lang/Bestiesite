import React, { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, Upload, Sparkles, User, Camera, Wand2, RefreshCw } from 'lucide-react';
import { PlayerConfig, Question } from '../types/quiz';
import { QUIZ_THEMES, fetchAiGeneratedQuestions } from '../services/aiQuestions';

interface CreateRoomFlowProps {
  onBack: () => void;
  onCreateRoom: (
    player1: PlayerConfig,
    quizTitle: string,
    questions?: Question[],
    theme?: string
  ) => Promise<void>;
  isCreating: boolean;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&h=400&q=80',
];

export const CreateRoomFlow: React.FC<CreateRoomFlowProps> = ({
  onBack,
  onCreateRoom,
  isCreating,
}) => {
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState(PRESET_AVATARS[0]);
  const [quizTitle, setQuizTitle] = useState('Bestie Secret Quiz');
  const [useAiQuestions, setUseAiQuestions] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('random');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPhotoUrl(dataUrl);
          setValidationError(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError('Please enter your name or nickname.');
      return;
    }

    let generatedQuestions: Question[] | undefined = undefined;

    if (useAiQuestions) {
      setIsGeneratingAi(true);
      try {
        const result = await fetchAiGeneratedQuestions({
          p1Name: name.trim(),
          p2Name: 'Bestie',
          theme: selectedTheme,
          count: 15,
        });
        generatedQuestions = result.questions;
      } catch (err) {
        console.warn('AI generation fallback to default:', err);
      } finally {
        setIsGeneratingAi(false);
      }
    }

    await onCreateRoom(
      { name: name.trim(), photoUrl },
      quizTitle.trim() || 'Bestie Secret Quiz',
      generatedQuestions,
      selectedTheme
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 flex flex-col items-center">
      <button
        type="button"
        onClick={onBack}
        className="self-start mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#873656] hover:text-[#333333] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#F0D5DF] shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#F8E8EE] flex items-center justify-center text-[#873656]">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#873656]">
            Step 1 • Create Quiz Room
          </span>
        </div>

        <h2 className="text-2xl font-bold text-[#333333] mb-1">
          You are Player 1 (Host)
        </h2>
        <p className="text-xs sm:text-sm text-[#777777] mb-6">
          Enter your name and photo, and let AI generate 15 brand new, hilarious friendship questions!
        </p>

        {validationError && (
          <div className="mb-4 p-3 rounded-xl bg-[#FDF2F4] border border-[#E8A7B8] text-[#873656] text-xs font-medium">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload Section */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-[#F8E8EE]/40 border border-[#F0D5DF]">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-full border-3 border-[#E8A7B8] p-1 bg-white shadow-xs overflow-hidden">
                <img
                  src={photoUrl}
                  alt="Player 1 Preview"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#873656] text-white flex items-center justify-center shadow-md hover:bg-[#333333] transition-colors"
                title="Upload Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-[#F0D5DF] bg-white text-xs font-semibold text-[#873656] hover:bg-[#F8E8EE] transition-colors mb-2"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Real Photo</span>
            </button>

            <span className="text-[11px] text-[#777777] text-center mb-3">
              Your real photo will be revealed after both of you complete the quiz!
            </span>

            {/* Quick avatar choices */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {PRESET_AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPhotoUrl(url)}
                  className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform ${
                    photoUrl === url ? 'border-[#873656] scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-semibold text-[#777777] uppercase tracking-wider mb-1.5">
              Your Real Name or Nickname
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setValidationError(null);
                }}
                placeholder="e.g. Maya"
                maxLength={30}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#F0D5DF] focus:border-[#E8A7B8] focus:ring-2 focus:ring-[#E8A7B8]/20 outline-hidden font-medium text-sm"
              />
            </div>
          </div>

          {/* AI Question Generation Selector */}
          <div className="p-4 rounded-2xl border-2 border-[#E8A7B8] bg-[#FDF2F4]/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-[#873656]" />
                <span className="text-xs font-bold text-[#873656] uppercase tracking-wider">
                  AI Question Generator ✨
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#333333]">
                <input
                  type="checkbox"
                  checked={useAiQuestions}
                  onChange={(e) => setUseAiQuestions(e.target.checked)}
                  className="w-4 h-4 rounded text-[#873656] focus:ring-[#E8A7B8] border-[#F0D5DF]"
                />
                <span>Generate New Questions</span>
              </label>
            </div>

            <p className="text-[11px] text-[#777777] leading-relaxed">
              Gemini AI crafts 15 brand new, unique friendship questions each round so you never have to repeat the same quiz!
            </p>

            {useAiQuestions && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-semibold text-[#777777] block">
                  Select Question Theme:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {QUIZ_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedTheme === theme.id
                          ? 'border-[#873656] bg-white text-[#873656] shadow-2xs font-semibold'
                          : 'border-[#F0D5DF] bg-white/70 text-[#777777] hover:border-[#E8A7B8]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                        <span>{theme.icon}</span>
                        <span className="truncate">{theme.label}</span>
                      </div>
                      <span className="text-[10px] text-[#777777] line-clamp-1">
                        {theme.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quiz Title */}
          <div>
            <label className="block text-xs font-semibold text-[#777777] uppercase tracking-wider mb-1.5">
              Quiz Room Title (Optional)
            </label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="Bestie Secret Quiz"
              maxLength={50}
              className="w-full px-4 py-2.5 rounded-xl border border-[#F0D5DF] focus:border-[#E8A7B8] focus:ring-2 focus:ring-[#E8A7B8]/20 outline-hidden text-sm"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isCreating || isGeneratingAi}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#E8A7B8] hover:bg-[#DF93A7] active:scale-[0.99] text-white font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGeneratingAi ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Generating 15 Unique Questions with AI...</span>
              </>
            ) : isCreating ? (
              <span>Creating Room...</span>
            ) : (
              <>
                <span>Create Room & Get Code</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
