import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Curated question banks for offline or quick shuffle fallback
const THEMED_FALLBACK_POOLS: Record<string, Array<{ prompt: string; options: [string, string, string, string] }>> = {
  hilarious: [
    { prompt: 'Who is more likely to trip on flat ground?', options: ['{p1}', '{p2}', 'Both of us equally', 'Neither, very coordinated'] },
    { prompt: 'Who sends unhinged voice notes at 2 AM?', options: ['{p1}', '{p2}', 'Both send podcasts', 'Neither, normal texting only'] },
    { prompt: 'Who laughs so hard they make no sound?', options: ['{p1}', '{p2}', 'Both laugh like that', 'Neither of us'] },
    { prompt: 'Who is more likely to get scammed by an obvious internet meme?', options: ['{p1}', '{p2}', 'Both too gullible', 'Neither, super skeptical'] },
    { prompt: 'Who makes the most dramatic facial expressions during gossip?', options: ['{p1}', '{p2}', 'Both theatrical queens', 'Neither, stone-faced'] },
    { prompt: 'Who is more likely to accidentally like an ex’s photo from 4 years ago?', options: ['{p1}', '{p2}', 'Both guilty of aggressive stalking', 'Neither of us'] },
    { prompt: 'Who spends 20 minutes deciding what to eat, then orders chicken tenders?', options: ['{p1}', '{p2}', 'Both every single time', 'Neither, quick decisive eaters'] },
    { prompt: 'Who is more likely to get lost even with Google Maps open?', options: ['{p1}', '{p2}', 'Both have zero sense of direction', 'Neither, master navigators'] },
    { prompt: 'Who has the messier handbag or backpack?', options: ['{p1}', '{p2}', 'Both carry miniature black holes', 'Neither, minimalists'] },
    { prompt: 'Who is more likely to cry during a funny animal commercial?', options: ['{p1}', '{p2}', 'Both super emotional', 'Neither, dry eyes'] },
    { prompt: 'Who starts singing the wrong lyrics with complete confidence?', options: ['{p1}', '{p2}', 'Both sing custom lyrics', 'Neither, lyric masters'] },
    { prompt: 'Who has more screenshots of gossip they will never delete?', options: ['{p1}', '{p2}', 'Both storage full of drama', 'Neither of us'] },
    { prompt: 'Who will pretend to look at their phone to avoid someone in public?', options: ['{p1}', '{p2}', 'Both professional avoiders', 'Neither, friendly with everyone'] },
    { prompt: 'Who has the louder sneeze that startles the entire room?', options: ['{p1}', '{p2}', 'Both earthquake sneezers', 'Neither, quiet mice'] },
    { prompt: 'Who is more likely to buy something ridiculous because it was on sale?', options: ['{p1}', '{p2}', 'Both impulse shoppers', 'Neither, strict budgeters'] },
  ],
  wholesome: [
    { prompt: 'Who gives warmer, tighter hugs?', options: ['{p1}', '{p2}', 'Both great huggers', 'Neither, awkward high-fives only'] },
    { prompt: 'Who is more likely to remember someone’s birthday without a reminder?', options: ['{p1}', '{p2}', 'Both have human calendars', 'Neither, we need notifications'] },
    { prompt: 'Who is quicker to send a "get home safe" text?', options: ['{p1}', '{p2}', 'Both mama bear friends', 'Neither, we forget to check'] },
    { prompt: 'Who is more likely to bake or cook comfort food for the other?', options: ['{p1}', '{p2}', 'Both love cooking together', 'Neither, we order takeout'] },
    { prompt: 'Who is the better secret keeper when trusted with deep stuff?', options: ['{p1}', '{p2}', 'Both vaults of steel', 'Depends on the secret'] },
    { prompt: 'Who is more likely to hype up the other person’s outfit with 100 compliments?', options: ['{p1}', '{p2}', 'Both #1 hype women', 'Neither, subtle nods'] },
    { prompt: 'Who gets more genuinely excited over small happy news?', options: ['{p1}', '{p2}', 'Both jump for joy', 'Neither, chill reactions'] },
    { prompt: 'Who is more likely to save a cute photo of both of you as their wallpaper?', options: ['{p1}', '{p2}', 'Both have bestie wallpapers', 'Neither of us'] },
    { prompt: 'Who gives more thoughtful, personalized gifts?', options: ['{p1}', '{p2}', 'Both gift geniuses', 'Neither, gift cards only'] },
    { prompt: 'Who is more likely to notice when the other is having an off day?', options: ['{p1}', '{p2}', 'Both have telepathic radar', 'Neither, we have to speak up'] },
    { prompt: 'Who would drive across town at midnight if the other really needed help?', options: ['{p1}', '{p2}', 'Both without hesitation', 'Depends if we are asleep'] },
    { prompt: 'Who says "I love you bestie" first after a long phone call?', options: ['{p1}', '{p2}', 'Both at the exact same second', 'Neither, unspoken bond'] },
    { prompt: 'Who is more patient when teaching something new?', options: ['{p1}', '{p2}', 'Both saintly patient', 'Neither, we get frustrated fast'] },
    { prompt: 'Who makes the other feel safer being 100% authentically themselves?', options: ['{p1}', '{p2}', 'Both completely zero judgment', 'Equal safe space'] },
    { prompt: 'Who would defend the other person fiercely behind their back?', options: ['{p1}', '{p2}', 'Both loyal bodyguards', 'Equal loyalty'] },
  ],
  adventures: [
    { prompt: 'Who is more likely to book a flight with 3 days notice?', options: ['{p1}', '{p2}', 'Both spontaneous travelers', 'Neither, need months of planning'] },
    { prompt: 'Who takes 400 photos of the scenery while traveling?', options: ['{p1}', '{p2}', 'Both full memory cards', 'Neither, live in the moment'] },
    { prompt: 'Who packs their suitcase 2 hours before the taxi arrives?', options: ['{p1}', '{p2}', 'Both panic packers', 'Neither, packed days in advance'] },
    { prompt: 'Who is more willing to try weird exotic street food?', options: ['{p1}', '{p2}', 'Both iron stomachs', 'Neither, stick to safe fries'] },
    { prompt: 'Who gets more hangry when walking around exploring a new city?', options: ['{p1}', '{p2}', 'Both need snacks every 40 minutes', 'Neither, endless energy'] },
    { prompt: 'Who is more likely to befriend the locals or the tour guide?', options: ['{p1}', '{p2}', 'Both instant social butterflies', 'Neither, stick to ourselves'] },
    { prompt: 'Who stays up later talking about life on a road trip?', options: ['{p1}', '{p2}', 'Both night owls', 'Neither, asleep by 10 PM'] },
    { prompt: 'Who is the designated driver / navigator during adventures?', options: ['{p1}', '{p2}', 'Both share the wheel', 'Neither, public transit only'] },
    { prompt: 'Who overpacks 5 extra outfits "just in case" for a 2-day trip?', options: ['{p1}', '{p2}', 'Both 50-pound suitcases', 'Neither, single carry-on'] },
    { prompt: 'Who is more likely to suggest an outdoor hike or swimming in a lake?', options: ['{p1}', '{p2}', 'Both nature lovers', 'Neither, hotel pool & AC only'] },
    { prompt: 'Who wakes up earlier to catch the sunrise on vacation?', options: ['{p1}', '{p2}', 'Both up at dawn', 'Neither, sleep till noon'] },
    { prompt: 'Who is more likely to lose their sunglasses or room keycard?', options: ['{p1}', '{p2}', 'Both constantly misplacing items', 'Neither, super careful'] },
    { prompt: 'Who buys the most random tourist souvenirs at airport gift shops?', options: ['{p1}', '{p2}', 'Both souvenir addicts', 'Neither of us'] },
    { prompt: 'Who suggests the crazy rollercoaster at the theme park?', options: ['{p1}', '{p2}', 'Both adrenaline junkies', 'Neither, gentle carousel only'] },
    { prompt: 'Who is already planning the next vacation before the current one ends?', options: ['{p1}', '{p2}', 'Both nonstop dreamers', 'Neither, one trip at a time'] },
  ],
};

