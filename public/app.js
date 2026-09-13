(() => {
  const talkBtn = document.getElementById('talkBtn');
  const statusEl = document.getElementById('status');
  const transcriptEl = document.getElementById('transcript');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition || !window.speechSynthesis) {
    statusEl.textContent = 'このブラウザは音声認識/音声合成に対応していません（Chrome推奨）';
    talkBtn.disabled = true;
    return;
  }

  let recognition = null;
  let listening = false; // 通話中かどうか
  let busy = false; // AI応答の生成中・読み上げ中(この間は音声認識を止める)
  const history = [];

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function appendTranscript(role, text) {
    if (!text) return;
    const line = document.createElement('div');
    line.className = `line ${role}`;
    line.textContent = `${role === 'user' ? '🧑' : '🤖'} ${text}`;
    transcriptEl.appendChild(line);
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
  }

  function createRecognition() {
    const r = new SpeechRecognition();
    r.lang = 'ja-JP';
    r.continuous = true;
    r.interimResults = false;

    r.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      if (!result.isFinal) return;
      const text = result[0].transcript.trim();
      if (!text) return;
      handleUserUtterance(text);
    };

    r.onerror = (event) => {
      // no-speech(無音タイムアウト)やabortedは通常運転の一部なので無視する
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      console.error('SpeechRecognition error:', event.error);
      setStatus(`音声認識エラー: ${event.error}`);
    };

    r.onend = () => {
      // 通話中かつ応答処理中でなければ、認識を継続するため再開する
      if (listening && !busy) {
        try {
          recognition.start();
        } catch {
          // 直前に開始済みの場合などは無視
        }
      }
    };

    return r;
  }

  async function handleUserUtterance(text) {
    appendTranscript('user', text);
    history.push({ role: 'user', content: text });

    busy = true;
    setStatus('考え中...');

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data.error === 'string' ? data.error : '応答の取得に失敗しました'
        );
      }

      const reply = data.reply || '';
      history.push({ role: 'assistant', content: reply });
      appendTranscript('ai', reply);
      speak(reply);
    } catch (err) {
      console.error(err);
      setStatus(`エラー: ${err.message}`);
      busy = false;
      resumeListeningIfActive();
    }
  }

  function speak(text) {
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ja-JP';
    utter.onend = () => {
      busy = false;
      setStatus(listening ? '聞いています...' : '待機中');
      resumeListeningIfActive();
    };
    utter.onerror = () => {
      busy = false;
      resumeListeningIfActive();
    };
    speechSynthesis.speak(utter);
  }

  function resumeListeningIfActive() {
    if (!listening) return;
    try {
      recognition.start();
    } catch {
      // 既に開始されている場合などは無視
    }
  }

  function startSession() {
    listening = true;
    busy = false;
    recognition = createRecognition();
    recognition.start();
    talkBtn.textContent = '通話を終了';
    talkBtn.classList.add('active');
    setStatus('聞いています...');
  }

  function stopSession() {
    listening = false;
    busy = false;
    speechSynthesis.cancel();
    if (recognition) recognition.stop();
    recognition = null;
    talkBtn.textContent = '通話を開始';
    talkBtn.classList.remove('active');
    setStatus('待機中');
  }

  talkBtn.addEventListener('click', () => {
    if (listening) {
      stopSession();
    } else {
      startSession();
    }
  });

  window.addEventListener('beforeunload', () => {
    if (recognition) recognition.stop();
    speechSynthesis.cancel();
  });
})();
