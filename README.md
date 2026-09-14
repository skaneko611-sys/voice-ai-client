# voice-ai-client

**完全無料**の音声AIチャットクライアントです。

- 🎤 音声入力 / 🔊 音声出力: ブラウザ標準の **Web Speech API**（無料・ローカル処理）
- 🤖 会話応答: **Google Gemini API の無料枠**（`gemini-2.0-flash` など）

APIキーはブラウザ側JavaScriptには一切渡さず、サーバー（`server.js`）の環境変数にのみ保持します。

## セットアップ（初めての方向け・詳しい手順）

### 0. 前提: Node.js をインストール

まだ入れていない場合は [nodejs.org](https://nodejs.org/) からLTS版をダウンロードしてインストールしてください。
インストール後、ターミナル（Mac: ターミナル.app / Windows: PowerShellやコマンドプロンプト）で以下を実行し、バージョンが表示されればOKです。

```bash
node -v
npm -v
```

### 1. リポジトリを取得する

**gitが使える場合:**

```bash
git clone https://github.com/skaneko611-sys/voice-ai-client.git
cd voice-ai-client
git checkout claude/orrery-repo-setup-suxejx
```

**gitを使わない場合:** GitHubのリポジトリページで緑色の「Code」ボタン→「Download ZIP」からダウンロードし、展開したフォルダをターミナルで開きます（`cd` でそのフォルダに移動）。
※ その場合はブランチ `claude/orrery-repo-setup-suxejx` を選んだ状態でダウンロードしてください（ブランチ切り替えのドロップダウンから選択）。

### 2. フォルダに移動していることを確認

```bash
pwd
```
と打って、`voice-ai-client` フォルダの中にいることを確認してください（`ls` で `server.js` や `package.json` が見えていればOK）。

### 3. 依存パッケージをインストール

```bash
npm install
```

`node_modules` フォルダが作成されます（初回は少し時間がかかります）。

### 4. Gemini APIキーを無料取得

1. [Google AI Studio](https://aistudio.google.com/app/apikey) を開く
2. Googleアカウントでログイン
3. 「Create API key」を押してキーを発行・コピー

### 5. APIキーをこのプロジェクトに設定

まず `.env.example` をコピーして `.env` という名前のファイルを作ります。

```bash
cp .env.example .env
```

作成された `.env` ファイルを**テキストエディタ**（メモ帳、VS Codeなど）で開き、

```
GEMINI_API_KEY=
```

の `=` の後ろに、先ほどコピーしたAPIキーを貼り付けて保存します。例:

```
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

（`.env` は `.gitignore` に登録済みなので、GitHubに公開されることはありません）

### 6. サーバーを起動する

```bash
npm start
```

ターミナルに `voice-ai-client server running at http://localhost:3000` と表示されれば起動成功です。
（`警告: GEMINI_API_KEY が未設定です` と出た場合は、手順5の `.env` の書き方を見直してください）

### 7. ブラウザで開く

**Chrome** を開き、アドレスバーに `http://localhost:3000` と入力してアクセスします。
（音声認識はChrome/Edge等のChromium系ブラウザのみ対応です）

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
