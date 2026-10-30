# Security Specification for Bestie Secret Quiz

## 1. Data Invariants
1. **Player Privacy Invariant**: Neither player can read the other player's private answers (`/player1Answers/` or `/player2Answers/`) before both players submit all 15 questions.
2. **Completion Integrity**: A session cannot be marked `bothSubmitted: true` unless both Player 1 and Player 2 have actually submitted their complete answers.
3. **Reveal Gate**: The reveal document `/reveals/` can only be generated or read once `bothSubmitted == true` or by an authorized Admin.
4. **Admin Protection**: Only authorized administrators (e.g. `basantabhattrai90@gmail.com` or users with entry in `/admins/{uid}`) can read all player answers, reset/delete sessions, or edit global questions.
5. **No State Short-cutting**: Player 2 cannot overwrite Player 1's submission, and neither player can forge the other's identity.

## 2. The "Dirty Dozen" Payloads
1. **Payload 1 (Identity Spoofing)**: An anonymous or Player 2 client attempts to read `/sessions/{sessionId}/player1Answers/submission` before reveal.
   - Result: PERMISSION_DENIED.
2. **Payload 2 (Early Reveal Reading)**: An unauthorized client attempts to read `/sessions/{sessionId}/reveals/result` when `bothSubmitted == false`.
   - Result: PERMISSION_DENIED.
3. **Payload 3 (Arbitrary Reveal Tampering)**: A client directly writes `bothSubmitted: true` without both players submitting.
   - Result: PERMISSION_DENIED.
4. **Payload 4 (Admin Escalation)**: A regular user writes an entry into `/admins/{request.auth.uid}` to grant themselves admin privileges.
   - Result: PERMISSION_DENIED.
5. **Payload 5 (Question Defacement)**: An unauthenticated or non-admin user attempts to overwrite `/quizzes/default-quiz` questions.
   - Result: PERMISSION_DENIED.
6. **Payload 6 (Shadow Field Injection)**: A user submits answers with extra unauthorized keys (e.g., `isAdmin: true`, `bypassReveal: true`).
   - Result: PERMISSION_DENIED.
7. **Payload 7 (Oversized Payload / Denial of Wallet)**: Submitting answers containing a 10MB string or junk array to exhaust Firestore resources.
   - Result: PERMISSION_DENIED.
8. **Payload 8 (Invalid Session ID Poisoning)**: Creating a session with an ID containing path traversal characters (`../../secret`).
   - Result: PERMISSION_DENIED.
9. **Payload 9 (Player Answer Overwrite / Race Condition)**: Player 1 attempts to write to `/sessions/{sessionId}/player2Answers/submission`.
   - Result: PERMISSION_DENIED.
10. **Payload 10 (Session Deletion by Stranger)**: A non-admin user tries to delete another user's session document `/sessions/{otherSessionId}`.
   - Result: PERMISSION_DENIED.
11. **Payload 11 (Terminal State Corruption)**: Attempting to reset a completed session's answers while pretending to be Player 1.
   - Result: PERMISSION_DENIED.
12. **Payload 12 (Blanket List Scraping)**: Running an unfiltered list query across `/sessions/{sessionId}/player1Answers` across all users.
   - Result: PERMISSION_DENIED.
