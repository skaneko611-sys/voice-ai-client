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
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_WORKSPACE_ID = process.env.ANTHROPIC_WORKSPACE_ID;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';
const SYSTEM_PROMPT =
  process.env.SYSTEM_PROMPT ||
  'あなたは親しみやすい音声アシスタントです。声で読み上げられることを前提に、話し言葉で簡潔に(2〜3文程度)答えてください。';

if (!ANTHROPIC_API_KEY) {
  console.warn(
    '⚠️  ANTHROPIC_API_KEY が設定されていません。.env ファイルを作成し、APIキーを設定してください（.env.example を参照）。'
  );
}

// 音声認識(ブラウザ内蔵)で文字起こしされた会話履歴を受け取り、
// Anthropic Claude APIで応答テキストを生成して返す。
// 秘密のAPIキーはサーバー側だけで保持し、ブラウザには渡さない。
app.post('/chat', async (req, res) => {
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'サーバーに ANTHROPIC_API_KEY が設定されていません。',
    });
  }

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages が不正です。' });
  }

  try {
    const headers = {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    };
    // 組織レベルのAPIキー(特定のワークスペースに紐付いていないキー)を使う場合、
    // どのワークスペースを使うかを明示するために必要。
    // .envで ANTHROPIC_WORKSPACE_ID を設定していれば付与する。
    if (ANTHROPIC_WORKSPACE_ID) {
      headers['anthropic-workspace-id'] = ANTHROPIC_WORKSPACE_ID;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(response.status).json({ error: data });
    }

    const reply = (data.content || [])
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');

    res.json({ reply });
  } catch (err) {
    console.error('会話生成中にエラーが発生しました:', err);
    res.status(500).json({ error: '会話の生成に失敗しました' });
  }
});

app.get('/healthz', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`🎙️  音声AIクライアントを起動しました: http://localhost:${PORT}`);
});
