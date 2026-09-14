# voice-ai-client

ブラウザ標準の **Web Speech API** だけで動く、無料の音声入出力（STT/TTS）デモです。
サーバー通信や外部API・APIキーは一切使用していません。

## できること

- 🎤 **音声入力（STT）**: マイクに話した内容をリアルタイムでテキスト化
- 🔊 **音声出力（TTS）**: 任意のテキストを選んだ声・速度・高さで読み上げ
- 認識結果を自動で読み上げる「オウム返し」モード（音声の入出力ラウンドトリップ確認用）

## 使い方

1. Chrome など Web Speech API 対応ブラウザでこのフォルダを開く（ローカルサーバー経由推奨。例: `npx serve .` や VS Code の Live Server）
2. `index.html` を開く
3. 「🎤 マイクで話す」を押し、マイクの使用を許可
4. 話した内容が認識され、テキスト化・自動読み上げされる
5. 下の「音声出力」セクションでは、好きなテキストを好きな声・速度・高さで読み上げ可能

## 技術構成

- `index.html` / `style.css` / `app.js` のみ。ビルド不要、依存ライブラリなし
- STT: [`SpeechRecognition`](https://developer.mozilla.org/ja/docs/Web/API/SpeechRecognition)（`webkitSpeechRecognition`）
- TTS: [`speechSynthesis`](https://developer.mozilla.org/ja/docs/Web/API/SpeechSynthesis)
- 利用できる声はOS/ブラウザにインストールされているものに依存します

## 制約

- 音声認識(STT)は現状 Chrome / Edge 等の Chromium系ブラウザのみ対応（Firefox/Safariは非対応 or 制限あり）
- `file://` で直接開くとマイク許可が下りない場合があるため、ローカルサーバー経由での起動を推奨
- 今は「聞いた内容をそのまま読み上げる」だけで、AIによる応答生成は行っていません。会話応答（LLM連携）を追加する場合は別途相談してください

## ライセンス

未設定（必要であれば追加してください）
