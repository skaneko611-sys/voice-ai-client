import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const REALTIME_MODEL =
  process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview-2024-12-17';
const VOICE = process.env.OPENAI_REALTIME_VOICE || 'verse';

if (!OPENAI_API_KEY) {
  console.warn(
    '⚠️  OPENAI_API_KEY が設定されていません。.env ファイルを作成し、APIキーを設定してください（.env.example を参照）。'
  );
}

// ブラウザは秘密のOpenAI APIキーを直接扱えないため、
// このエンドポイントがサーバー側でOpenAIに問い合わせ、
// 短時間だけ有効な「一時トークン（ephemeral key）」を発行してブラウザに渡す。
app.post('/session', async (req, res) => {
  if (!OPENAI_API_KEY) {
    return res.status(500).json({
      error: 'サーバーに OPENAI_API_KEY が設定されていません。',
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: REALTIME_MODEL,
        voice: VOICE,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI session creation failed:', data);
      return res.status(response.status).json({ error: data });
    }

    res.json(data);
  } catch (err) {
    console.error('セッション作成中にエラーが発生しました:', err);
    res.status(500).json({ error: 'セッションの作成に失敗しました' });
  }
});

app.get('/healthz', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`🎙️  音声AIクライアントを起動しました: http://localhost:${PORT}`);
});
