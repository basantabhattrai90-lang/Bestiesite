import React, { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, Upload, KeyRound, User, Camera, Sparkles } from 'lucide-react';
import { PlayerConfig, QuizSession } from '../types/quiz';
import { getQuizSession, joinQuizRoom } from '../firebase/quizService';

interface JoinRoomFlowProps {
  initialCode?: string;
  onBack: () => void;
  onJoined: (session: QuizSession, player2: PlayerConfig) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80',
];

export const JoinRoomFlow: React.FC<JoinRoomFlowProps> = ({
  initialCode = '',
  onBack,
  onJoined,
}) => {
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState(PRESET_AVATARS[0]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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
          setErrorMsg(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Please enter a 6-character room code.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Please enter your name or nickname.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const session = await getQuizSession(cleanCode);
      if (!session) {
        setErrorMsg(`Room code "${cleanCode}" was not found. Please check with Player 1.`);
        setIsVerifying(false);
        return;
      }

      const p2Config: PlayerConfig = {
        name: name.trim(),
        photoUrl,
      };

      const updated = await joinQuizRoom(cleanCode, p2Config);
      onJoined(updated, p2Config);
    } catch (err: any) {
      console.error('Join error:', err);
      setErrorMsg('Could not connect to room. Please try again.');
    } finally {
      setIsVerifying(false);
    }
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
            Step 2 • Join Quiz Room
          </span>
        </div>

        <h2 className="text-2xl font-bold text-[#333333] mb-1">
          You are Player 2
        </h2>
        <p className="text-xs sm:text-sm text-[#777777] mb-6">
          Enter the room code shared by your best friend, enter your real name, and upload your photo to join the quiz.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#FDF2F4] border border-[#E8A7B8] text-[#873656] text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-5">
          {/* Room Code */}
          <div>
            <label className="block text-xs font-semibold text-[#777777] uppercase tracking-wider mb-1.5">
              Room Code (from Player 1)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setErrorMsg(null);
                }}
                placeholder="e.g. BESTIE"
                maxLength={8}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#F0D5DF] focus:border-[#E8A7B8] focus:ring-2 focus:ring-[#E8A7B8]/20 outline-hidden font-mono text-base font-bold uppercase tracking-wider"
              />
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-[#F8E8EE]/40 border border-[#F0D5DF]">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-full border-3 border-[#E8A7B8] p-1 bg-white shadow-xs overflow-hidden">
                <img
                  src={photoUrl}
                  alt="Player 2 Preview"
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
              Faces will not be distorted. Both photos reveal at the finish!
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
                  setErrorMsg(null);
                }}
                placeholder="e.g. Chloe"
                maxLength={30}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#F0D5DF] focus:border-[#E8A7B8] focus:ring-2 focus:ring-[#E8A7B8]/20 outline-hidden font-medium text-sm"
              />
            </div>
          </div>

          {/* Join Button */}
          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#E8A7B8] hover:bg-[#DF93A7] active:scale-[0.99] text-white font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isVerifying ? (
              <span>Verifying Room & Joining...</span>
            ) : (
              <>
                <span>Join Quiz Room</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
