# voice-ai-client

ブラウザ標準の音声認識・音声合成（Web Speech API）と、Anthropic Claude APIを組み合わせた、
ブラウザで動く音声AIクライアントです。マイクに向かって話しかけると、AIが音声で応答します。

音声認識・音声合成はブラウザ内蔵機能を使うため**追加のAPI契約・カード登録は不要**です。
会話の応答生成にのみ、別途Anthropicアカウント（Claude API）を利用します。

## 構成

```
voice-ai-client/
  server.js          # Anthropic Claude APIへの問い合わせを仲介する簡易Node.jsサーバー
  public/
    index.html        # クライアント画面
    app.js             # 音声認識(SpeechRecognition)・音声合成(SpeechSynthesis)・会話のロジック
  .env.example         # 環境変数のサンプル
```

Anthropicの秘密APIキーはブラウザに一切渡さず、サーバー側だけで保持します。
ブラウザは音声をその場でテキストに変換し、そのテキストをサーバー経由でClaude APIに送信、
返ってきた応答テキストをブラウザの音声合成機能で読み上げる構成です。

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. APIキーの設定

`.env.example` をコピーして `.env` を作成し、AnthropicのAPIキーを設定します。

```bash
cp .env.example .env
```

`.env` を編集し、`ANTHROPIC_API_KEY` に自分のAPIキーを設定してください。
APIキーは https://console.anthropic.com/settings/keys から発行できます
（Anthropic Consoleのアカウント作成・支払い情報の登録が必要です）。

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

その他の環境変数（省略可、デフォルト値あり）:

| 変数名 | 説明 | デフォルト |
|---|---|---|
| `ANTHROPIC_MODEL` | 使用するClaudeモデル | `claude-sonnet-5` |
| `SYSTEM_PROMPT` | AIの人格・応答スタイルを指定するシステムプロンプト | 音声向けの簡潔な応答を指示する文言 |
| `ANTHROPIC_WORKSPACE_ID` | ワークスペースに紐付いていないAPIキーを使う場合のみ必要（下記参照） | なし |
| `PORT` | サーバーのポート番号 | `3000` |

### 「This API key is not scoped to a workspace」エラーが出た場合

発行したAPIキーが特定のワークスペースに紐付いていない場合に発生します。以下のいずれかで解決してください。

- **キーを再発行する（推奨）**: https://console.anthropic.com/settings/keys で「Create Key」時に特定のワークスペースを選択してキーを作り直す
- **現在のキーのまま使う**: Anthropic ConsoleのURL（`https://console.anthropic.com/workspaces/wrkspc_xxxxx/...`）に含まれる `wrkspc_` から始まるワークスペースIDを `.env` の `ANTHROPIC_WORKSPACE_ID` に設定する

### 3. サーバーの起動

```bash
npm start
```

起動すると以下のように表示されます。

```
🎙️  音声AIクライアントを起動しました: http://localhost:3000
```

### 4. ブラウザで開く

`http://localhost:3000` にChrome等の対応ブラウザでアクセスし、「通話を開始」ボタンを押して
マイクへのアクセスを許可してください。話しかけると、AIがテキストで応答を生成し、
その内容が音声で読み上げられます。会話内容はテキストとしても画面に表示されます。

## 注意事項

- 音声認識（`SpeechRecognition`）はブラウザ実装に依存します。**Google Chrome / Microsoft Edge** での動作を推奨します（Firefox・Safariは非対応または挙動が異なる場合があります）。
- マイク利用（`getUserMedia`を内部的に使用）はセキュリティ上の理由から、`localhost` またはHTTPS環境でのみ動作します。本番環境にデプロイする場合はHTTPSを必ず設定してください。
- `.env` ファイルはGit管理対象外（`.gitignore`）です。APIキーを誤ってコミットしないよう注意してください。
- Anthropic Claude APIの利用には別途AnthropicアカウントとAPI利用料金が発生します。最新の料金は https://www.anthropic.com/pricing を確認してください。

## ライセンス

特に指定なし。
