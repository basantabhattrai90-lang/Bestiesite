import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, ensureAuthUser } from './config';
import { QuizSession, AnswersMap, RevealData, Question } from '../types/quiz';
import { DEFAULT_QUESTIONS } from '../data/defaultQuestions';

// Generate short readable 6-character session code (alphanumeric uppercase)
export function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createQuizSession(params: {
  sessionId?: string;
  quizTitle?: string;
  welcomeMessage?: string;
  player1: { name: string; photoUrl: string };
  player2: { name: string; photoUrl: string };
  mode: 'single_phone' | 'two_device';
  questions?: Question[];
  quizTheme?: string;
}): Promise<QuizSession> {
  await ensureAuthUser();
  const sessionId = (params.sessionId || generateSessionCode()).toUpperCase().trim();
  const path = `sessions/${sessionId}`;

  const session: QuizSession = {
    sessionId,
    quizTitle: params.quizTitle?.trim() || 'Bestie Secret Quiz',
    welcomeMessage: params.welcomeMessage?.trim() || 'How well do you two really know each other?',
    player1: {
      name: params.player1.name.trim() || 'Player 1',
      photoUrl: params.player1.photoUrl,
    },
    player2: {
      name: params.player2.name.trim() || 'Player 2',
      photoUrl: params.player2.photoUrl,
    },
    player1Submitted: false,
    player2Submitted: false,
    bothSubmitted: false,
    questions: params.questions,
    quizTheme: params.quizTheme || 'random',
    mode: params.mode,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const payload: Record<string, any> = {
      sessionId: session.sessionId,
      quizTitle: session.quizTitle,
      welcomeMessage: session.welcomeMessage,
      player1Name: session.player1.name,
      player2Name: session.player2.name,
      player1Photo: session.player1.photoUrl,
      player2Photo: session.player2.photoUrl,
      player1Submitted: session.player1Submitted,
      player2Submitted: session.player2Submitted,
      bothSubmitted: session.bothSubmitted,
      mode: session.mode,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
    if (session.quizTheme) payload.quizTheme = session.quizTheme;
    if (session.questions && session.questions.length > 0) payload.questions = session.questions;

    await setDoc(doc(db, 'sessions', sessionId), payload);
    localStorage.setItem(`session_${sessionId}`, JSON.stringify(session));
    return session;
  } catch (error) {
    console.warn('Firestore session create warning, using local fallback:', error);
    localStorage.setItem(`session_${sessionId}`, JSON.stringify(session));
    return session;
  }
}

export function parseSessionDoc(data: any): QuizSession {
  return {
    sessionId: data.sessionId,
    quizTitle: data.quizTitle || 'Bestie Secret Quiz',
    welcomeMessage: data.welcomeMessage || '',
    player1: {
      name: data.player1Name || 'Player 1',
      photoUrl: data.player1Photo || '',
    },
    player2: {
      name: data.player2Name || 'Player 2',
      photoUrl: data.player2Photo || '',
    },
    player1Submitted: Boolean(data.player1Submitted),
    player2Submitted: Boolean(data.player2Submitted),
    bothSubmitted: Boolean(data.bothSubmitted),
    player2Joined: Boolean(data.player2Joined),
    quizTheme: data.quizTheme || 'random',
    questions: Array.isArray(data.questions) && data.questions.length > 0 ? data.questions : undefined,
    mode: data.mode || 'single_phone',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

export async function joinQuizRoom(
  sessionId: string,
  player2: { name: string; photoUrl: string }
): Promise<QuizSession> {
  const cleanId = sessionId.toUpperCase().trim();
  const updateData = {
    player2Name: player2.name.trim() || 'Player 2',
    player2Photo: player2.photoUrl,
    player2Joined: true,
    updatedAt: new Date().toISOString(),
  };

  try {
    await updateDoc(doc(db, 'sessions', cleanId), updateData);
    const snap = await getDoc(doc(db, 'sessions', cleanId));
    if (snap.exists()) {
      const sess = parseSessionDoc(snap.data());
      localStorage.setItem(`session_${cleanId}`, JSON.stringify(sess));
      return sess;
    }
  } catch (error) {
    console.warn('Firestore join error, updating local storage:', error);
  }

  const local = localStorage.getItem(`session_${cleanId}`);
  let sess: QuizSession;
  if (local) {
    sess = JSON.parse(local);
    sess.player2 = { name: player2.name.trim() || 'Player 2', photoUrl: player2.photoUrl };
    sess.player2Joined = true;
    sess.updatedAt = new Date().toISOString();
  } else {
    sess = {
      sessionId: cleanId,
      quizTitle: 'Bestie Secret Quiz',
      player1: { name: 'Player 1', photoUrl: '' },
      player2: { name: player2.name.trim() || 'Player 2', photoUrl: player2.photoUrl },
      player1Submitted: false,
      player2Submitted: false,
      bothSubmitted: false,
      player2Joined: true,
      mode: 'two_device',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  localStorage.setItem(`session_${cleanId}`, JSON.stringify(sess));
  return sess;
}

export async function getQuizSession(sessionId: string): Promise<QuizSession | null> {
  const cleanId = sessionId.toUpperCase().trim();
  const path = `sessions/${cleanId}`;
  try {
    const snap = await getDoc(doc(db, 'sessions', cleanId));
    if (snap.exists()) {
      const sess = parseSessionDoc(snap.data());
      localStorage.setItem(`session_${cleanId}`, JSON.stringify(sess));
      return sess;
    }
  } catch (error) {
    console.warn('Firestore getSession warning, checking local storage:', error);
  }
  const local = localStorage.getItem(`session_${cleanId}`);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return null;
    }
  }
  return null;
}

export function subscribeToSession(
  sessionId: string,
  onUpdate: (session: QuizSession | null) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const cleanId = sessionId.toUpperCase().trim();
  const path = `sessions/${cleanId}`;
  return onSnapshot(
    doc(db, 'sessions', cleanId),
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
      } else {
        onUpdate(parseSessionDoc(snap.data()));
      }
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export async function submitAnswers(
  sessionId: string,
  playerId: 'player1' | 'player2',
  answers: AnswersMap,
  questions: Question[]
): Promise<{ bothSubmitted: boolean }> {
  await ensureAuthUser();
  const cleanId = sessionId.toUpperCase().trim();
  const subcollection = playerId === 'player1' ? 'player1Answers' : 'player2Answers';
  const answerDocPath = `sessions/${cleanId}/${subcollection}/submission`;

  try {
    // 1. Save player's private answers to their subcollection
    await setDoc(doc(db, 'sessions', cleanId, subcollection, 'submission'), {
      playerId,
      answers,
      submittedAt: new Date().toISOString(),
    });

    // 2. Read existing session to check if the other player submitted
    const sessionSnap = await getDoc(doc(db, 'sessions', cleanId));
    if (!sessionSnap.exists()) {
      throw new Error('Session does not exist');
    }
    const sessionData = sessionSnap.data();
    const otherSubmitted =
      playerId === 'player1'
        ? Boolean(sessionData.player2Submitted)
        : Boolean(sessionData.player1Submitted);

    const isBothNow = otherSubmitted;

    // 3. Update session completion flags
    const updatePayload: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    if (playerId === 'player1') {
      updatePayload.player1Submitted = true;
    } else {
      updatePayload.player2Submitted = true;
    }
    if (isBothNow) {
      updatePayload.bothSubmitted = true;
    }

    await updateDoc(doc(db, 'sessions', cleanId), updatePayload);

    // 4. If both have submitted, compile reveal document securely
    if (isBothNow) {
      const otherSubcollection = playerId === 'player1' ? 'player2Answers' : 'player1Answers';
      const otherSnap = await getDoc(doc(db, 'sessions', cleanId, otherSubcollection, 'submission'));

      const p1Answers: AnswersMap =
        playerId === 'player1' ? answers : ((otherSnap.data()?.answers || {}) as AnswersMap);
      const p2Answers: AnswersMap =
        playerId === 'player2' ? answers : ((otherSnap.data()?.answers || {}) as AnswersMap);

      let matches = 0;
      questions.forEach((q) => {
        if (p1Answers[q.id] && p2Answers[q.id] && p1Answers[q.id] === p2Answers[q.id]) {
          matches++;
        }
      });

      const total = questions.length || 15;
      const percentage = Math.round((matches / total) * 100);

      const revealData: RevealData = {
        sessionId: cleanId,
        matchingScore: matches,
        totalQuestions: total,
        matchingPercentage: percentage,
        player1Answers: p1Answers,
        player2Answers: p2Answers,
        revealedAt: new Date().toISOString(),
      };

      localStorage.setItem(`reveal_${cleanId}`, JSON.stringify(revealData));
      await setDoc(doc(db, 'sessions', cleanId, 'reveals', 'result'), revealData);
    }

    return { bothSubmitted: isBothNow };
  } catch (error) {
    console.warn('Firestore write warning:', error);
    // In single phone mode, keep local answer state so user is never blocked
    localStorage.setItem(`answers_${cleanId}_${playerId}`, JSON.stringify(answers));
    return { bothSubmitted: true };
  }
}

export async function getRevealData(sessionId: string): Promise<RevealData | null> {
  const cleanId = sessionId.toUpperCase().trim();
  const path = `sessions/${cleanId}/reveals/result`;
  try {
    const snap = await getDoc(doc(db, 'sessions', cleanId, 'reveals', 'result'));
    if (snap.exists()) {
      const rev = snap.data() as RevealData;
      localStorage.setItem(`reveal_${cleanId}`, JSON.stringify(rev));
      return rev;
    }
  } catch (error) {
    console.warn('Firestore getRevealData warning, checking local cache:', error);
  }
  const local = localStorage.getItem(`reveal_${cleanId}`);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return null;
    }
  }
  return null;
}

export function subscribeToReveal(
  sessionId: string,
  onUpdate: (data: RevealData | null) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const cleanId = sessionId.toUpperCase().trim();
  const path = `sessions/${cleanId}/reveals/result`;
  return onSnapshot(
    doc(db, 'sessions', cleanId, 'reveals', 'result'),
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
      } else {
        onUpdate(snap.data() as RevealData);
      }
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export async function resetQuizSession(sessionId: string): Promise<void> {
  const cleanId = sessionId.toUpperCase().trim();
  const path = `sessions/${cleanId}`;
  try {
    await updateDoc(doc(db, 'sessions', cleanId), {
      player1Submitted: false,
      player2Submitted: false,
      bothSubmitted: false,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteQuizSession(sessionId: string): Promise<void> {
  const cleanId = sessionId.toUpperCase().trim();
  const path = `sessions/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'sessions', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getAllSessionsForAdmin(): Promise<QuizSession[]> {
  const path = 'sessions';
  try {
    const snap = await getDocs(collection(db, 'sessions'));
    const list: QuizSession[] = [];
    snap.forEach((d) => {
      list.push(parseSessionDoc(d.data()));
    });
    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Global quiz questions configuration
export async function getActiveQuestions(): Promise<Question[]> {
  try {
    const snap = await getDoc(doc(db, 'quizzes', 'default-quiz'));
    if (snap.exists() && snap.data()?.questions?.length) {
      return snap.data().questions as Question[];
    }
  } catch (err) {
    console.warn('Using default questions fallback:', err);
  }
  return DEFAULT_QUESTIONS;
}

export async function saveActiveQuestions(questions: Question[]): Promise<void> {
  const path = 'quizzes/default-quiz';
  try {
    await setDoc(doc(db, 'quizzes', 'default-quiz'), {
      title: 'Bestie Secret Quiz',
      questions,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
