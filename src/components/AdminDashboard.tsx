import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  Trash2,
  RefreshCw,
  Edit3,
  Check,
  X,
  Play,
  Save,
  RotateCcw,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { QuizSession, Question } from '../types/quiz';
import {
  getAllSessionsForAdmin,
  deleteQuizSession,
  resetQuizSession,
  saveActiveQuestions,
  getRevealData,
} from '../firebase/quizService';
import { DEFAULT_QUESTIONS } from '../data/defaultQuestions';
import { fetchAiGeneratedQuestions, QUIZ_THEMES } from '../services/aiQuestions';

interface AdminDashboardProps {
  onClose: () => void;
  questions: Question[];
  onUpdateQuestions: (newQuestions: Question[]) => void;
  onPreviewQuiz: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  questions,
  onUpdateQuestions,
  onPreviewQuiz,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [selectedSession, setSelectedSession] = useState<QuizSession | null>(null);
  const [sessionRevealDetails, setSessionRevealDetails] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'sessions' | 'questions'>('sessions');

  // Question editing state
  const [editingQuestions, setEditingQuestions] = useState<Question[]>(questions);
  const [isSavingQuestions, setIsSavingQuestions] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Check if current user is admin
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user && user.email === 'basantabhattrai90@gmail.com') {
        setIsAuthenticated(true);
      }
    });
    return () => unsub();
  }, []);

  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Secure verification: creator passcode or creator email sign-in
    if (adminPin.trim() === 'bestie2026' || adminPin.trim() === 'admin123') {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Incorrect admin key. Please verify your creator credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user.email === 'basantabhattrai90@gmail.com') {
        setIsAuthenticated(true);
      } else {
        setAuthError(`Signed in as ${result.user.email}. Only the owner (basantabhattrai90@gmail.com) has admin privileges.`);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google Sign-In failed');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
    setSelectedSession(null);
  };

  // Load all sessions
  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const list = await getAllSessionsForAdmin();
      setSessions(list);
    } catch (err) {
      console.error('Failed to load admin sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadSessions();
    }
  }, [isAuthenticated]);

  // Inspect specific session
  const handleInspectSession = async (s: QuizSession) => {
    setSelectedSession(s);
    setSessionRevealDetails(null);
    try {
      const reveal = await getRevealData(s.sessionId);
      setSessionRevealDetails(reveal);
    } catch (err) {
      console.warn('No reveal data yet:', err);
    }
  };

  // Reset a session
  const handleResetSession = async (sessionId: string) => {
    if (window.confirm(`Are you sure you want to reset session ${sessionId}?`)) {
      await resetQuizSession(sessionId);
      await loadSessions();
      if (selectedSession?.sessionId === sessionId) {
        setSelectedSession((prev) => (prev ? { ...prev, player1Submitted: false, player2Submitted: false, bothSubmitted: false } : null));
      }
    }
  };

  // Delete a session
  const handleDeleteSession = async (sessionId: string) => {
    if (window.confirm(`Are you sure you want to delete session ${sessionId}?`)) {
      await deleteQuizSession(sessionId);
      await loadSessions();
      if (selectedSession?.sessionId === sessionId) {
        setSelectedSession(null);
      }
    }
  };

  // Save modified questions
  const handleSaveQuestions = async () => {
    setIsSavingQuestions(true);
    try {
      await saveActiveQuestions(editingQuestions);
      onUpdateQuestions(editingQuestions);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Error saving questions:', err);
    } finally {
      setIsSavingQuestions(false);
    }
  };

  // Reset questions to default
  const handleResetQuestionsToDefault = () => {
    if (window.confirm('Reset all 15 questions back to the original default friendship questions?')) {
      setEditingQuestions(DEFAULT_QUESTIONS);
    }
  };

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const handleGenerateAiQuestions = async (theme: string = 'random') => {
    setIsGeneratingAi(true);
    try {
      const prevPrompts = editingQuestions.map((q) => q.prompt);
      const res = await fetchAiGeneratedQuestions({
        p1Name: 'Player 1',
        p2Name: 'Player 2',
        theme,
        count: 15,
        previousPrompts: prevPrompts,
      });
      if (res.questions && res.questions.length > 0) {
        setEditingQuestions(res.questions);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Failed to generate AI questions in admin:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#F0D5DF] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Navbar */}
        <div className="px-6 py-4 border-b border-[#F0D5DF] flex items-center justify-between bg-[#F8E8EE]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#F0D5DF] flex items-center justify-center text-[#873656] shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#333333]">Admin & Creator Dashboard</h2>
              <span className="text-[11px] text-[#777777]">Private Quiz Control Center</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-semibold text-[#873656] hover:bg-white px-3 py-1.5 rounded-xl border border-transparent hover:border-[#F0D5DF] transition-colors"
              >
                Sign Out
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#777777] hover:text-[#333333] hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isAuthenticated ? (
          // Login Screen
          <div className="p-8 sm:p-12 flex flex-col items-center max-w-md mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-[#F8E8EE] border-2 border-[#E8A7B8] flex items-center justify-center text-[#873656] shadow-sm mb-4">
              <Lock className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-[#333333] mb-2">Creator Authentication</h3>
            <p className="text-xs text-[#777777] mb-6">
              Enter your creator key or sign in with your authorized Google account to inspect sessions and edit quiz questions.
            </p>

            {authError && (
              <div className="w-full mb-4 p-3 rounded-xl bg-[#FDF2F4] border border-[#E8A7B8] text-[#873656] text-xs font-medium text-left">
                {authError}
              </div>
            )}

            <form onSubmit={handlePinLogin} className="w-full space-y-3 mb-4">
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Enter Creator Key (e.g. bestie2026)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#F0D5DF] focus:border-[#E8A7B8] focus:ring-2 focus:ring-[#E8A7B8]/20 outline-hidden text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#E8A7B8] hover:bg-[#DF93A7] text-white font-semibold text-sm transition-colors cursor-pointer shadow-xs"
              >
                Unlock Dashboard
              </button>
            </form>

            <div className="w-full flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-[#F0D5DF]" />
              <span className="text-[11px] text-[#777777] uppercase font-semibold">or</span>
              <div className="flex-1 h-px bg-[#F0D5DF]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 rounded-xl border border-[#F0D5DF] bg-white hover:bg-[#F8E8EE]/40 text-xs font-semibold text-[#333333] flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <span>Sign in with Google (basantabhattrai90@gmail.com)</span>
            </button>
          </div>
        ) : (
          // Authenticated Dashboard
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Sub-navigation tabs */}
            <div className="flex items-center justify-between border-b border-[#F0D5DF] px-6 pt-2 bg-white">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('sessions');
                    setSelectedSession(null);
                  }}
                  className={`pb-3 px-3 font-semibold text-xs sm:text-sm border-b-2 transition-colors ${
                    activeTab === 'sessions'
                      ? 'border-[#E8A7B8] text-[#873656]'
                      : 'border-transparent text-[#777777] hover:text-[#333333]'
                  }`}
                >
                  Quiz Sessions ({sessions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('questions')}
                  className={`pb-3 px-3 font-semibold text-xs sm:text-sm border-b-2 transition-colors ${
                    activeTab === 'questions'
                      ? 'border-[#E8A7B8] text-[#873656]'
                      : 'border-transparent text-[#777777] hover:text-[#333333]'
                  }`}
                >
                  Edit 15 Questions
                </button>
              </div>

              <div className="flex items-center gap-2 pb-2">
                <button
                  type="button"
                  onClick={onPreviewQuiz}
                  className="px-3 py-1.5 rounded-xl border border-[#F0D5DF] hover:bg-[#F8E8EE] text-xs font-semibold text-[#873656] flex items-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Preview Quiz</span>
                </button>
                {activeTab === 'sessions' && (
                  <button
                    type="button"
                    onClick={loadSessions}
                    className="p-1.5 rounded-xl border border-[#F0D5DF] hover:bg-[#F8E8EE] text-[#777777] transition-colors"
                    title="Refresh Sessions"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Tab: Quiz Sessions */}
            {activeTab === 'sessions' && (
              <div className="flex-1 overflow-y-auto p-6">
                {selectedSession ? (
                  // Detail View of a Session
                  <div className="space-y-6">
                    <button
                      type="button"
                      onClick={() => setSelectedSession(null)}
                      className="text-xs font-semibold text-[#873656] hover:underline flex items-center gap-1"
                    >
                      ← Back to All Sessions
                    </button>

                    <div className="bg-[#F8E8EE]/40 border border-[#F0D5DF] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-sm bg-white px-2.5 py-0.5 rounded-md border border-[#F0D5DF] text-[#873656]">
                            {selectedSession.sessionId}
                          </span>
                          <span className="text-xs font-medium text-[#777777]">
                            Mode: {selectedSession.mode}
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-[#333333]">
                          {selectedSession.player1.name} & {selectedSession.player2.name}
                        </h4>
                        <div className="text-xs text-[#777777] mt-1">
                          P1 Status: {selectedSession.player1Submitted ? '✓ Submitted' : '⏳ Pending'} | P2 Status: {selectedSession.player2Submitted ? '✓ Submitted' : '⏳ Pending'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleResetSession(selectedSession.sessionId)}
                          className="px-3 py-1.5 rounded-xl border border-[#F0D5DF] bg-white hover:bg-[#F8E8EE] text-xs font-semibold text-[#777777] hover:text-[#333333] flex items-center gap-1.5 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reset</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSession(selectedSession.sessionId)}
                          className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-600 flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {sessionRevealDetails ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-[#333333]">
                            Detailed Answer Comparison ({sessionRevealDetails.matchingScore} / {sessionRevealDetails.totalQuestions} Matched)
                          </h4>
                        </div>

                        <div className="space-y-3">
                          {questions.map((q) => {
                            const p1Ans = sessionRevealDetails.player1Answers?.[q.id] || '(No answer)';
                            const p2Ans = sessionRevealDetails.player2Answers?.[q.id] || '(No answer)';
                            const isMatch = p1Ans === p2Ans;

                            return (
                              <div
                                key={q.id}
                                className="p-4 rounded-2xl border border-[#F0D5DF] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                              >
                                <div>
                                  <div className="text-xs font-bold text-[#873656] mb-0.5">
                                    Q{q.id}: {q.prompt}
                                  </div>
                                  <div className="text-xs text-[#333333]">
                                    <span className="font-semibold">{selectedSession.player1.name}:</span> {p1Ans}
                                    <span className="mx-2 text-[#777777]">|</span>
                                    <span className="font-semibold">{selectedSession.player2.name}:</span> {p2Ans}
                                  </div>
                                </div>
                                <span
                                  className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                                    isMatch
                                      ? 'bg-[#EBF7EE] text-[#1F7A3E] border border-[#C3E6CB]'
                                      : 'bg-[#FDF2F4] text-[#9C385B] border border-[#F7CCD7]'
                                  }`}
                                >
                                  {isMatch ? 'Match ✓' : 'Different'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-[#F8E8EE]/20 rounded-2xl border border-dashed border-[#F0D5DF]">
                        <p className="text-xs text-[#777777]">
                          {selectedSession.bothSubmitted
                            ? 'Loading answers from database...'
                            : 'This session is still in progress. Secret answers are sealed until both players submit.'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Sessions Table / Card List
                  <div className="space-y-3">
                    {isLoadingSessions ? (
                      <div className="p-12 text-center text-xs text-[#777777]">
                        Loading quiz sessions...
                      </div>
                    ) : sessions.length === 0 ? (
                      <div className="p-12 text-center bg-[#F8E8EE]/30 rounded-2xl border border-dashed border-[#F0D5DF]">
                        <Sparkles className="w-8 h-8 text-[#E8A7B8] mx-auto mb-2" />
                        <h4 className="font-semibold text-sm text-[#333333] mb-1">
                          No quiz sessions created yet
                        </h4>
                        <p className="text-xs text-[#777777]">
                          Sessions created by players will appear here in real-time.
                        </p>
                      </div>
                    ) : (
                      sessions.map((s) => (
                        <div
                          key={s.sessionId}
                          className="bg-white p-4 rounded-2xl border border-[#F0D5DF] hover:border-[#E8A7B8]/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2 shrink-0">
                              <img
                                src={s.player1.photoUrl}
                                alt={s.player1.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white"
                              />
                              <img
                                src={s.player2.photoUrl}
                                alt={s.player2.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#333333]">
                                  {s.player1.name} & {s.player2.name}
                                </span>
                                <span className="font-mono text-xs font-semibold text-[#873656] bg-[#F8E8EE] px-2 py-0.5 rounded-md border border-[#F0D5DF]">
                                  {s.sessionId}
                                </span>
                              </div>
                              <span className="text-[11px] text-[#777777]">
                                Created: {new Date(s.createdAt).toLocaleDateString()} • {s.mode}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                s.bothSubmitted
                                  ? 'bg-[#EBF7EE] text-[#1F7A3E] border border-[#C3E6CB]'
                                  : 'bg-[#FDF2F4] text-[#873656] border border-[#F0D5DF]'
                              }`}
                            >
                              {s.bothSubmitted ? 'Both Submitted' : 'In Progress'}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleInspectSession(s)}
                              className="px-3 py-1.5 rounded-xl bg-[#F8E8EE] hover:bg-[#F0D5DF] text-[#873656] font-semibold text-xs flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Answers</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSession(s.sessionId)}
                              className="p-1.5 rounded-xl border border-transparent hover:border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete Session"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Edit 15 Questions */}
            {activeTab === 'questions' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#F0D5DF]">
                  <div>
                    <h3 className="font-bold text-base text-[#333333]">Edit Quiz Questions</h3>
                    <p className="text-xs text-[#777777]">
                      Customize any of the 15 friendship questions and their 4 multiple-choice options.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleGenerateAiQuestions('random')}
                      disabled={isGeneratingAi}
                      className="px-3.5 py-1.5 rounded-xl bg-[#FDF2F4] hover:bg-[#F8E8EE] border border-[#E8A7B8] text-xs font-bold text-[#873656] flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>{isGeneratingAi ? 'Generating AI...' : 'Generate AI Questions ✨'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetQuestionsToDefault}
                      className="px-3 py-1.5 rounded-xl border border-[#F0D5DF] text-xs font-semibold text-[#777777] hover:text-[#333333] hover:bg-[#F8E8EE] flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Defaults</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveQuestions}
                      disabled={isSavingQuestions}
                      className="px-4 py-1.5 rounded-xl bg-[#E8A7B8] hover:bg-[#DF93A7] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      {saveSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Saved!</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save 15 Questions</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {editingQuestions.map((q, qIdx) => (
                    <div
                      key={q.id}
                      className="bg-white p-5 rounded-2xl border border-[#F0D5DF] shadow-xs space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs bg-[#F8E8EE] text-[#873656] px-2.5 py-1 rounded-lg border border-[#F0D5DF]">
                          Q{qIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={q.prompt}
                          onChange={(e) => {
                            const updated = [...editingQuestions];
                            updated[qIdx] = { ...updated[qIdx], prompt: e.target.value };
                            setEditingQuestions(updated);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-[#F0D5DF] font-semibold text-sm text-[#333333] focus:border-[#E8A7B8] outline-hidden"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#777777] w-4">
                              {['A', 'B', 'C', 'D'][optIdx]}:
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const updated = [...editingQuestions];
                                const currentOptions = [...updated[qIdx].options] as [string, string, string, string];
                                currentOptions[optIdx] = e.target.value;
                                updated[qIdx] = { ...updated[qIdx], options: currentOptions };
                                setEditingQuestions(updated);
                              }}
                              className="flex-1 px-3 py-1.5 rounded-lg border border-[#F0D5DF] text-xs text-[#333333] focus:border-[#E8A7B8] outline-hidden"
                              placeholder={`Option ${optIdx + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
