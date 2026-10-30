/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { CreateRoomFlow } from './components/CreateRoomFlow';
import { JoinRoomFlow } from './components/JoinRoomFlow';
import { RoomLobby } from './components/RoomLobby';
import { SetupModal } from './components/SetupModal';
import { QuestionScreen } from './components/QuestionScreen';
import { HandoffScreen } from './components/HandoffScreen';
import { WaitingScreen } from './components/WaitingScreen';
import { RevealScreen } from './components/RevealScreen';
import { AdminDashboard } from './components/AdminDashboard';
import {
  PlayerConfig,
  QuizSession,
  AnswersMap,
  RevealData,
  Question,
} from './types/quiz';
import {
  DEFAULT_PLAYER_1,
  DEFAULT_PLAYER_2,
  DEFAULT_QUESTIONS,
} from './data/defaultQuestions';
import {
  createQuizSession,
  getQuizSession,
  subscribeToSession,
  submitAnswers,
  getRevealData,
  subscribeToReveal,
  getActiveQuestions,
} from './firebase/quizService';
import { testConnection } from './firebase/config';
import { fetchAiGeneratedQuestions } from './services/aiQuestions';

export default function App() {
  // Global questions and configuration state
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [player1, setPlayer1] = useState<PlayerConfig>(() => {
    const saved = localStorage.getItem('bestie_p1');
    return saved ? JSON.parse(saved) : DEFAULT_PLAYER_1;
  });
  const [player2, setPlayer2] = useState<PlayerConfig>(() => {
    const saved = localStorage.getItem('bestie_p2');
    return saved ? JSON.parse(saved) : DEFAULT_PLAYER_2;
  });
  const [quizTitle, setQuizTitle] = useState('Bestie Secret Quiz');
  const [welcomeMessage, setWelcomeMessage] = useState(
    'How well do you two really know each other? Answer 15 secret friendship questions and reveal your wavelength!'
  );

  // App screen flow
  type ScreenType =
    | 'welcome'
    | 'create_room'
    | 'join_room'
    | 'lobby'
    | 'questions'
    | 'handoff'
    | 'waiting'
    | 'reveal';

  const [screen, setScreen] = useState<ScreenType>('welcome');
  const [prefillJoinCode, setPrefillJoinCode] = useState<string>('');

  // Active Session state
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(null);
  const [playerRole, setPlayerRole] = useState<'player1' | 'player2'>('player1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revealData, setRevealData] = useState<RevealData | null>(null);

  // Local answer tracking
  const [p1Answers, setP1Answers] = useState<AnswersMap>(() => {
    const saved = localStorage.getItem('bestie_answers_p1');
    return saved ? JSON.parse(saved) : {};
  });
  const [p2Answers, setP2Answers] = useState<AnswersMap>(() => {
    const saved = localStorage.getItem('bestie_answers_p2');
    return saved ? JSON.parse(saved) : {};
  });

  // Modals & Notices
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Initialize questions and test connection
  useEffect(() => {
    testConnection();
    getActiveQuestions().then((qs) => {
      if (qs && qs.length > 0) setQuestions(qs);
    });
  }, []);

  // Save customized players to localStorage
  useEffect(() => {
    localStorage.setItem('bestie_p1', JSON.stringify(player1));
  }, [player1]);
  useEffect(() => {
    localStorage.setItem('bestie_p2', JSON.stringify(player2));
  }, [player2]);

  // Handle URL query parameters (?room=CODE or ?session=CODE)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room') || params.get('session');
    const playerParam = params.get('player');

    if (roomParam) {
      const cleanId = roomParam.toUpperCase().trim();
      setPrefillJoinCode(cleanId);

      getQuizSession(cleanId).then((sess) => {
        if (sess) {
          setCurrentSession(sess);
          setPlayer1(sess.player1);
          setQuizTitle(sess.quizTitle);
          if (sess.questions && sess.questions.length > 0) {
            setQuestions(sess.questions);
          }

          // If session is already completed by both, show reveal
          if (sess.bothSubmitted) {
            getRevealData(cleanId).then((rev) => {
              if (rev) {
                setRevealData(rev);
                setScreen('reveal');
              }
            });
            return;
          }

          // If coming in as invited Player 2
          if (!sess.player2Joined || playerParam === '2' || playerParam === 'player2') {
            setScreen('join_room');
          } else {
            // Already joined room
            setPlayer2(sess.player2);
            setScreen('lobby');
          }
        } else {
          // Open join dialog with the code pre-filled
          setScreen('join_room');
        }
      });
    }
  }, []);

  // Subscribe to live Firestore session updates when in a room or waiting
  useEffect(() => {
    if (!currentSession?.sessionId) return;

    const unsubSession = subscribeToSession(currentSession.sessionId, (updated) => {
      if (updated) {
        setCurrentSession(updated);
        // Sync player data and questions
        if (updated.player1) setPlayer1(updated.player1);
        if (updated.player2 && updated.player2Joined) setPlayer2(updated.player2);
        if (updated.questions && updated.questions.length > 0) {
          setQuestions(updated.questions);
        }

        // If both submitted while in waiting screen, pull reveal
        if (updated.bothSubmitted && (screen === 'waiting' || screen === 'lobby')) {
          getRevealData(updated.sessionId).then((rev) => {
            if (rev) {
              setRevealData(rev);
            }
          });
        }
      }
    });

    const unsubReveal = subscribeToReveal(currentSession.sessionId, (rev) => {
      if (rev) {
        setRevealData(rev);
      }
    });

    return () => {
      unsubSession();
      unsubReveal();
    };
  }, [currentSession?.sessionId, screen]);

  // Player 1 creates a new quiz room
  const handleCreateRoom = async (
    p1Config: PlayerConfig,
    customTitle: string,
    customQuestions?: Question[],
    theme?: string
  ) => {
    setIsSubmitting(true);
    try {
      setPlayer1(p1Config);
      setQuizTitle(customTitle);
      const qsToUse = customQuestions && customQuestions.length > 0 ? customQuestions : questions;
      setQuestions(qsToUse);

      const sess = await createQuizSession({
        player1: p1Config,
        player2: { name: 'Waiting for Bestie...', photoUrl: DEFAULT_PLAYER_2.photoUrl },
        quizTitle: customTitle,
        welcomeMessage,
        mode: 'two_device',
        questions: qsToUse,
        quizTheme: theme || 'random',
      });

      setCurrentSession(sess);
      setPlayerRole('player1');
      setP1Answers({});
      setP2Answers({});
      localStorage.removeItem('bestie_answers_p1');
      localStorage.removeItem('bestie_answers_p2');

      // Update URL with room code
      window.history.replaceState({}, '', `?room=${sess.sessionId}`);

      // Go to Lobby
      setScreen('lobby');
    } catch (err: any) {
      console.error('Failed to create room:', err);
      setStatusNotice('Error creating quiz room. Please try again.');
      setTimeout(() => setStatusNotice(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Player 2 joins an existing quiz room
  const handlePlayer2Joined = (sess: QuizSession, p2Config: PlayerConfig) => {
    setCurrentSession(sess);
    setPlayer1(sess.player1);
    setPlayer2(p2Config);
    setPlayerRole('player2');
    if (sess.questions && sess.questions.length > 0) {
      setQuestions(sess.questions);
    }
    setP2Answers({});
    localStorage.removeItem('bestie_answers_p2');

    window.history.replaceState({}, '', `?room=${sess.sessionId}`);
    setScreen('lobby');
  };

  // Start Single Phone Quiz
  const handleStartSinglePhone = async () => {
    setIsSubmitting(true);
    try {
      let freshQuestions = questions;
      try {
        const aiRes = await fetchAiGeneratedQuestions({
          p1Name: player1.name,
          p2Name: player2.name,
          theme: 'random',
          count: 15,
        });
        if (aiRes.questions && aiRes.questions.length > 0) {
          freshQuestions = aiRes.questions;
          setQuestions(freshQuestions);
        }
      } catch (err) {
        console.warn('AI generate questions fallback:', err);
      }

      const sess = await createQuizSession({
        player1,
        player2,
        quizTitle,
        welcomeMessage,
        mode: 'single_phone',
        questions: freshQuestions,
      });
      setCurrentSession(sess);
      setPlayerRole('player1');
      setP1Answers({});
      setP2Answers({});
      localStorage.removeItem('bestie_answers_p1');
      localStorage.removeItem('bestie_answers_p2');
      setScreen('questions');
    } catch (err: any) {
      console.error('Failed to start session:', err);
      setStatusNotice('Error connecting to database. Please check connection.');
      setTimeout(() => setStatusNotice(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Answers submit handler
  const handleSubmitAnswers = async (answers: AnswersMap) => {
    if (!currentSession) return;
    setIsSubmitting(true);

    try {
      if (playerRole === 'player1') {
        setP1Answers(answers);
        localStorage.setItem('bestie_answers_p1', JSON.stringify(answers));
      } else {
        setP2Answers(answers);
        localStorage.setItem('bestie_answers_p2', JSON.stringify(answers));
      }

      const res = await submitAnswers(
        currentSession.sessionId,
        playerRole,
        answers,
        questions
      );

      if (currentSession.mode === 'single_phone') {
        if (playerRole === 'player1') {
          // Pass phone to Player 2
          setScreen('handoff');
        } else {
          // Player 2 submitted! Unlocks reveal
          const rev = await getRevealData(currentSession.sessionId);
          if (rev) {
            setRevealData(rev);
            setScreen('reveal');
          } else {
            setScreen('waiting');
          }
        }
      } else {
        // Two-Device Mode
        if (res.bothSubmitted) {
          const rev = await getRevealData(currentSession.sessionId);
          if (rev) setRevealData(rev);
        }
        setScreen('waiting');
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setStatusNotice('Error saving answers. Please try again.');
      setTimeout(() => setStatusNotice(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Transition from Handoff to Player 2 in single phone mode
  const handleContinueToPlayer2 = () => {
    setPlayerRole('player2');
    setScreen('questions');
  };

  // Trigger grand reveal
  const handleTriggerReveal = async () => {
    if (!currentSession) return;
    setIsSubmitting(true);
    try {
      const rev = await getRevealData(currentSession.sessionId);
      if (rev) {
        setRevealData(rev);
        setScreen('reveal');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Play Again: clean reset
  const handlePlayAgain = () => {
    setP1Answers({});
    setP2Answers({});
    localStorage.removeItem('bestie_answers_p1');
    localStorage.removeItem('bestie_answers_p2');
    setRevealData(null);
    setCurrentSession(null);
    setPlayerRole('player1');
    setScreen('welcome');
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  // Back to home
  const handleGoHome = () => {
    setScreen('welcome');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8E8EE] text-[#333333] selection:bg-[#E8A7B8] selection:text-white">
      {/* Sticky Top Navbar */}
      <Navbar
        onGoHome={handleGoHome}
        onOpenAdmin={() => setIsAdminOpen(true)}
        sessionCode={currentSession?.sessionId}
        isAdminOpen={isAdminOpen}
      />

      {/* Global Status Toast */}
      {statusNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#873656] text-white text-xs font-semibold shadow-lg transition-all animate-bounce">
          {statusNotice}
        </div>
      )}

      {/* Main Screen Router */}
      <main className="flex-1 flex flex-col justify-center">
        {screen === 'welcome' && (
          <WelcomeScreen
            player1={player1}
            player2={player2}
            quizTitle={quizTitle}
            welcomeMessage={welcomeMessage}
            onOpenCreateRoom={() => setScreen('create_room')}
            onOpenJoinRoom={(code) => {
              if (code) setPrefillJoinCode(code);
              setScreen('join_room');
            }}
            onStartSinglePhone={handleStartSinglePhone}
          />
        )}

        {screen === 'create_room' && (
          <CreateRoomFlow
            onBack={() => setScreen('welcome')}
            onCreateRoom={handleCreateRoom}
            isCreating={isSubmitting}
          />
        )}

        {screen === 'join_room' && (
          <JoinRoomFlow
            initialCode={prefillJoinCode}
            onBack={() => setScreen('welcome')}
            onJoined={handlePlayer2Joined}
          />
        )}

        {screen === 'lobby' && currentSession && (
          <RoomLobby
            session={currentSession}
            currentPlayerRole={playerRole}
            onStartQuiz={() => setScreen('questions')}
          />
        )}

        {screen === 'questions' && (
          <QuestionScreen
            questions={questions}
            currentPlayer={playerRole === 'player1' ? player1 : player2}
            playerRole={playerRole}
            otherPlayer={playerRole === 'player1' ? player2 : player1}
            initialAnswers={playerRole === 'player1' ? p1Answers : p2Answers}
            onAnswersChange={(ans) => {
              if (playerRole === 'player1') {
                setP1Answers(ans);
                localStorage.setItem('bestie_answers_p1', JSON.stringify(ans));
              } else {
                setP2Answers(ans);
                localStorage.setItem('bestie_answers_p2', JSON.stringify(ans));
              }
            }}
            onSubmit={handleSubmitAnswers}
            isSubmitting={isSubmitting}
          />
        )}

        {screen === 'handoff' && (
          <HandoffScreen
            player1={player1}
            player2={player2}
            onContinueToPlayer2={handleContinueToPlayer2}
          />
        )}

        {screen === 'waiting' && currentSession && (
          <WaitingScreen
            sessionId={currentSession.sessionId}
            currentPlayer={playerRole === 'player1' ? player1 : player2}
            waitingForPlayer={playerRole === 'player1' ? player2 : player1}
            playerRole={playerRole}
            bothSubmitted={currentSession.bothSubmitted}
            onReveal={handleTriggerReveal}
          />
        )}

        {screen === 'reveal' && revealData && (
          <RevealScreen
            player1={player1}
            player2={player2}
            revealData={revealData}
            questions={questions}
            onPlayAgain={handlePlayAgain}
            onGoHome={handleGoHome}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#F0D5DF] text-center text-xs text-[#777777] bg-white/40">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Bestie Secret Quiz • Private friendship comparison</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSetupOpen(true)}
              className="text-[#873656] hover:underline cursor-pointer"
            >
              Player Setup
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-[#873656] hover:underline cursor-pointer"
            >
              Admin Access
            </button>
          </div>
        </div>
      </footer>

      {/* Setup / Photo Customization Modal */}
      <SetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        player1={player1}
        player2={player2}
        quizTitle={quizTitle}
        welcomeMessage={welcomeMessage}
        onSave={(cfg) => {
          setPlayer1(cfg.player1);
          setPlayer2(cfg.player2);
          setQuizTitle(cfg.quizTitle);
          setWelcomeMessage(cfg.welcomeMessage);
        }}
      />

      {/* Creator Admin Dashboard Modal */}
      {isAdminOpen && (
        <AdminDashboard
          onClose={() => setIsAdminOpen(false)}
          questions={questions}
          onUpdateQuestions={(newQs) => setQuestions(newQs)}
          onPreviewQuiz={() => {
            setIsAdminOpen(false);
            setScreen('questions');
          }}
        />
      )}
    </div>
  );
}
