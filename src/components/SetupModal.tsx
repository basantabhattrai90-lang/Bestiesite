import React, { useState, useRef } from 'react';
import { X, Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import { PlayerConfig } from '../types/quiz';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  player1: PlayerConfig;
  player2: PlayerConfig;
  quizTitle: string;
  welcomeMessage: string;
  onSave: (data: {
    player1: PlayerConfig;
    player2: PlayerConfig;
    quizTitle: string;
    welcomeMessage: string;
  }) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=400&q=80',
];

export const SetupModal: React.FC<SetupModalProps> = ({
  isOpen,
  onClose,
  player1: initialP1,
  player2: initialP2,
  quizTitle: initialTitle,
  welcomeMessage: initialWelcome,
  onSave,
}) => {
  const [p1, setP1] = useState<PlayerConfig>(initialP1);
  const [p2, setP2] = useState<PlayerConfig>(initialP2);
  const [title, setTitle] = useState(initialTitle);
  const [welcome, setWelcome] = useState(initialWelcome);
  const [activeTab, setActiveTab] = useState<'p1' | 'p2' | 'general'>('p1');

  const fileInputP1 = useRef<HTMLInputElement>(null);
  const fileInputP2 = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process image file to standard compressed data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, playerKey: 'p1' | 'p2') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize canvas to max 400x400 for fast mobile performance
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
          if (playerKey === 'p1') {
            setP1((prev) => ({ ...prev, photoUrl: dataUrl }));
          } else {
            setP2((prev) => ({ ...prev, photoUrl: dataUrl }));
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      player1: {
        name: p1.name.trim() || 'Player 1',
        photoUrl: p1.photoUrl,
      },
      player2: {
        name: p2.name.trim() || 'Player 2',
        photoUrl: p2.photoUrl,
      },
      quizTitle: title.trim() || 'Bestie Secret Quiz',
      welcomeMessage: welcome.trim() || 'How well do you two really know each other?',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-[#F0D5DF] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F0D5DF] flex items-center justify-between bg-[#F8E8EE]/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#873656]" />
            <h2 className="text-lg font-semibold text-[#333333]">Customize Bestie Quiz</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#777777] hover:text-[#333333] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-[#F0D5DF] px-6 pt-2 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('p1')}
            className={`pb-2.5 px-3 font-medium text-xs sm:text-sm border-b-2 transition-colors ${
              activeTab === 'p1'
                ? 'border-[#E8A7B8] text-[#873656]'
                : 'border-transparent text-[#777777] hover:text-[#333333]'
            }`}
          >
            Player 1 ({p1.name || 'P1'})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('p2')}
            className={`pb-2.5 px-3 font-medium text-xs sm:text-sm border-b-2 transition-colors ${
              activeTab === 'p2'
                ? 'border-[#E8A7B8] text-[#873656]'
                : 'border-transparent text-[#777777] hover:text-[#333333]'
            }`}
          >
            Player 2 ({p2.name || 'P2'})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`pb-2.5 px-3 font-medium text-xs sm:text-sm border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-[#E8A7B8] text-[#873656]'
                : 'border-transparent text-[#777777] hover:text-[#333333]'
            }`}
          >
            Quiz Details
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'p1' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#777777] uppercase tracking-wider mb-1.5">
                  Player 1 Name / Nickname
                </label>
                <input
                  type="text"
                  value={p1.name}
                  onChange={(e) => setP1({ ...p1, name: e.target.value })}
                  placeholder="e.g., Emma"
                  maxLength={30}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#F0D5DF] focus:border-[#E8A7B8] focus:ring-2 focus:ring-[#E8A7B8]/20 outline-hidden transition-all text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#777777] uppercase tracking-wider mb-2">
                  Player 1 Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full border-2 border-[#E8A7B8] p-0.5 overflow-hidden shrink-0 shadow-xs bg-[#F8E8EE]">
                    <img
                      src={p1.photoUrl}
                      alt={p1.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileInputP1}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'p1')}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputP1.current?.click()}
                      className="w-full py-2 px-3 rounded-xl border border-[#F0D5DF] bg-[#F8E8EE]/50 hover:bg-[#F8E8EE] text-[#873656] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Upload from Device
                    </button>
                    <p className="text-[11px] text-[#777777]">
                      Upload your real photo. Faces will not be cropped or distorted.
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[11px] font-medium text-[#777777] block mb-1.5">
                    Or select a starter avatar:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setP1({ ...p1, photoUrl: url })}
                        className={`w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 transition-all ${
                          p1.photoUrl === url
                            ? 'border-[#873656] scale-105'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'p2' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#777777] uppercase tracking-wider mb-1.5">
                  Player 2 Name / Nickname
                </label>
                <input
                  type="text"
                  value={p2.name}
                  onChange={(e) => setP2({ ...p2, name: e.target.value })}
                  placeholder="e.g., Chloe"
                  maxLength={30}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#F0D5DF] focus:border-[#E8A7B8] focus:ring-2 focus:ring-[#E8A7B8]/20 outline-hidden transition-all text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#777777] uppercase tracking-wider mb-2">
                  Player 2 Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full border-2 border-[#E8A7B8] p-0.5 overflow-hidden shrink-0 shadow-xs bg-[#F8E8EE]">
                    <img
                      src={p2.photoUrl}
                      alt={p2.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileInputP2}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'p2')}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputP2.current?.click()}
                      className="w-full py-2 px-3 rounded-xl border border-[#F0D5DF] bg-[#F8E8EE]/50 hover:bg-[#F8E8EE] text-[#873656] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Upload from Device
                    </button>
                    <p className="text-[11px] text-[#777777]">
                      Upload your real photo. Faces will not be cropped or distorted.
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[11px] font-medium text-[#777777] block mb-1.5">
                    Or select a starter avatar:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setP2({ ...p2, photoUrl: url })}
                        className={`w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 transition-all ${
                          p2.photoUrl === url
                            ? 'border-[#873656] scale-105'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#777777] uppercase tracking-wider mb-1.5">
                  Quiz Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Bestie Secret Quiz"
                  maxLength={60}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#F0D5DF] focus:border-[#E8A7B8] focus:ring-2 focus:ring-[#E8A7B8]/20 outline-hidden transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#777777] uppercase tracking-wider mb-1.5">
                  Welcome Message (Optional)
                </label>
                <textarea
                  value={welcome}
                  onChange={(e) => setWelcome(e.target.value)}
                  placeholder="How well do you two really know each other?"
                  rows={3}
                  maxLength={200}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#F0D5DF] focus:border-[#E8A7B8] focus:ring-2 focus:ring-[#E8A7B8]/20 outline-hidden transition-all text-sm font-normal resize-none"
                />
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-[#F0D5DF] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#F0D5DF] text-[#777777] hover:text-[#333333] font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#E8A7B8] hover:bg-[#DF93A7] text-white font-semibold text-sm shadow-xs transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
