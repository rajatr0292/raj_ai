/**
 * Rajat AI — Speak-to-Speak Conversational AI Agent
 * Built with Web Speech API, Google Gemini API, Web Audio API & HTML5 Canvas
 * Full Hindi (हिन्दी), Hinglish, and English Voice Support
 */

(function () {
  'use strict';

  // ==========================================
  // CONFIG & STATE
  // ==========================================
  const STORAGE_KEYS = {
    API_KEY: 'rajat_gemini_api_key',
    MODEL: 'rajat_gemini_model',
    LANG: 'rajat_lang',
    PERSONA: 'rajat_persona',
    KNOWLEDGE_BASE: 'rajat_knowledge_base',
    VOICE_URI: 'rajat_voice_uri',
    RATE: 'rajat_voice_rate',
    PITCH: 'rajat_voice_pitch',
    AUTO_LOOP: 'rajat_auto_loop',
    SOUND_FX: 'rajat_sound_fx'
  };

  const PERSONA_PROMPTS = {
    gemini_hi: "आप Rajat AI हैं, Google Gemini से प्रेरित एक अत्यंत बुद्धिमान, विनम्र और मित्रवत AI सहायक। आपको Rajat द्वारा बनाया गया है। आपको हमेशा प्राकृतिक, शुद्ध और मधुर हिन्दी (Hindi) में बोलना और जवाब देना है। अपने उत्तर छोटे, सम्भाषण योग्य (1-3 वाक्य) और सुनने में आसान रखें। आप इस वेबसाइट के सभी फीचर्स जैसे Speak-to-Speak, Voice Orb, Auto Loop, और Chat Mode के बारे में पूरी जानकारी रखते हैं।",
    gemini_hinglish: "You are Rajat AI, an ultra-smart, friendly AI voice assistant created by Rajat. Reply in natural, conversational Hinglish (Hindi words written in English letters or clean conversational Hindi). Keep your voice responses punchy, friendly, and 1-3 sentences long. You have complete knowledge of this web application and its features.",
    gemini_en: "You are Rajat AI, an ultra-intelligent, friendly, and warm AI conversational assistant created by Rajat and inspired by Google Gemini Live. Keep your spoken responses concise, conversational, engaging, and easy to listen to (1-3 sentences). You possess complete knowledge of this website and all its capabilities.",

    buddy_hi: "आप Rajat AI हैं, उपयोगकर्ता के सबसे अच्छे और मज़ेदार दोस्त। बहुत ही दोस्ताना, उत्साही और सरल हिन्दी में बात करें।",
    buddy_hinglish: "You are Rajat AI, the user's fun and enthusiastic best friend created by Rajat. Talk in friendly, energetic Hinglish!",
    buddy_en: "You are Rajat AI, the user's enthusiastic, super friendly best friend created by Rajat.",

    mentor_hi: "आप Rajat AI हैं, एक तकनीकी गुरु और मेंटर। कठिन विषयों और इस वेबसाइट के सभी टूल्स को बहुत सरल और स्पष्ट हिन्दी में समझाएं।",
    mentor_en: "You are Rajat AI, an encouraging tech mentor. Explain concepts and website capabilities simply with great clarity.",

    storyteller_hi: "आप Rajat AI हैं, एक रोचक और भावपूर्ण कथाकार। सुंदर हिन्दी, कविताओं और कहानियों के साथ बात करें।",
    storyteller_en: "You are Rajat AI, a witty and poetic storyteller with vivid imagination."
  };

  const DEFAULT_WEBSITE_KNOWLEDGE = `
[OFFICIAL WEBSITE ARCHITECTURE & PRODUCT SPECIFICATION]:
- Application Name: Rajat AI (Live 2.0)
- Creator & Developer: Rajat (AI Developer & Engineer).
- Purpose: A real-time Speak-to-Speak conversational voice agent web application inspired by Google Gemini Live.
- Key Capabilities & Layout:
  1. Speak-to-Speak Real-time Voice: Natural speech recognition (STT) and voice synthesis (TTS) in Hindi (हिन्दी), Hinglish, and English.
  2. Voice View (Orb Visualizer): An interactive 3D particle canvas visualizer that dynamically pulses and reacts to voice frequency and speech input in real-time.
  3. Chat View: Interactive timeline storing message history, message re-speak audio buttons, copy-to-clipboard buttons, and a text prompt bar.
  4. Auto Loop (Hands-Free Mode): Enabled via the repeat button (🔁). Automatically reactivates the microphone when the agent finishes speaking, providing continuous conversation.
  5. Multi-Language Support:
     - 🇮🇳 Hindi (hi-IN): Polite, fluent, and sweet conversational Hindi.
     - 🇮🇳 Hinglish: Casual Indian conversational mix.
     - 🌐 English (en-US / en-IN): Articulate modern English.
     - Quick Language Switcher dropdown on the header.
  6. AI Personas:
     - Rajat AI (Standard): Helpful, polite, and ultra-intelligent.
     - Best Friend (Buddy): Fun, cheerful, and casual.
     - Tech Mentor & Guru: Clear explanations and learning guidance.
     - Storyteller (कथाकार): Poetic, creative, and engaging storytelling.
  7. AI Engines:
     - Google Gemini 2.5 Flash, 1.5 Flash, and 1.5 Pro via user's API key.
     - Built-in Smart Fallback Engine: Works instantly without an API key for offline/instant questions.
  8. Custom Knowledge Base: Users can paste custom documentation, FAQs, or business facts in Settings -> "Agent Knowledge Base & Context".
  9. Audio Customization: Speed (0.7x - 1.5x), Pitch adjustments, System Voice selector, Mute/Speaker toggle, and immediate Interrupt ("Stop Speaking").
  10. Privacy & Security: 100% client-side privacy; API keys and custom knowledge are stored exclusively in the browser's localStorage.
`;

  const state = {
    status: 'idle', // 'idle' | 'listening' | 'thinking' | 'speaking'
    isListening: false,
    isSpeaking: false,
    voiceOutputEnabled: true,
    lang: localStorage.getItem(STORAGE_KEYS.LANG) || 'hi-IN',
    autoLoop: localStorage.getItem(STORAGE_KEYS.AUTO_LOOP) !== 'false',
    soundFx: localStorage.getItem(STORAGE_KEYS.SOUND_FX) !== 'false',
    apiKey: localStorage.getItem(STORAGE_KEYS.API_KEY) || '',
    model: localStorage.getItem(STORAGE_KEYS.MODEL) || 'gemini-1.5-flash',
    persona: localStorage.getItem(STORAGE_KEYS.PERSONA) || 'gemini',
    knowledgeBase: localStorage.getItem(STORAGE_KEYS.KNOWLEDGE_BASE) || '',
    voiceUri: localStorage.getItem(STORAGE_KEYS.VOICE_URI) || '',
    rate: parseFloat(localStorage.getItem(STORAGE_KEYS.RATE)) || 1.0,
    pitch: parseFloat(localStorage.getItem(STORAGE_KEYS.PITCH)) || 1.0,
    currentView: 'voice', // 'voice' | 'chat'
    history: []
  };

  // ==========================================
  // DOM ELEMENTS
  // ==========================================
  const statusBadge = document.getElementById('statusBadge');
  const statusText = document.getElementById('statusText');
  const viewToggleBtn = document.getElementById('viewToggleBtn');
  const viewToggleLabel = document.getElementById('viewToggleLabel');
  const clearChatBtn = document.getElementById('clearChatBtn');
  const apiKeyStatusBtn = document.getElementById('apiKeyStatusBtn');
  const apiKeyStatusText = document.getElementById('apiKeyStatusText');
  const settingsBtn = document.getElementById('settingsBtn');
  const quickLangSelect = document.getElementById('quickLangSelect');

  const voiceView = document.getElementById('voiceView');
  const chatView = document.getElementById('chatView');
  const visualizerCanvas = document.getElementById('visualizerCanvas');
  const orbCenterPulse = document.getElementById('orbCenterPulse');
  const liveTranscript = document.getElementById('liveTranscript');
  const speakerTag = document.getElementById('speakerTag');
  const suggestionChips = document.getElementById('suggestionChips');

  const chatMessages = document.getElementById('chatMessages');
  const typingIndicator = document.getElementById('typingIndicator');
  const textPromptInput = document.getElementById('textPromptInput');
  const sendTextBtn = document.getElementById('sendTextBtn');

  const micBtn = document.getElementById('micBtn');
  const speakerToggleBtn = document.getElementById('speakerToggleBtn');
  const autoLoopBtn = document.getElementById('autoLoopBtn');
  const stopSpeakingBtn = document.getElementById('stopSpeakingBtn');

  // Modal elements
  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const toggleApiKeyVis = document.getElementById('toggleApiKeyVis');
  const testApiKeyBtn = document.getElementById('testApiKeyBtn');
  const apiKeyTestResult = document.getElementById('apiKeyTestResult');
  const modelSelect = document.getElementById('modelSelect');
  const langSelect = document.getElementById('langSelect');
  const personaSelect = document.getElementById('personaSelect');
  const knowledgeBaseInput = document.getElementById('knowledgeBaseInput');
  const voiceSelect = document.getElementById('voiceSelect');
  const rateSlider = document.getElementById('rateSlider');
  const rateVal = document.getElementById('rateVal');
  const pitchSlider = document.getElementById('pitchSlider');
  const pitchVal = document.getElementById('pitchVal');
  const continuousToggle = document.getElementById('continuousToggle');
  const soundFxToggle = document.getElementById('soundFxToggle');
  const testVoiceBtn = document.getElementById('testVoiceBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const toastContainer = document.getElementById('toastContainer');

  // ==========================================
  // AUDIO SYNTHESIS & RECOGNITION INSTANCES
  // ==========================================
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let synth = window.speechSynthesis;
  let availableVoices = [];
  let currentUtterance = null;
  let audioCtx = null;

  // Visualizer Animation variables
  let canvasCtx = null;
  let animFrameId = null;
  let orbPhase = 0;
  let audioLevel = 0;
  let targetAudioLevel = 0;

  // ==========================================
  // INITIALIZATION
  // ==========================================
  function init() {
    initSettingsForm();
    initSpeechRecognition();
    initSpeechSynthesis();
    initVisualizer();
    bindEvents();
    updateStatus('idle', getStatusLabel('idle'));

    if (state.autoLoop) {
      autoLoopBtn.classList.add('active');
    }
  }

  function getStatusLabel(statusKey) {
    const isHi = state.lang === 'hi-IN' || state.lang === 'hinglish';
    switch (statusKey) {
      case 'idle': return isHi ? 'Rajat AI तैयार है' : 'Rajat AI Ready';
      case 'listening': return isHi ? 'सुन रहा हूँ...' : 'Listening...';
      case 'thinking': return isHi ? 'सोच रहा हूँ...' : 'Thinking...';
      case 'speaking': return isHi ? 'बोल रहा हूँ...' : 'Speaking...';
      default: return 'Ready';
    }
  }

  // ==========================================
  // SETTINGS MANAGEMENT
  // ==========================================
  function updateApiKeyStatusUI() {
    const hasKey = !!state.apiKey && state.apiKey.trim().length > 5;
    if (apiKeyStatusBtn) {
      apiKeyStatusBtn.classList.toggle('connected', hasKey);
    }
    if (apiKeyStatusText) {
      apiKeyStatusText.textContent = hasKey ? 'Gemini Connected' : 'Connect Gemini';
    }
  }

  function initSettingsForm() {
    apiKeyInput.value = state.apiKey;
    modelSelect.value = state.model || 'gemini-2.0-flash';
    if (apiKeyTestResult) {
      apiKeyTestResult.className = 'api-test-result';
      apiKeyTestResult.innerHTML = state.apiKey ? '<span style="color:#34d399"><i class="fa-solid fa-circle-check"></i> Key Configured</span>' : '';
    }
    if (langSelect) langSelect.value = state.lang;
    if (quickLangSelect) quickLangSelect.value = state.lang;
    personaSelect.value = state.persona;
    if (knowledgeBaseInput) knowledgeBaseInput.value = state.knowledgeBase;
    rateSlider.value = state.rate;
    rateVal.textContent = state.rate.toFixed(2) + 'x';
    pitchSlider.value = state.pitch;
    pitchVal.textContent = state.pitch.toFixed(2);
    continuousToggle.checked = state.autoLoop;
    soundFxToggle.checked = state.soundFx;
    updateApiKeyStatusUI();
  }

  function setLanguage(newLang) {
    state.lang = newLang;
    localStorage.setItem(STORAGE_KEYS.LANG, newLang);
    if (langSelect) langSelect.value = newLang;
    if (quickLangSelect) quickLangSelect.value = newLang;

    if (recognition) {
      recognition.lang = (state.lang === 'hinglish') ? 'hi-IN' : state.lang;
    }

    // Refresh voice list with new language priority
    initSpeechSynthesis();
    updateStatus('idle', getStatusLabel('idle'));

    // Update suggestions for language
    updateSuggestionChips();

    const toastMsg = (state.lang === 'hi-IN') ? 'भाषा बदलकर हिन्दी (Hindi) कर दी गई है 🇮🇳' :
      (state.lang === 'hinglish') ? 'Language switched to Hinglish 🇮🇳' : 'Language set to English 🌐';
    showToast(toastMsg, 'success');
  }

  function updateSuggestionChips() {
    if (state.lang === 'hi-IN' || state.lang === 'hinglish') {
      suggestionChips.innerHTML = `
        <button class="chip" data-prompt="नमस्ते रजत! आप कैसे हो?">👋 "नमस्ते! आप कैसे हो?"</button>
        <button class="chip" data-prompt="अंतरिक्ष का कोई मज़ेदार तथ्य बताओ!">✨ "अंतरिक्ष का तथ्य"</button>
        <button class="chip" data-prompt="आप कौन हो और क्या-क्या कर सकते हो?">🤖 "आप क्या कर सकते हो?"</button>
        <button class="chip" data-prompt="एक बढ़िया सा मज़ेदार चुटकुला सुनाओ!">😄 "मज़ेदार चुटकुला"</button>
      `;
    } else {
      suggestionChips.innerHTML = `
        <button class="chip" data-prompt="Hi Rajat! How are you doing today?">👋 "Hi Rajat! How are you?"</button>
        <button class="chip" data-prompt="Tell me an interesting fun fact about the universe!">✨ "Fun fact about space"</button>
        <button class="chip" data-prompt="Who created you and what can you do?">🤖 "What can you do?"</button>
        <button class="chip" data-prompt="Tell me a funny joke to make me smile!">😄 "Tell me a joke"</button>
      `;
    }
  }

  function saveSettings() {
    state.apiKey = apiKeyInput.value.trim();
    state.model = modelSelect.value;
    state.lang = langSelect.value;
    state.persona = personaSelect.value;
    if (knowledgeBaseInput) {
      state.knowledgeBase = knowledgeBaseInput.value.trim();
      localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_BASE, state.knowledgeBase);
    }
    state.voiceUri = voiceSelect.value;
    state.rate = parseFloat(rateSlider.value);
    state.pitch = parseFloat(pitchSlider.value);
    state.autoLoop = continuousToggle.checked;
    state.soundFx = soundFxToggle.checked;

    localStorage.setItem(STORAGE_KEYS.API_KEY, state.apiKey);
    localStorage.setItem(STORAGE_KEYS.MODEL, state.model);
    localStorage.setItem(STORAGE_KEYS.LANG, state.lang);
    localStorage.setItem(STORAGE_KEYS.PERSONA, state.persona);
    localStorage.setItem(STORAGE_KEYS.VOICE_URI, state.voiceUri);
    localStorage.setItem(STORAGE_KEYS.RATE, state.rate);
    localStorage.setItem(STORAGE_KEYS.PITCH, state.pitch);
    localStorage.setItem(STORAGE_KEYS.AUTO_LOOP, state.autoLoop);
    localStorage.setItem(STORAGE_KEYS.SOUND_FX, state.soundFx);

    if (quickLangSelect) quickLangSelect.value = state.lang;
    if (recognition) {
      recognition.lang = (state.lang === 'hinglish') ? 'hi-IN' : state.lang;
    }

    autoLoopBtn.classList.toggle('active', state.autoLoop);
    settingsModal.classList.remove('open');
    updateApiKeyStatusUI();
    updateStatus('idle', getStatusLabel('idle'));
    showToast('Settings & Gemini connection saved!', 'success');
  }

  // ==========================================
  // SOUND EFFECTS (Web Audio API Synthesizer)
  // ==========================================
  function playChime(type) {
    if (!state.soundFx) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'start') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'stop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'agent') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.warn('Audio chime note could not be played:', e);
    }
  }

  // ==========================================
  // SPEECH RECOGNITION (Speech-to-Text / Voice In)
  // ==========================================
  function initSpeechRecognition() {
    if (!SpeechRecognition) {
      showToast('Web Speech API is not supported in this browser. Please use Google Chrome or Safari.', 'error');
      micBtn.style.opacity = '0.5';
      micBtn.title = 'Speech Recognition not supported in this browser';
      return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    // Auto set recognition language (Hindi 'hi-IN' by default)
    recognition.lang = (state.lang === 'hinglish') ? 'hi-IN' : (state.lang || 'hi-IN');

    recognition.onstart = () => {
      state.isListening = true;
      updateStatus('listening', getStatusLabel('listening'));
      micBtn.classList.add('listening');
      playChime('start');
      speakerTag.textContent = (state.lang === 'hi-IN' || state.lang === 'hinglish') ? 'आप (बोल रहे हैं)' : 'You (Speaking)';
      speakerTag.style.color = '#f87171';
      liveTranscript.textContent = (state.lang === 'hi-IN' || state.lang === 'hinglish') ? 'आपकी आवाज़ सुन रहा हूँ...' : 'Listening to your voice...';
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const textToShow = final || interim;
      if (textToShow) {
        liveTranscript.textContent = `"${textToShow}"`;
        targetAudioLevel = 0.7 + Math.random() * 0.3;
      }

      if (final.trim().length > 0) {
        processUserQuery(final.trim());
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      state.isListening = false;
      micBtn.classList.remove('listening');
      if (event.error !== 'no-speech') {
        showToast(`Mic error: ${event.error}`, 'error');
      }
      if (state.status === 'listening') {
        updateStatus('idle', getStatusLabel('idle'));
      }
    };

    recognition.onend = () => {
      state.isListening = false;
      micBtn.classList.remove('listening');
      targetAudioLevel = 0.1;
      if (state.status === 'listening') {
        updateStatus('idle', getStatusLabel('idle'));
        playChime('stop');
      }
    };
  }

  function toggleListening() {
    if (!recognition) {
      showToast('Speech recognition not supported in this browser.', 'error');
      return;
    }

    if (state.isSpeaking) {
      stopSpeaking();
    }

    if (state.isListening) {
      recognition.stop();
    } else {
      try {
        recognition.lang = (state.lang === 'hinglish') ? 'hi-IN' : (state.lang || 'hi-IN');
        recognition.start();
      } catch (err) {
        console.warn('SpeechRecognition start error:', err);
      }
    }
  }

  // ==========================================
  // SPEECH SYNTHESIS (Text-to-Speech / Voice Out)
  // ==========================================
  function initSpeechSynthesis() {
    if (!synth) return;

    function populateVoices() {
      availableVoices = synth.getVoices();
      voiceSelect.innerHTML = '';

      if (availableVoices.length === 0) {
        voiceSelect.innerHTML = '<option value="">Default System Voice</option>';
        return;
      }

      const isHindiTarget = state.lang === 'hi-IN' || state.lang === 'hinglish';

      // Sort voices: Prioritize Hindi voices if Hindi is selected
      const sortedVoices = [...availableVoices].sort((a, b) => {
        const isHindiA = a.lang.startsWith('hi') || a.name.toLowerCase().includes('hindi') || a.name.includes('Lekha') || a.name.includes('Neel') || a.name.includes('Kavya') || a.name.includes('Hemant');
        const isHindiB = b.lang.startsWith('hi') || b.name.toLowerCase().includes('hindi') || b.name.includes('Lekha') || b.name.includes('Neel') || b.name.includes('Kavya') || b.name.includes('Hemant');

        const isIndiaEnA = a.lang.includes('IN') || a.name.includes('India');
        const isIndiaEnB = b.lang.includes('IN') || b.name.includes('India');

        if (isHindiTarget) {
          if (isHindiA && !isHindiB) return -1;
          if (!isHindiA && isHindiB) return 1;
          if (isIndiaEnA && !isIndiaEnB) return -1;
          if (!isIndiaEnA && isIndiaEnB) return 1;
        } else {
          const aIsEn = a.lang.startsWith('en');
          const bIsEn = b.lang.startsWith('en');
          if (aIsEn && !bIsEn) return -1;
          if (!aIsEn && bIsEn) return 1;
        }

        return a.name.localeCompare(b.name);
      });

      let selectedIndex = 0;
      let foundMatchingVoice = false;

      sortedVoices.forEach((voice, i) => {
        const option = document.createElement('option');
        option.value = voice.voiceURI;

        const isHi = voice.lang.startsWith('hi') || voice.name.toLowerCase().includes('hindi') || voice.name.includes('Lekha') || voice.name.includes('Neel');
        const tag = isHi ? ' 🇮🇳 [Hindi]' : (voice.lang.includes('IN') ? ' 🇮🇳 [Indian English]' : '');

        option.textContent = `${voice.name} (${voice.lang})${tag}${voice.default ? ' [Default]' : ''}`;

        if (state.voiceUri && voice.voiceURI === state.voiceUri) {
          selectedIndex = i;
          foundMatchingVoice = true;
        } else if (!foundMatchingVoice && isHindiTarget && isHi) {
          selectedIndex = i;
          foundMatchingVoice = true;
        } else if (!foundMatchingVoice && !isHindiTarget && (voice.name.includes('Google') || voice.name.includes('Natural') || voice.name.includes('Samantha'))) {
          selectedIndex = i;
        }

        voiceSelect.appendChild(option);
      });

      if (voiceSelect.options.length > 0) {
        voiceSelect.selectedIndex = selectedIndex;
        state.voiceUri = voiceSelect.value;
      }
    }

    populateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = populateVoices;
    }
  }

  function speakText(text) {
    if (!synth || !state.voiceOutputEnabled || !text) {
      if (state.autoLoop && state.status !== 'listening') {
        setTimeout(startContinuousListening, 600);
      }
      return;
    }

    synth.cancel();

    // Clean text for speech synthesis
    const cleanText = text
      .replace(/[*_~`#]/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/https?:\/\/\S+/g, 'link')
      .trim();

    if (!cleanText) return;

    currentUtterance = new SpeechSynthesisUtterance(cleanText);
    currentUtterance.rate = state.rate;
    currentUtterance.pitch = state.pitch;

    // Pick selected voice or first Hindi voice if Hindi is targeted
    const isHindiTarget = state.lang === 'hi-IN' || state.lang === 'hinglish';
    let matchedVoice = availableVoices.find(v => v.voiceURI === state.voiceUri);

    if (!matchedVoice && isHindiTarget) {
      matchedVoice = availableVoices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi') || v.name.includes('Lekha') || v.name.includes('Neel'));
    }

    if (matchedVoice) {
      currentUtterance.voice = matchedVoice;
      currentUtterance.lang = matchedVoice.lang || 'hi-IN';
    } else {
      currentUtterance.lang = isHindiTarget ? 'hi-IN' : 'en-US';
    }

    currentUtterance.onstart = () => {
      state.isSpeaking = true;
      updateStatus('speaking', getStatusLabel('speaking'));
      stopSpeakingBtn.classList.remove('hidden');
      speakerTag.textContent = 'Rajat AI';
      speakerTag.style.color = '#60a5fa';
      targetAudioLevel = 0.85;
    };

    currentUtterance.onboundary = () => {
      targetAudioLevel = 0.5 + Math.random() * 0.5;
    };

    currentUtterance.onend = () => {
      state.isSpeaking = false;
      targetAudioLevel = 0.1;
      stopSpeakingBtn.classList.add('hidden');
      updateStatus('idle', getStatusLabel('idle'));

      if (state.autoLoop) {
        setTimeout(startContinuousListening, 500);
      }
    };

    currentUtterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      state.isSpeaking = false;
      targetAudioLevel = 0.1;
      stopSpeakingBtn.classList.add('hidden');
      updateStatus('idle', getStatusLabel('idle'));
    };

    synth.speak(currentUtterance);
  }

  function stopSpeaking() {
    if (synth) {
      synth.cancel();
    }
    state.isSpeaking = false;
    stopSpeakingBtn.classList.add('hidden');
    updateStatus('idle', getStatusLabel('idle'));
    targetAudioLevel = 0.1;
  }

  function startContinuousListening() {
    if (state.autoLoop && !state.isListening && !state.isSpeaking && recognition) {
      try {
        recognition.lang = (state.lang === 'hinglish') ? 'hi-IN' : (state.lang || 'hi-IN');
        recognition.start();
      } catch (e) {
        console.log('Continuous mic resume ignored:', e);
      }
    }
  }

  // ==========================================
  // AI CONVERSATION & GEMINI ENGINE
  // ==========================================
  async function processUserQuery(promptText) {
    if (!promptText || promptText.trim().length === 0) return;

    appendMessage('user', promptText);
    liveTranscript.textContent = `"${promptText}"`;
    speakerTag.textContent = (state.lang === 'hi-IN' || state.lang === 'hinglish') ? 'आप' : 'You';
    speakerTag.style.color = '#f87171';

    updateStatus('thinking', getStatusLabel('thinking'));
    typingIndicator.classList.remove('hidden');
    targetAudioLevel = 0.4;

    try {
      let responseText = '';
      if (state.apiKey) {
        responseText = await callGeminiAPI(promptText);
      } else {
        responseText = await callSmartFallbackAI(promptText);
      }

      typingIndicator.classList.add('hidden');
      appendMessage('agent', responseText);
      liveTranscript.textContent = `"${responseText}"`;
      speakerTag.textContent = 'Rajat AI';
      speakerTag.style.color = '#60a5fa';

      playChime('agent');
      speakText(responseText);

    } catch (err) {
      typingIndicator.classList.add('hidden');
      const errMessage = (state.lang === 'hi-IN' || state.lang === 'hinglish')
        ? "माफ़ कीजिए, उत्तर प्राप्त करने में समस्या हुई। कृपया अपनी API Key या नेटवर्क कनेक्शन जांचें।"
        : "I ran into an issue getting that answer. Please check your API key or network connection.";
      appendMessage('agent', errMessage);
      liveTranscript.textContent = `"${errMessage}"`;
      showToast(err.message || 'Error communicating with AI', 'error');
      updateStatus('idle', getStatusLabel('idle'));
    }
  }

  // Direct Google Gemini API Call with Hindi System Prompt
  async function callGeminiAPI(prompt) {
    const model = state.model || 'gemini-1.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${state.apiKey}`;

    let promptKey = `${state.persona}_${state.lang === 'hi-IN' ? 'hi' : (state.lang === 'hinglish' ? 'hinglish' : 'en')}`;
    let systemInstruction = PERSONA_PROMPTS[promptKey] || PERSONA_PROMPTS.gemini_hi;

    systemInstruction += `\n\n[CORE WEBSITE KNOWLEDGE & SPECIFICATION]:\n${DEFAULT_WEBSITE_KNOWLEDGE}`;

    if (state.knowledgeBase) {
      systemInstruction += `\n\n[OFFICIAL AGENT KNOWLEDGE BASE & FACTS]:\n${state.knowledgeBase}\n(Instruction: Always use this custom knowledge base as the primary source of truth when answering questions)`;
    }

    const contents = [];
    state.history.slice(-8).forEach(msg => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    });

    if (contents.length === 0 || contents[contents.length - 1].parts[0].text !== prompt) {
      contents.push({
        role: 'user',
        parts: [{ text: prompt }]
      });
    }

    const payload = {
      contents: contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 250
      }
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const msg = errorData.error?.message || `API error: ${res.statusText}`;
      throw new Error(msg);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) {
      throw new Error('No response returned by Gemini API.');
    }
    return candidate.trim();
  }

  // Built-in Smart Conversational Agent in Fluent Hindi & Hinglish
  async function callSmartFallbackAI(prompt) {
    await new Promise(r => setTimeout(r, 600));

    const p = prompt.toLowerCase().trim();
    const isHindi = state.lang === 'hi-IN' || state.lang === 'hinglish';

    // How are you / कैसे हो
    if (p.includes('how are you') || p.includes('how r u') || p.includes('kaise ho') || p.includes('kese ho') || p.includes('हाल') || p.includes('कैसे हो') || p.includes('क्या हाल')) {
      if (isHindi) {
        const replies = [
          "नमस्ते! मैं बहुत बढ़िया हूँ और आपकी मदद के लिए पूरी तरह तैयार हूँ। आप बताइए, आपका दिन कैसा बीत रहा है?",
          "मैं बिल्कुल ठीक और ऊर्जा से भरपूर हूँ! आज हम किस बारे में बात करने वाले हैं?",
          "सब कुछ बहुत शानदार है! आपसे बात करके हमेशा बहुत अच्छा लगता है। बताइए, मैं क्या सेवा करूँ?"
        ];
        return replies[Math.floor(Math.random() * replies.length)];
      } else {
        return "I'm doing fantastic, thank you! Ready to chat, explore ideas, or answer any questions you have today.";
      }
    }

    // Greetings / नमस्ते / हेलो
    if (p.startsWith('hi') || p.startsWith('hello') || p.startsWith('hey') || p.includes('नमस्ते') || p.includes('प्रणाम') || p.includes('राम राम') || p.includes('namaste') || p.includes('salam')) {
      if (isHindi) {
        const greetings = [
          "नमस्ते! आपका बहुत-बहुत स्वागत है। आज आप क्या जानना चाहते हैं?",
          "नमस्कार! मैं Rajat AI हूँ। बताइए, आज मैं आपकी क्या सहायता कर सकता हूँ?",
          "हेलो दोस्त! मैं आपकी आवाज़ सुनने के लिए तैयार हूँ। कोई भी प्रश्न पूछिए!"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
      } else {
        return "Hello! Great to hear from you. What's on your mind today?";
      }
    }

    // Website Overview & About Website
    if (p.includes('website') || p.includes('वेबसाइट') || p.includes('इस ऐप') || p.includes('this app') || p.includes('about this') || p.includes('के बारे में बताओ')) {
      if (isHindi) {
        return "यह 'Rajat AI Live 2.0' है — एक आधुनिक Speak-to-Speak AI वॉइस वेब एप्लिकेशन जिसे Rajat ने बनाया है। इसमें आप हिन्दी, Hinglish और English में सीधे बोलकर बातें कर सकते हैं, लाइव 3D वॉइस ऑर्ब देख सकते हैं, और ऑटो-लूप से हैंड्स-फ्री चैट कर सकते हैं!";
      } else {
        return "This is Rajat AI Live 2.0 — a modern Speak-to-Speak conversational voice web application created by Rajat. It features real-time voice interaction in Hindi, Hinglish, and English, a dynamic 3D audio-reactive orb, and hands-free Auto Loop conversation!";
      }
    }

    // Who created you / Creator Rajat
    if (p.includes('who created') || p.includes('who made') || p.includes('creator') || p.includes('developer') || p.includes('rajat') || p.includes('किसने बनाया') || p.includes('रजत कौन')) {
      if (isHindi) {
        return "मुझे Rajat ने बनाया और डेवलप किया है! Rajat एक प्रतिभाशाली AI डेवलपर और इंजीनियर हैं जिन्होंने इस Speak-to-Speak वॉइस AI प्लेटफॉर्म को डिज़ाइन किया है।";
      } else {
        return "I was created and developed by Rajat, a talented AI developer and engineer who built this Speak-to-Speak AI conversational platform!";
      }
    }

    // How to use / कैसे चलाएं
    if (p.includes('how to use') || p.includes('kaise use') || p.includes('kaise chalaye') || p.includes('how it works') || p.includes('कैसे चलाएं') || p.includes('कैसे इस्तेमाल')) {
      if (isHindi) {
        return "इसे इस्तेमाल करना बहुत आसान है! 1) नीचे बीच वाले माइक बटन पर क्लिक करके बोलें। 2) ऑटो-लूप (🔁) ऑन करके हैंड्स-फ्री बातें करें। 3) ऊपर से भाषा और 'Chat View' टॉगल करें। 4) सेटिंग्स (⚙️) में जाकर Gemini API Key और अपनी कस्टम नॉलेज जोड़ सकते हैं!";
      } else {
        return "Using Rajat AI is super easy! 1) Click the central microphone button and speak. 2) Toggle the Auto Loop button (🔁) for continuous hands-free voice dialogue. 3) Switch between Voice and Chat views at the top. 4) Open Settings (⚙️) to customize voices, add Gemini API keys, or add custom knowledge!";
      }
    }

    // Auto loop feature / ऑटो लूप
    if (p.includes('auto loop') || p.includes('loop') || p.includes('handsfree') || p.includes('hands free') || p.includes('ऑटो लूप')) {
      if (isHindi) {
        return "ऑटो लूप (Auto Loop) एक हैंड्स-फ्री फीचर है! इसे ऑन करने पर जैसे ही Rajat AI बोलना समाप्त करेगा, माइक अपने आप दोबारा चालू हो जाएगा ताकि आप बिना बार-बार बटन दबाए लगातार बातचीत कर सकें।";
      } else {
        return "Auto Loop is a hands-free conversation feature! When enabled, the microphone automatically turns back on right after Rajat AI finishes speaking, so you can have seamless ongoing conversations without clicking.";
      }
    }

    // Features / फीचर्स
    if (p.includes('feature') || p.includes('features') || p.includes('विशेषताएं') || p.includes('खासियत') || p.includes('modes')) {
      if (isHindi) {
        return "Rajat AI की प्रमुख विशेषताएं हैं: 1) रियल-टाइम Speak-to-Speak बातचीत, 2) 3D ऑडियो-रिएक्टिव वॉइस ऑर्ब, 3) हिन्दी, Hinglish और English वॉइस सपोर्ट, 4) हैंड्स-फ्री ऑटो-लूप, 5) 4 अलग-अलग AI पर्सनैलिटी और 6) कस्टम नॉलेज बेस!";
      } else {
        return "Top features of Rajat AI include: 1) Real-time Speak-to-Speak voice conversation, 2) 3D audio-reactive canvas orb, 3) Full Hindi, Hinglish, and English voice synthesis, 4) Hands-free Auto Loop, 5) 4 AI personalities, and 6) Custom Knowledge Base support!";
      }
    }

    // Settings / Custom Knowledge / API Key
    if (p.includes('setting') || p.includes('api key') || p.includes('knowledge base') || p.includes('speed') || p.includes('pitch') || p.includes('सेटिंग') || p.includes('नॉलेज')) {
      if (isHindi) {
        return "आप ऊपर दाईं ओर ⚙️ सेटिंग्स बटन पर क्लिक करके अपनी Google Gemini API Key जोड़ सकते हैं, आवाज़ की स्पीड व पिच बदल सकते हैं, और 'Agent Knowledge Base' में अपनी कोई भी जानकारी सेव कर सकते हैं!";
      } else {
        return "Click the ⚙️ Settings icon in the top right to configure your Google Gemini API Key, adjust voice speed and pitch, choose AI personalities, and paste custom documentation into the Knowledge Base!";
      }
    }

    // Custom Knowledge Base match (if user has custom knowledge saved)
    if (state.knowledgeBase && state.knowledgeBase.length > 5) {
      const words = p.split(/\s+/).filter(w => w.length > 3);
      for (const word of words) {
        if (state.knowledgeBase.toLowerCase().includes(word)) {
          const sentences = state.knowledgeBase.split(/[.\n]/).filter(s => s.toLowerCase().includes(word));
          if (sentences.length > 0) {
            return sentences[0].trim();
          }
        }
      }
    }

    // What can you do / क्या कर सकते हो
    if (p.includes('what can you do') || p.includes('help') || p.includes('कर सकते') || p.includes('kya kar sakte')) {
      if (isHindi) {
        return "आप मुझसे सीधे माइक से बोलकर बातें कर सकते हैं! मैं आपके सवालों के जवाब दे सकता हूँ, कहानियाँ और चुटकुले सुना सकता हूँ, कठिन विषयों को समझा सकता हूँ और हर विषय पर अच्छी सलाह दे सकता हूँ।";
      } else {
        return "You can talk to me directly using your microphone or type in text! I can answer questions, explain concepts, give advice, tell stories, or just keep you company with natural voice conversation.";
      }
    }

    // Facts / अंतरिक्ष का तथ्य
    if (p.includes('fact') || p.includes('space') || p.includes('universe') || p.includes('तथ्य') || p.includes('अंतरिक्ष') || p.includes('रोचक')) {
      if (isHindi) {
        const facts = [
          "क्या आप जानते हैं? शुक्र (Venus) ग्रह पर एक दिन उसके एक पूरे साल से भी लंबा होता है, क्योंकि इसे अपनी धुरी पर घूमने में 243 पृथ्वी दिवस लगते हैं!",
          "एक बहुत ही रोचक तथ्य: न्यूट्रॉन तारा (Neutron Star) इतना घना होता है कि उसकी एक चम्मच सामग्री का वजन पृथ्वी पर लगभग 6 अरब टन होगा!",
          "सूर्य इतना विशाल है कि इसके अंदर लगभग 13 लाख पृथ्वियाँ आसानी से समा सकती हैं!"
        ];
        return facts[Math.floor(Math.random() * facts.length)];
      } else {
        return "Did you know? A day on Venus is longer than a year on Venus! It takes 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun.";
      }
    }

    // Jokes / चुटकुला
    if (p.includes('joke') || p.includes('funny') || p.includes('चुटकुला') || p.includes('हंसाओ') || p.includes('chutkula')) {
      if (isHindi) {
        const jokes = [
          "अध्यापक ने छात्र से पूछा: बताओ अगर 10 सेब में से 4 खा लिए तो क्या बचेगा? छात्र बोला: सर, 6 सेब के छिलके और 4 गुठलियां!",
          "डॉक्टर: आपको चश्मा लगाने की सख्त जरूरत है। मरीज: आपको कैसे पता चला डॉक्टर साहब? डॉक्टर: क्योंकि आप दरवाजे की जगह खिड़की से अंदर आए हैं!",
          "सोनू: भाई, मुझे नींद में चलने की बीमारी है। मोनू: तो रात को ताला लगा के सोया कर! सोनू: अरे ताला तो लगाता हूँ, पर चाबी जेब में डाल के निकल जाता हूँ!"
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
      } else {
        return "Why do programmers prefer dark mode? Because light attracts bugs!";
      }
    }

    // Shayari / Poetry / शायरी
    if (p.includes('shayari') || p.includes('शायरी') || p.includes('कविता') || p.includes('poem')) {
      if (isHindi) {
        return "सपनों की मंज़िल पास नहीं होती, ज़िंदगी हर पल उदास नहीं होती। खुद पर भरोसा रखना मेरे दोस्त, कभी-कभी वो भी मिल जाता है जिसकी कभी आस नहीं होती!";
      }
    }

    // Thank you / धन्यवाद
    if (p.includes('thank') || p.includes('thanks') || p.includes('धन्यवाद') || p.includes('शुक्रिया') || p.includes('shukriya') || p.includes('dhanyawad')) {
      if (isHindi) {
        return "आपका बहुत-बहुत स्वागत है! अगर आपको और कुछ भी पूछना हो, तो बेझिझक पूछिए।";
      } else {
        return "You're very welcome! I'm always right here if you need anything else.";
      }
    }

    // Goodbye / अलविदा
    if (p.includes('bye') || p.includes('goodbye') || p.includes('अलविदा') || p.includes('फिर मिलेंगे')) {
      if (isHindi) {
        return "अलविदा! आपका दिन बहुत शुभ और मंगलमय हो। जब भी मन करे, फिर बात करने आ जाइएगा!";
      } else {
        return "Goodbye for now! Have a wonderful rest of your day, and feel free to talk to me anytime you like.";
      }
    }

    // Default Fallback
    if (isHindi) {
      return `आपका प्रश्न "${prompt}" बहुत ही बढ़िया है। Google Gemini API Key को सेटिंग्स (ऊपर दाईं ओर गियर आइकन) में जोड़कर आप असीमित और गहराई से पूर्ण हिन्दी उत्तर प्राप्त कर सकते हैं!`;
    } else {
      return `That's an interesting question about "${prompt}". You can add your Google Gemini API Key in Settings (top right gear icon) to unlock unlimited live reasoning!`;
    }
  }

  // ==========================================
  // CHAT VIEW & UI HELPERS
  // ==========================================
  function appendMessage(role, text) {
    state.history.push({ role, text, time: new Date() });

    const group = document.createElement('div');
    group.className = `message-group ${role === 'user' ? 'user-group' : 'agent-group'}`;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isHi = state.lang === 'hi-IN' || state.lang === 'hinglish';
    const userLabel = isHi ? 'आप' : 'You';

    group.innerHTML = `
      <div class="avatar ${role === 'user' ? 'user-avatar' : 'agent-avatar'}">
        <i class="fa-solid ${role === 'user' ? 'fa-user' : 'fa-sparkles'}"></i>
      </div>
      <div class="message-body">
        <div class="message-header">
          <span class="sender-name">${role === 'user' ? userLabel : 'Rajat AI'}</span>
          <span class="message-time">${timeStr}</span>
        </div>
        <div class="message-content">${escapeHTML(text)}</div>
        <div class="message-actions">
          <button class="msg-btn speak-msg-btn" title="Speak this response"><i class="fa-solid fa-volume-high"></i></button>
          <button class="msg-btn copy-msg-btn" title="Copy text"><i class="fa-regular fa-copy"></i></button>
        </div>
      </div>
    `;

    const speakBtn = group.querySelector('.speak-msg-btn');
    speakBtn.addEventListener('click', () => speakText(text));

    const copyBtn = group.querySelector('.copy-msg-btn');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(text);
      showToast((state.lang === 'hi-IN' || state.lang === 'hinglish') ? 'कॉपी हो गया!' : 'Copied to clipboard!', 'info');
    });

    chatMessages.appendChild(group);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function updateStatus(statusKey, label) {
    state.status = statusKey;
    statusText.textContent = label || getStatusLabel(statusKey);

    statusBadge.className = 'status-badge';
    statusBadge.classList.add(`state-${statusKey}`);

    if (statusKey === 'listening') {
      orbCenterPulse.style.boxShadow = '0 0 45px rgba(239, 68, 68, 0.7)';
      orbCenterPulse.innerHTML = '<i class="fa-solid fa-microphone-lines"></i>';
    } else if (statusKey === 'thinking') {
      orbCenterPulse.style.boxShadow = '0 0 45px rgba(245, 158, 11, 0.7)';
      orbCenterPulse.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    } else if (statusKey === 'speaking') {
      orbCenterPulse.style.boxShadow = '0 0 45px rgba(66, 133, 244, 0.7)';
      orbCenterPulse.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    } else {
      orbCenterPulse.style.boxShadow = '0 0 30px rgba(66, 133, 244, 0.3)';
      orbCenterPulse.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i>';
    }
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHTML(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ==========================================
  // GEMINI LIVE ORB CANVAS VISUALIZER
  // ==========================================
  function initVisualizer() {
    canvasCtx = visualizerCanvas.getContext('2d');
    renderVisualizer();
  }

  function renderVisualizer() {
    animFrameId = requestAnimationFrame(renderVisualizer);

    audioLevel += (targetAudioLevel - audioLevel) * 0.12;

    const width = visualizerCanvas.width;
    const height = visualizerCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    canvasCtx.clearRect(0, 0, width, height);
    orbPhase += 0.025;

    const baseRadius = 140 + audioLevel * 30;
    const gradient = canvasCtx.createRadialGradient(
      centerX, centerY, baseRadius * 0.2,
      centerX, centerY, baseRadius * 1.6
    );

    if (state.status === 'listening') {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
      gradient.addColorStop(0.5, 'rgba(244, 63, 94, 0.3)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
    } else if (state.status === 'thinking') {
      gradient.addColorStop(0, 'rgba(245, 158, 11, 0.6)');
      gradient.addColorStop(0.5, 'rgba(155, 81, 224, 0.3)');
      gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
    } else if (state.status === 'speaking') {
      gradient.addColorStop(0, 'rgba(66, 133, 244, 0.7)');
      gradient.addColorStop(0.5, 'rgba(155, 81, 224, 0.4)');
      gradient.addColorStop(1, 'rgba(236, 64, 122, 0)');
    } else {
      gradient.addColorStop(0, 'rgba(66, 133, 244, 0.4)');
      gradient.addColorStop(0.5, 'rgba(155, 81, 224, 0.2)');
      gradient.addColorStop(1, 'rgba(66, 133, 244, 0)');
    }

    canvasCtx.fillStyle = gradient;
    canvasCtx.beginPath();
    canvasCtx.arc(centerX, centerY, baseRadius * 1.6, 0, Math.PI * 2);
    canvasCtx.fill();

    const layers = [
      { color: 'rgba(66, 133, 244, 0.7)', speed: 1.0, count: 6, offset: 0 },
      { color: 'rgba(155, 81, 224, 0.65)', speed: 1.4, count: 7, offset: Math.PI / 3 },
      { color: 'rgba(236, 64, 122, 0.55)', speed: 0.8, count: 5, offset: Math.PI / 2 }
    ];

    layers.forEach(layer => {
      canvasCtx.beginPath();
      const points = 36;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const wobble = Math.sin(angle * layer.count + orbPhase * layer.speed + layer.offset) * (12 + audioLevel * 35);
        const r = baseRadius + wobble;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
      }
      canvasCtx.closePath();
      canvasCtx.fillStyle = layer.color;
      canvasCtx.fill();
    });

    canvasCtx.beginPath();
    const ringPoints = 60;
    for (let i = 0; i <= ringPoints; i++) {
      const angle = (i / ringPoints) * Math.PI * 2;
      const wave = Math.sin(angle * 12 + orbPhase * 3) * (audioLevel * 18);
      const r = baseRadius * 1.25 + wave;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;

      if (i === 0) canvasCtx.moveTo(x, y);
      else canvasCtx.lineTo(x, y);
    }
    canvasCtx.closePath();
    canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    canvasCtx.lineWidth = 2;
    canvasCtx.stroke();
  }

  // ==========================================
  // EVENT BINDINGS
  // ==========================================
  function bindEvents() {
    micBtn.addEventListener('click', toggleListening);
    stopSpeakingBtn.addEventListener('click', stopSpeaking);

    // Quick Language Select
    if (quickLangSelect) {
      quickLangSelect.addEventListener('change', (e) => {
        setLanguage(e.target.value);
      });
    }

    speakerToggleBtn.addEventListener('click', () => {
      state.voiceOutputEnabled = !state.voiceOutputEnabled;
      speakerToggleBtn.classList.toggle('active', state.voiceOutputEnabled);
      const speakerIcon = document.getElementById('speakerIcon');
      speakerIcon.className = state.voiceOutputEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
      showToast(state.voiceOutputEnabled ? 'आवाज चालू है (Voice ON)' : 'आवाज बंद है (Voice Muted)', 'info');
      if (!state.voiceOutputEnabled && state.isSpeaking) {
        stopSpeaking();
      }
    });

    autoLoopBtn.addEventListener('click', () => {
      state.autoLoop = !state.autoLoop;
      localStorage.setItem(STORAGE_KEYS.AUTO_LOOP, state.autoLoop);
      autoLoopBtn.classList.toggle('active', state.autoLoop);
      showToast(state.autoLoop ? 'Hands-free auto loop ON' : 'Hands-free auto loop OFF', 'info');
    });

    viewToggleBtn.addEventListener('click', () => {
      if (state.currentView === 'voice') {
        state.currentView = 'chat';
        voiceView.classList.remove('active');
        chatView.classList.add('active');
        viewToggleLabel.textContent = 'Voice View';
        viewToggleBtn.querySelector('i').className = 'fa-solid fa-microphone-lines';
      } else {
        state.currentView = 'voice';
        chatView.classList.remove('active');
        voiceView.classList.add('active');
        viewToggleLabel.textContent = 'Chat View';
        viewToggleBtn.querySelector('i').className = 'fa-solid fa-comments';
      }
    });

    clearChatBtn.addEventListener('click', () => {
      chatMessages.innerHTML = '';
      state.history = [];
      const msg = (state.lang === 'hi-IN' || state.lang === 'hinglish') ? 'बातचीत साफ़ कर दी गई है! बताइए, मैं आपकी क्या मदद करूँ?' : 'Chat cleared! How can I assist you today?';
      appendMessage('agent', msg);
      liveTranscript.textContent = (state.lang === 'hi-IN' || state.lang === 'hinglish') ? '"नमस्ते! मैं तैयार हूँ।"' : '"Ready when you are!"';
      showToast('Conversation cleared', 'info');
    });

    sendTextBtn.addEventListener('click', () => {
      const val = textPromptInput.value.trim();
      if (val) {
        processUserQuery(val);
        textPromptInput.value = '';
      }
    });

    textPromptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = textPromptInput.value.trim();
        if (val) {
          processUserQuery(val);
          textPromptInput.value = '';
        }
      }
    });

    suggestionChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (chip) {
        const prompt = chip.dataset.prompt;
        processUserQuery(prompt);
      }
    });

    if (apiKeyStatusBtn) {
      apiKeyStatusBtn.addEventListener('click', () => {
        initSettingsForm();
        settingsModal.classList.add('open');
        apiKeyInput.focus();
      });
    }

    if (testApiKeyBtn) {
      testApiKeyBtn.addEventListener('click', async () => {
        const keyToTest = apiKeyInput.value.trim();
        const modelToTest = modelSelect.value || 'gemini-2.0-flash';

        if (!keyToTest) {
          apiKeyTestResult.className = 'api-test-result error';
          apiKeyTestResult.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Paste API key first!';
          return;
        }

        apiKeyTestResult.className = 'api-test-result loading';
        apiKeyTestResult.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Testing connection...';
        testApiKeyBtn.disabled = true;

        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelToTest}:generateContent?key=${keyToTest}`;
          const payload = {
            contents: [{ role: 'user', parts: [{ text: 'Respond with OK' }] }],
            generationConfig: { maxOutputTokens: 10 }
          };

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.error?.message || `Status ${res.status}`;
            throw new Error(errMsg);
          }

          const data = await res.json();
          if (data.candidates && data.candidates.length > 0) {
            apiKeyTestResult.className = 'api-test-result success';
            apiKeyTestResult.innerHTML = '<i class="fa-solid fa-circle-check"></i> Connected to Gemini!';
            showToast('Google Gemini API connected successfully! 🚀', 'success');
          } else {
            throw new Error('No candidate response returned');
          }
        } catch (err) {
          apiKeyTestResult.className = 'api-test-result error';
          const msg = err.message.includes('API_KEY_INVALID') ? 'Invalid API Key' :
                      err.message.includes('quota') ? 'Quota Exceeded' :
                      (err.message.length > 35 ? err.message.substring(0, 35) + '...' : err.message);
          apiKeyTestResult.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> ${msg}`;
          showToast(`Connection failed: ${err.message}`, 'error');
        } finally {
          testApiKeyBtn.disabled = false;
        }
      });
    }

    settingsBtn.addEventListener('click', () => {
      initSettingsForm();
      settingsModal.classList.add('open');
    });

    closeSettingsBtn.addEventListener('click', () => {
      settingsModal.classList.remove('open');
    });

    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) settingsModal.classList.remove('open');
    });

    toggleApiKeyVis.addEventListener('click', () => {
      const isPass = apiKeyInput.type === 'password';
      apiKeyInput.type = isPass ? 'text' : 'password';
      toggleApiKeyVis.querySelector('i').className = isPass ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
    });

    rateSlider.addEventListener('input', () => {
      rateVal.textContent = parseFloat(rateSlider.value).toFixed(2) + 'x';
    });
    pitchSlider.addEventListener('input', () => {
      pitchVal.textContent = parseFloat(pitchSlider.value).toFixed(2);
    });

    testVoiceBtn.addEventListener('click', () => {
      const originalRate = state.rate;
      const originalPitch = state.pitch;
      const originalVoice = state.voiceUri;

      state.rate = parseFloat(rateSlider.value);
      state.pitch = parseFloat(pitchSlider.value);
      state.voiceUri = voiceSelect.value;

      const testMsg = (state.lang === 'hi-IN' || state.lang === 'hinglish')
        ? "नमस्ते! यह मेरी आवाज़ का नमूना है। मैं हिन्दी में बात करने के लिए तैयार हूँ!"
        : "Hello! This is a preview of my voice synthesis. How do I sound?";

      speakText(testMsg);

      state.rate = originalRate;
      state.pitch = originalPitch;
      state.voiceUri = originalVoice;
    });

    saveSettingsBtn.addEventListener('click', saveSettings);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
