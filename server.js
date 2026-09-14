// voice-ai-client server
//
// Serves the static browser client and proxies chat requests to the Gemini
// API. The Gemini API key stays server-side (read from .env via dotenv) so
// it is never exposed to the browser/client JavaScript.
//
// Setup:
//   1. Get a free API key at https://aistudio.google.com/app/apikey
//   2. cp .env.example .env, then paste the key into .env
//   3. npm install
//   4. npm start
//   5. Open http://localhost:3000

require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post("/api/chat", async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error: "GEMINI_API_KEY が設定されていません。サーバー起動前に環境変数を設定してください。",
    });
  }

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages (配列) が必要です。" });
  }

  // クライアントの {role: "user"|"model", text: string}[] を
  // Gemini API の contents 形式に変換
  const contents = messages.map((m) => ({
    role: m.role === "model" ? "model" : "user",
    parts: [{ text: String(m.text ?? "") }],
  }));

  try {
    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      const message = data?.error?.message || `Gemini API error (status ${geminiRes.status})`;
      return res.status(geminiRes.status).json({ error: message });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";

    if (!reply) {
      // 安全フィルタでブロックされた場合など
      const finishReason = data?.candidates?.[0]?.finishReason;
      return res.status(502).json({
        error: `Gemini から応答テキストを取得できませんでした${finishReason ? ` (finishReason: ${finishReason})` : ""}。`,
      });
    }

    res.json({ reply });
  } catch (err) {
    console.error("Gemini API call failed:", err);
    res.status(502).json({ error: "Gemini API への接続に失敗しました。" });
  }
});

app.listen(PORT, () => {
  console.log(`voice-ai-client server running at http://localhost:${PORT}`);
  if (!GEMINI_API_KEY) {
    console.warn("警告: GEMINI_API_KEY が未設定です。AI応答機能は動作しません。");
  }
});
