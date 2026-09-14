// voice-ai-client — Web Speech API だけで動く音声入出力デモ
// STT: SpeechRecognition / TTS: speechSynthesis（どちらもブラウザ標準・無料・サーバー通信なし）

const micBtn = document.getElementById("micBtn");
const micStatus = document.getElementById("micStatus");
const interimEl = document.getElementById("interim");
const finalList = document.getElementById("finalList");

const voiceSelect = document.getElementById("voiceSelect");
const rateInput = document.getElementById("rate");
const pitchInput = document.getElementById("pitch");
const rateVal = document.getElementById("rateVal");
const pitchVal = document.getElementById("pitchVal");
const speakText = document.getElementById("speakText");
const speakBtn = document.getElementById("speakBtn");
const stopSpeakBtn = document.getElementById("stopSpeakBtn");
const echoBack = document.getElementById("echoBack");

// ---------- TTS (speechSynthesis) ----------

let voices = [];

function loadVoices() {
  voices = speechSynthesis.getVoices();
  if (!voices.length) return;

  voiceSelect.innerHTML = "";
  voices.forEach((v, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${v.name} (${v.lang})${v.default ? " ★" : ""}`;
    voiceSelect.appendChild(opt);
  });

  // 日本語の声があれば優先的に選択
  const jaIndex = voices.findIndex((v) => v.lang.startsWith("ja"));
  if (jaIndex >= 0) voiceSelect.value = jaIndex;
}

speechSynthesis.addEventListener("voiceschanged", loadVoices);
loadVoices();

function speak(text) {
  if (!text || !text.trim()) return;
  speechSynthesis.cancel(); // 前の発話が残っていたら止めてから話す

  const utterance = new SpeechSynthesisUtterance(text);
  const selected = voices[Number(voiceSelect.value)];
  if (selected) {
    utterance.voice = selected;
    utterance.lang = selected.lang;
  }
  utterance.rate = Number(rateInput.value);
  utterance.pitch = Number(pitchInput.value);
  speechSynthesis.speak(utterance);
}

speakBtn.addEventListener("click", () => speak(speakText.value));
stopSpeakBtn.addEventListener("click", () => speechSynthesis.cancel());

rateInput.addEventListener("input", () => (rateVal.textContent = rateInput.value));
pitchInput.addEventListener("input", () => (pitchVal.textContent = pitchInput.value));

// ---------- STT (SpeechRecognition) ----------

const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let listening = false;

if (!SpeechRecognitionImpl) {
  micBtn.disabled = true;
  micStatus.textContent = "このブラウザは音声認識(STT)に対応していません（Chrome推奨）";
} else {
  recognition = new SpeechRecognitionImpl();
  recognition.lang = "ja-JP";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.addEventListener("result", (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const text = result[0].transcript;
      if (result.isFinal) {
        addFinalTranscript(text);
        if (echoBack.checked) speak(text);
      } else {
        interim += text;
      }
    }
    interimEl.textContent = interim;
  });

  recognition.addEventListener("end", () => {
    // continuous=true でも無音が続くと自動終了することがあるため、
    // マイクボタンがONのままなら再開する
    if (listening) {
      try {
        recognition.start();
      } catch (e) {
        // 直前に start 済みなど、再開に失敗した場合は無視
      }
    }
  });

  recognition.addEventListener("error", (event) => {
    micStatus.textContent = `エラー: ${event.error}`;
  });

  micBtn.addEventListener("click", () => {
    if (!listening) {
      listening = true;
      recognition.start();
      micBtn.textContent = "⏹ 停止";
      micBtn.classList.add("recording");
      micStatus.textContent = "認識中...";
    } else {
      listening = false;
      recognition.stop();
      micBtn.textContent = "🎤 マイクで話す";
      micBtn.classList.remove("recording");
      micStatus.textContent = "停止中";
      interimEl.textContent = "";
    }
  });
}

function addFinalTranscript(text) {
  const li = document.createElement("li");
  li.textContent = text;
  finalList.appendChild(li);
  finalList.scrollTop = finalList.scrollHeight;
}
