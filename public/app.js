(() => {
  const talkBtn = document.getElementById('talkBtn');
  const statusEl = document.getElementById('status');
  const transcriptEl = document.getElementById('transcript');
  const audioEl = document.getElementById('remoteAudio');

  let pc = null;
  let dc = null;
  let localStream = null;
  let connected = false;
  let connecting = false;

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

  async function startSession() {
    connecting = true;
    talkBtn.disabled = true;
    setStatus('接続中...');

    try {
      // 1. バックエンドから一時トークン(ephemeral key)を取得する
      const sessionRes = await fetch('/session', { method: 'POST' });
      const sessionData = await sessionRes.json();
      if (!sessionRes.ok) {
        throw new Error(
          typeof sessionData.error === 'string'
            ? sessionData.error
            : 'セッションの作成に失敗しました'
        );
      }
      const ephemeralKey = sessionData.client_secret?.value;
      const model = sessionData.model;
      if (!ephemeralKey || !model) {
        throw new Error('サーバーからの応答が不正です');
      }

      // 2. WebRTC接続を確立する
      pc = new RTCPeerConnection();

      pc.ontrack = (event) => {
        audioEl.srcObject = event.streams[0];
      };

      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

      dc = pc.createDataChannel('oai-events');
      dc.addEventListener('message', handleServerEvent);
      dc.addEventListener('open', () => {
        connected = true;
        connecting = false;
        setStatus('接続済み・話しかけてください');
        talkBtn.textContent = '通話を終了';
        talkBtn.classList.add('active');
        talkBtn.disabled = false;
      });
      dc.addEventListener('close', () => {
        if (connected) stopSession();
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(
        `https://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`,
        {
          method: 'POST',
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            'Content-Type': 'application/sdp',
          },
        }
      );

      if (!sdpResponse.ok) {
        throw new Error('OpenAI Realtime APIへの接続に失敗しました');
      }

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
    } catch (err) {
      console.error(err);
      setStatus(`エラー: ${err.message}`);
      cleanupConnection();
      talkBtn.disabled = false;
    }
  }

  function handleServerEvent(event) {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch {
      return;
    }

    switch (data.type) {
      // ユーザーの発話が文字起こしされた
      case 'conversation.item.input_audio_transcription.completed':
        appendTranscript('user', data.transcript);
        break;
      // AIの発話の文字起こしが完了した
      case 'response.audio_transcript.done':
        appendTranscript('ai', data.transcript);
        break;
      case 'error':
        console.error('Realtime APIエラー:', data.error || data);
        setStatus('エラーが発生しました（詳細はコンソールを確認）');
        break;
      default:
        break;
    }
  }

  function cleanupConnection() {
    if (dc) {
      dc.removeEventListener('message', handleServerEvent);
      dc.close();
    }
    if (pc) pc.close();
    if (localStream) localStream.getTracks().forEach((t) => t.stop());
    pc = null;
    dc = null;
    localStream = null;
  }

  function stopSession() {
    cleanupConnection();
    connected = false;
    connecting = false;
    talkBtn.textContent = '通話を開始';
    talkBtn.classList.remove('active');
    talkBtn.disabled = false;
    setStatus('待機中');
  }

  talkBtn.addEventListener('click', () => {
    if (connecting) return;
    if (connected) {
      stopSession();
    } else {
      startSession();
    }
  });

  // ページを離れる際にマイクを確実に解放する
  window.addEventListener('beforeunload', cleanupConnection);
})();
