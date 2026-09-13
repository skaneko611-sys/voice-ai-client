# voice-ai-client

OpenAI Realtime API（WebRTC・音声to音声）を使った、ブラウザで動く音声AIクライアントです。
マイクに向かって話しかけると、AIが音声で応答します。

## 構成

```
voice-ai-client/
  server.js          # 一時トークン(ephemeral key)発行用の簡易Node.jsサーバー
  public/
    index.html        # クライアント画面
    app.js             # WebRTC接続・音声送受信のロジック
  .env.example         # 環境変数のサンプル
```

OpenAIの秘密APIキーはブラウザに一切渡さず、サーバー側だけで保持します。
ブラウザは接続のたびにサーバーへ一時トークンを要求し、そのトークンだけを使って
OpenAI Realtime APIとWebRTCで直接つながる構成です。

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. APIキーの設定

`.env.example` をコピーして `.env` を作成し、OpenAIのAPIキーを設定します。

```bash
cp .env.example .env
```

`.env` を編集し、`OPENAI_API_KEY` に自分のAPIキーを設定してください。
APIキーは https://platform.openai.com/api-keys から発行できます。

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

その他の環境変数（省略可、デフォルト値あり）:

| 変数名 | 説明 | デフォルト |
|---|---|---|
| `OPENAI_REALTIME_MODEL` | 使用するRealtimeモデル | `gpt-4o-realtime-preview-2024-12-17` |
| `OPENAI_REALTIME_VOICE` | AIの声（`alloy` / `ash` / `ballad` / `coral` / `echo` / `sage` / `shimmer` / `verse` など） | `verse` |
| `PORT` | サーバーのポート番号 | `3000` |

### 3. サーバーの起動

```bash
npm start
```

起動すると以下のように表示されます。

```
🎙️  音声AIクライアントを起動しました: http://localhost:3000
```

### 4. ブラウザで開く

`http://localhost:3000` にアクセスし、「通話を開始」ボタンを押してマイクへのアクセスを許可してください。
接続が完了すると音声で会話ができます。会話内容はテキストとしても画面に表示されます。

## 注意事項

- `getUserMedia`（マイク利用）はセキュリティ上の理由から、`localhost` またはHTTPS環境でのみ動作します。
  本番環境にデプロイする場合はHTTPSを必ず設定してください。
- `.env` ファイルはGit管理対象外（`.gitignore`）です。APIキーを誤ってコミットしないよう注意してください。
- OpenAI Realtime APIの利用には別途OpenAIアカウントとAPI利用料金が発生します。

## ライセンス

特に指定なし。
