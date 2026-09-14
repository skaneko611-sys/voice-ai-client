# voice-ai-client

**完全無料**の音声AIチャットクライアントです。

- 🎤 音声入力 / 🔊 音声出力: ブラウザ標準の **Web Speech API**（無料・ローカル処理）
- 🤖 会話応答: **Google Gemini API の無料枠**（`gemini-2.0-flash` など）

APIキーはブラウザ側JavaScriptには一切渡さず、サーバー（`server.js`）の環境変数にのみ保持します。

## セットアップ

### 1. Gemini APIキーを無料取得

[Google AI Studio](https://aistudio.google.com/app/apikey) にログインし、無料でAPIキーを発行します。

### 2. 依存パッケージをインストール

```bash
npm install
```

### 3. APIキーを設定

```bash
cp .env.example .env
# .env を開き GEMINI_API_KEY=取得したキー を記入
```

`.env` は `.gitignore` 済みなので、コミット・pushされることはありません。

`dotenv` 等は使用していないため、`.env` の値を読み込むには起動時に環境変数として渡してください。例:

```bash
export $(grep -v '^#' .env | xargs)
npm start
```

もしくは直接:

```bash
GEMINI_API_KEY=あなたのキー npm start
```

### 4. 起動してブラウザで開く

```bash
npm start
```

`http://localhost:3000` を **Chrome** で開きます（音声認識はChrome/Edge等Chromium系のみ対応）。

## 使い方

1. 「🎤 マイクで話す」を押し、マイクの使用を許可
2. 話しかけると音声認識され、「🤖 AI (Gemini) に応答してもらう」がONならAIが自動で返答（テキスト表示＋音声で読み上げ）
3. テキスト入力欄からもAIに送信可能
4. 下の「音声出力 (TTS) 単体テスト」セクションでは、任意のテキストを声・速度・高さを変えて読み上げのみテストできます

## 技術構成

```
ブラウザ (index.html / app.js)
   │  SpeechRecognition (STT) / speechSynthesis (TTS) ※ブラウザ標準・無料
   │
   ├─ POST /api/chat  ──────────────┐
   │                                 ▼
   │                        server.js (Express)
   │                                 │  GEMINI_API_KEY はここだけに保持
   │                                 ▼
   │                     Gemini API (generateContent)
   ▼
 会話ログ表示 + AI応答をTTSで読み上げ
```

- `index.html` / `style.css` / `app.js`: フロントエンド（STT/TTS/チャットUI）
- `server.js`: 静的ファイル配信 + `/api/chat` プロキシ（Gemini APIキーの秘匿）
- 会話履歴はブラウザのメモリ上のみに保持（リロードで消去、「会話をリセット」ボタンでも消去可）

## 無料枠について

- Gemini APIの無料枠には**レート制限**があります（分あたり/日あたりのリクエスト数上限）。詳細は [Gemini API price](https://ai.google.dev/gemini-api/docs/pricing) を確認してください。
- 上限を超えると `/api/chat` がエラーを返します（画面にエラーメッセージが表示されます）。

## 制約

- 音声認識(STT)は Chrome / Edge 等 Chromium系ブラウザのみ対応
- `file://` で直接開くとマイク許可が下りない場合があるため、`npm start` で起動したサーバー経由でアクセスしてください
- 使える声(TTS)はOS/ブラウザにインストールされているものに依存します
- サーバー(`server.js`)はローカルで動かす前提です。公開デプロイする場合はHTTPS化やレート制限・認証の追加を検討してください

## ライセンス

未設定（必要であれば追加してください）