// API: Generate fresh, unique questions using Gemini
app.post('/api/generate-questions', async (req, res) => {
  try {
    const {
      p1Name = 'Player 1',
      p2Name = 'Player 2',
      theme = 'random',
      count = 15,
      previousPrompts = [],
    } = req.body;

    const requestedCount = Math.min(Math.max(Number(count) || 15, 5), 20);

    // If Gemini key is available, generate fresh creative questions
    if (process.env.GEMINI_API_KEY) {
      const prompt = `You are an expert friendship game writer. Generate exactly ${requestedCount} fresh, unique, hilarious, and heartwarming multiple-choice friendship questions for two best friends named "${p1Name}" and "${p2Name}".
Theme style: ${theme}.
Crucial rules:
1. Each question must be fun, lighthearted, and subjective to test how well two best friends know each other and compare their perspectives.
2. Avoid generic boring questions. Make them vivid, relatable, modern, and engaging (e.g. funny quirks, dramatic moments, texting habits, late-night food, loyalty, reactions).
3. Do NOT repeat any of these recently used questions: ${JSON.stringify(previousPrompts.slice(-30))}.
4. For each question, provide 4 options. The options can include "{p1}", "{p2}", and two witty shared/contrasting options like "Both of us equally" or funny contextual choices.
5. Return strictly valid JSON following the schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You generate creative, unique, non-repetitive multiple-choice friendship quiz questions for two best friends. Output strictly valid JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            description: 'Array of friendship questions',
            items: {
              type: Type.OBJECT,
              properties: {
                prompt: {
                  type: Type.STRING,
                  description: 'The question text (e.g. Who is more likely to...?)',
                },
                options: {
                  type: Type.ARRAY,
                  description: 'Four multiple-choice options',
                  items: { type: Type.STRING },
                },
              },
              required: ['prompt', 'options'],
            },
          },
        },
      });

      const text = response.text || '[]';
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed) && parsed.length > 0) {
        const formatted = parsed.slice(0, requestedCount).map((item, index) => {
          let opts = item.options || [];
          if (!Array.isArray(opts) || opts.length < 4) {
            opts = ['{p1}', '{p2}', 'Both of us equally', 'Neither of us'];
          }
          return {
            id: index + 1,
            prompt: item.prompt,
            options: [opts[0], opts[1], opts[2], opts[3]] as [string, string, string, string],
          };
        });

        return res.json({
          success: true,
          source: 'gemini-ai',
          theme,
          questions: formatted,
        });
      }
    }

    // Fallback: Use curated themed pool with random shuffling
    const poolKey = theme in THEMED_FALLBACK_POOLS ? theme : 'hilarious';
    const pool = THEMED_FALLBACK_POOLS[poolKey] || THEMED_FALLBACK_POOLS.hilarious;

    // Shuffle pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, requestedCount).map((q, idx) => ({
      id: idx + 1,
      prompt: q.prompt,
      options: q.options,
    }));

    return res.json({
      success: true,
      source: 'curated-fallback',
      theme,
      questions: selected,
    });
  } catch (err: any) {
    console.error('Error in /api/generate-questions:', err);

    // Guaranteed graceful fallback so quiz never fails
    const fallback = THEMED_FALLBACK_POOLS.hilarious.slice(0, 15).map((q, idx) => ({
      id: idx + 1,
      prompt: q.prompt,
      options: q.options,
    }));

    return res.json({
      success: true,
      source: 'emergency-fallback',
      questions: fallback,
    });
  }
});

// Applet health / status
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// Mount Vite or static dist
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bestie Secret Quiz server running on port ${PORT}`);
  });
}

startServer();
