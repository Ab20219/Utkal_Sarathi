import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AudioGuideStory } from '../types';
import {
  getMonumentVoiceProfile,
  MonumentVoiceProfile,
} from '../data/monumentVoiceProfiles';
import { answerMonumentQuestionMultilingual } from '../utils/utkalKathaVoiceEngine';
import { unifiedVoicePipeline } from '../services/unifiedVoicePipeline';
import { fetchApi } from '../utils/apiConfig';
import { useGeminiLiveVoice } from '../hooks/useGeminiLiveVoice';
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  RotateCcw,
  Headphones,
  Radio,
  PhoneCall,
  PhoneOff,
} from 'lucide-react';

interface UtkalKathaVoiceAssistantProps {
  selectedStory: AudioGuideStory;
  selectedLang: 'en' | 'or' | 'hi';
  onLanguageChange: (lang: 'en' | 'or' | 'hi') => void;
  onOpenGlobalAssistant?: (prompt: string) => void;
}

interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
  isPlayingVoice?: boolean;
  isLive?: boolean;
}

function getSupportedRecorderMimeType(): string {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return '';
  }
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
    'audio/ogg;codecs=opus',
    'audio/3gpp',
  ];
  return candidates.find((c) => MediaRecorder.isTypeSupported(c)) || '';
}

export const UtkalKathaVoiceAssistant: React.FC<UtkalKathaVoiceAssistantProps> = ({
  selectedStory,
  selectedLang,
  onLanguageChange,
}) => {
  const voiceProfile: MonumentVoiceProfile = useMemo(() => {
    return getMonumentVoiceProfile(selectedStory.id);
  }, [selectedStory.id]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSec, setRecordingSec] = useState<number>(0);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState<string | null>(null);
  const [voiceNotice, setVoiceNotice] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsAbortRef = useRef<AbortController | null>(null);

  const initialGreeting = useMemo(() => {
    switch (selectedLang) {
      case 'or':
        return `${voiceProfile.culturalGreeting.or} ଆପଣ ${voiceProfile.placeName.or}ର ପ୍ରାଚୀନ ଇତିହାସ, ଶିଳାଲେଖ, ବାସ୍ତୁକଳା କିମ୍ବା ଧର୍ମପୀଠର ପୌରାଣିକ କଥା ବିଷୟରେ ଓଡ଼ିଆରେ ପଚାରିପାରିବେ।`;
      case 'hi':
        return `${voiceProfile.culturalGreeting.hi} आप ${voiceProfile.placeName.hi} के शिलालेखों, वास्तुकला, राजवंशों के इतिहास या पवित्र लोक-कथाओं के बारे में हिन्दी में पूछ सकते हैं।`;
      case 'en':
      default:
        return `${voiceProfile.culturalGreeting.en} Ask me anything about the architectural marvels, documented epigraphs, royal dynasties, or living folklore of ${voiceProfile.placeName.en}.`;
    }
  }, [selectedLang, voiceProfile]);

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: initialGreeting,
      timestamp: 'Just now',
      source: 'Archaeological Survey of India & Utkal Historical Chronicles',
    },
  ]);

  const liveVoice = useGeminiLiveVoice({
    lang: selectedLang,
    persona: selectedStory.id,
    greetOnConnect: true,
    onTurnCompleted: (userTranscript, assistantTranscript) => {
      const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => {
        const next = [...prev];
        if (userTranscript) {
          next.push({
            id: `live-u-${Date.now()}`,
            sender: 'user',
            text: userTranscript,
            timestamp: nowLabel,
          });
        }
        if (assistantTranscript) {
          next.push({
            id: `live-a-${Date.now() + 1}`,
            sender: 'assistant',
            text: assistantTranscript,
            source:
              selectedLang === 'or'
                ? `${voiceProfile.narratorName.or} • ଲାଇଭ୍ ଓଡ଼ିଆ ସ୍ୱର`
                : selectedLang === 'hi'
                ? `${voiceProfile.narratorName.hi} • लाइव हिन्दी संवाद`
                : `${voiceProfile.narratorName.en} • Live Voice`,
            timestamp: nowLabel,
            isLive: true,
          });
        }
        return next;
      });
    },
  });

  const stopMediaRecordingCleanly = () => {
    if (recordTimerRef.current) {
      window.clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    setRecordingSec(0);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    mediaRecorderRef.current = null;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  };

  useEffect(() => {
    setMessages([
      {
        id: `msg-welcome-${selectedStory.id}-${selectedLang}`,
        sender: 'assistant',
        text: initialGreeting,
        timestamp: 'Just now',
        source:
          selectedLang === 'or'
            ? 'ଭାରତୀୟ ପ୍ରତ୍ନତତ୍ତ୍ୱ ସର୍ବେକ୍ଷଣ ଓ ଉତ୍କଳ ଐତିହାସିକ ଅଭିଲେଖାଗାର'
            : selectedLang === 'hi'
            ? 'भारतीय पुरातत्व सर्वेक्षण एवं उत्कल ऐतिहासिक अभिलेखागार'
            : 'Archaeological Survey of India & Utkal Historical Chronicles',
      },
    ]);
    stopAssistantVoice();
    if (liveVoice.isLiveActive) {
      liveVoice.stopLiveSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStory.id, selectedLang, initialGreeting]);

  useEffect(() => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      stopAssistantVoice();
      stopMediaRecordingCleanly();
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.abort();
        } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup Browser SpeechRecognition as secondary helper
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang =
        selectedLang === 'or' ? 'or-IN' : selectedLang === 'hi' ? 'hi-IN' : 'en-IN';

      let latestFinal = '';
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        latestFinal = transcript;
        setInputQuery(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (latestFinal.trim()) {
          const captured = latestFinal.trim();
          latestFinal = '';
          void handleSendQuery(captured, true);
        }
      };

      recognition.onerror = (ev: any) => {
        setIsRecording(false);
        if (ev?.error === 'not-allowed') {
          setVoiceNotice(
            selectedLang === 'or'
              ? 'ମାଇକ୍ରୋଫୋନ୍ ଅନୁମତି ମିଳିଲା ନାହିଁ। ଦୟାକରି ଟାଇପ୍ କରି ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ।'
              : selectedLang === 'hi'
              ? 'माइक्रोफ़ोन अनुमति अस्वीकृत है। कृपया टाइप करके अपना प्रश्न पूछें।'
              : 'Microphone permission denied. Please enable mic access or type your question.'
          );
        }
      };

      speechRecognitionRef.current = recognition;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLang]);

  const toggleRecording = async () => {
    if (liveVoice.isLiveActive) {
      liveVoice.toggleMicMute();
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      if (recordTimerRef.current) {
        window.clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        return;
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
      }
      return;
    }

    stopAssistantVoice();

    // Prefer MediaRecorder + Gemini 3.5 Transcribe (/api/transcribe) for accurate Odia (ଓଡ଼ିଆ) & Hindi (हिन्दी)
    if (
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof MediaRecorder !== 'undefined'
    ) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        recordedChunksRef.current = [];
        const preferredMime = getSupportedRecorderMimeType();
        const recorder = preferredMime
          ? new MediaRecorder(stream, { mimeType: preferredMime })
          : new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) {
            recordedChunksRef.current.push(ev.data);
          }
        };

        recorder.onstop = async () => {
          if (recordTimerRef.current) {
            window.clearInterval(recordTimerRef.current);
            recordTimerRef.current = null;
          }
          setRecordingSec(0);
          const mimeType = recorder.mimeType || preferredMime || 'audio/webm';
          stream.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;

          const blob = new Blob(recordedChunksRef.current, { type: mimeType });
          if (blob.size < 250) {
            setVoiceNotice('');
            return;
          }

          setIsTranscribing(true);
          setVoiceNotice(
            selectedLang === 'or'
              ? 'ଓଡ଼ିଆ ସ୍ୱର ଲିପିବଦ୍ଧ ହେଉଛି...'
              : selectedLang === 'hi'
              ? 'हिन्दी आवाज़ लिखी जा रही है...'
              : 'Transcribing spoken question...'
          );

          try {
            const base64Audio = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(String(reader.result || ''));
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });

            const res = await fetchApi('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64Audio,
                mimeType,
                lang: selectedLang,
              }),
            });

            if (res.ok) {
              const data = await res.json();
              if (data.transcript) {
                setInputQuery(data.transcript);
                setVoiceNotice('');
                setIsTranscribing(false);
                void handleSendQuery(data.transcript, true);
                return;
              }
            }
            setVoiceNotice(
              selectedLang === 'or'
                ? 'ସ୍ୱର ସ୍ପଷ୍ଟ ହେଲା ନାହିଁ—ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ କିମ୍ବା ଟାଇପ୍ କରନ୍ତୁ।'
                : selectedLang === 'hi'
                ? 'आवाज़ स्पष्ट नहीं हो सकी—कृपया पुनः प्रयास करें या टाइप करें।'
                : 'Could not transcribe audio—please retry or type your question.'
            );
          } catch {
            setVoiceNotice(
              selectedLang === 'or'
                ? 'କ୍ଲାଉଡ୍ ସ୍ୱର ଚିହ୍ନଟ ଉପଲବ୍ଧ ନାହିଁ—ଦୟାକରି ତଳେ ଟାଇପ୍ କରନ୍ତୁ।'
                : selectedLang === 'hi'
                ? 'क्लाउड वॉइस पहचान उपलब्ध नहीं है—कृपया नीचे टाइप करें।'
                : 'Network unavailable for cloud speech recognition. Please type your question.'
            );
          } finally {
            setIsTranscribing(false);
          }
        };

        recorder.start(250);
        setIsRecording(true);
        setRecordingSec(0);
        recordTimerRef.current = window.setInterval(() => {
          setRecordingSec((s) => s + 1);
        }, 1000);
        setVoiceNotice(
          selectedLang === 'or'
            ? '🎙️ ଓଡ଼ିଆରେ କୁହନ୍ତୁ... ଶେଷ ହେଲେ ପୁଣି ମାଇକ୍ ଦବାନ୍ତୁ।'
            : selectedLang === 'hi'
            ? '🎙️ हिन्दी में बोलें... पूर्ण होने पर माइक बटन पुनः दबाएं।'
            : '🎙️ Speak your question now... tap Mic again to send.'
        );
        return;
      } catch {
        // Fall through to browser SpeechRecognition or permission notice
      }
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.lang =
          selectedLang === 'or' ? 'or-IN' : selectedLang === 'hi' ? 'hi-IN' : 'en-IN';
        speechRecognitionRef.current.start();
        setIsRecording(true);
        return;
      } catch {}
    }

    setVoiceNotice(
      selectedLang === 'or'
        ? 'ମାଇକ୍ରୋଫୋନ୍ ଉପଲବ୍ଧ ନାହିଁ। ଦୟାକରି ତଳେ ଓଡ଼ିଆ କିମ୍ବା ଇଂରାଜୀରେ ଟାଇପ୍ କରନ୍ତୁ।'
        : selectedLang === 'hi'
        ? 'माइक्रोफ़ोन उपलब्ध नहीं है। कृपया नीचे अपना प्रश्न टाइप करें।'
        : 'Voice input is unavailable or mic permission was blocked. Please type your question below.'
    );
  };

  const stopAssistantVoice = () => {
    unifiedVoicePipeline.stopAll();
    setActiveSpeakingMsgId(null);
  };

  // Play voice for a specific message with distinct monument voice persona & strict language integrity
  const handlePlayVoice = async (msgId: string, text: string) => {
    if (activeSpeakingMsgId === msgId) {
      stopAssistantVoice();
      setVoiceNotice('');
      return;
    }

    if (liveVoice.isLiveActive) {
      liveVoice.stopLiveSession();
    }

    stopAssistantVoice();
    setActiveSpeakingMsgId(msgId);
    const narratorDisplay = voiceProfile.narratorName[selectedLang] || voiceProfile.narratorName.en;
    setVoiceNotice(
      selectedLang === 'or'
        ? `${narratorDisplay} (${voiceProfile.geminiVoiceName}) ଓଡ଼ିଆରେ କହୁଛନ୍ତି...`
        : selectedLang === 'hi'
        ? `${narratorDisplay} (${voiceProfile.geminiVoiceName}) हिन्दी में बोल रहे हैं...`
        : `Speaking in ${narratorDisplay}'s distinct voice (${voiceProfile.geminiVoiceName})...`
    );

    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const result = await unifiedVoicePipeline.speak({
      text: cleanText,
      lang: selectedLang,
      persona: selectedStory.id,
      playbackSpeed: 1.0,
      allowPhoneticFallback: false,
      onStart: () => {
        setActiveSpeakingMsgId(msgId);
      },
      onEnded: () => {
        setActiveSpeakingMsgId(null);
        setVoiceNotice('');
      },
      onError: () => {
        setActiveSpeakingMsgId(null);
        setVoiceNotice('Voice playback unavailable—click Listen to retry.');
      },
    });

    if (!result.success) {
      setActiveSpeakingMsgId(null);
      if (result.notice) {
        setVoiceNotice(result.notice);
      } else {
        setVoiceNotice('Voice playback unavailable—click Listen to retry.');
      }
    }
  };

  const handleSendQuery = async (queryToSend?: string, forceSpeak = false) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || isLoading) return;

    if (liveVoice.isLiveActive) {
      setInputQuery('');
      liveVoice.sendLiveTextPrompt(text);
      return;
    }

    stopAssistantVoice();

    const userMessage: AssistantMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const langLabel = selectedLang === 'or' ? 'Odia' : selectedLang === 'hi' ? 'Hindi' : 'English';

      const res = await fetchApi('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language: langLabel,
          isUtkalKatha: true,
          runningStory: {
            id: selectedStory.id,
            monument: selectedStory.monument,
            location: selectedStory.location,
            district: selectedStory.district,
            period: selectedStory.period,
            narrator: selectedStory.narrator,
            narratorName: voiceProfile.narratorName[selectedLang] || voiceProfile.narratorName.en,
            voicePersonaTitle:
              voiceProfile.voicePersonaTitle[selectedLang] || voiceProfile.voicePersonaTitle.en,
            documentedHistory: selectedStory.documentedHistory,
            legendAndFolklore: selectedStory.legendAndFolklore,
            architecturalHighlights: selectedStory.architecturalHighlights,
            inscriptionsAndManuscripts: selectedStory.inscriptionsAndManuscripts,
            historicalSources: selectedStory.historicalSources,
            keyHistoricalFigures: selectedStory.keyHistoricalFigures,
            audioTranscript:
              selectedLang === 'or'
                ? selectedStory.audioTranscriptOr
                : selectedLang === 'hi'
                ? selectedStory.audioTranscriptHi
                : selectedStory.audioTranscriptEn,
          },
        }),
      });

      const data = await res.json();
      const localReplyText = answerMonumentQuestionMultilingual(
        text,
        selectedStory,
        voiceProfile,
        selectedLang
      );
      const replyText = data?.reply || localReplyText;
      const localSourceLabel =
        selectedLang === 'or'
          ? 'ଉତ୍କଳ କଥା ପ୍ରାମାଣିକ ଐତିହାସିକ ଅଭିଲେଖାଗାର'
          : selectedLang === 'hi'
          ? 'उत्कल कथा प्रामाणिक ऐतिहासिक अभिलेखागार'
          : 'Utkal Katha Verified Monument Archive';

      const assistantReply: AssistantMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        source: data?.source || localSourceLabel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLive: Boolean(data?.reply),
      };

      setMessages((prev) => [...prev, assistantReply]);
      if (autoSpeak || forceSpeak) {
        void handlePlayVoice(assistantReply.id, replyText);
      }
    } catch {
      const localReplyText = answerMonumentQuestionMultilingual(
        text,
        selectedStory,
        voiceProfile,
        selectedLang
      );
      const localSourceLabel =
        selectedLang === 'or'
          ? 'ଉତ୍କଳ କଥା ପ୍ରାମାଣିକ ଐତିହାସିକ ଅଭିଲେଖାଗାର'
          : selectedLang === 'hi'
          ? 'उत्कल कथा प्रामाणिक ऐतिहासिक अभिलेखागार'
          : 'Utkal Katha Verified Monument Archive';
      const fallbackReply: AssistantMessage = {
        id: `fallback-${Date.now()}`,
        sender: 'assistant',
        text: localReplyText,
        source: localSourceLabel,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackReply]);
      if (autoSpeak || forceSpeak) {
        void handlePlayVoice(fallbackReply.id, localReplyText);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  return (
    <div className="bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-950 border border-amber-600/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Monument Voice Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-800 relative z-10">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/40 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold mb-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Utkal Katha Voice Assistant (ଉତ୍କଳ କଥା ସ୍ୱର ସହାୟକ • उत्कल कथा वॉइस सहायक)
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white flex flex-wrap items-center gap-2">
              <span>{voiceProfile.narratorName[selectedLang] || voiceProfile.narratorName.en}</span>
              <span className="text-xs font-normal text-amber-400/90 px-2 py-0.5 rounded-md bg-stone-800/80 border border-stone-700">
                {voiceProfile.voicePersonaTitle[selectedLang] || voiceProfile.voicePersonaTitle.en}
              </span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-2">
              <Headphones className="w-3 h-3 text-amber-400" />
              <span>{voiceProfile.timbreDescription}</span>
            </p>
          </div>
        </div>

        {/* Multilingual Voice Switcher Tabs & Auto-Voice Toggle */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 bg-stone-950/80 border border-stone-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onLanguageChange('or')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedLang === 'or'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              ଓଡ଼ିଆ (Odia)
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('hi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedLang === 'hi'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              हिन्दी (Hindi)
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedLang === 'en'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              English
            </button>
          </div>

          <button
            type="button"
            onClick={() => setAutoSpeak((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              autoSpeak
                ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300'
                : 'bg-stone-900 border-stone-700 text-stone-400'
            }`}
            title="Automatically speak assistant answers aloud"
          >
            {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>
              {selectedLang === 'or'
                ? 'ସ୍ୱୟଂ ସ୍ୱର'
                : selectedLang === 'hi'
                ? 'ऑटो आवाज़'
                : 'Auto-Voice'}
            </span>
          </button>
        </div>
      </div>

      {/* Real-Time Hands-Free Bidirectional Live Voice Conversation Banner */}
      <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-950/45 via-stone-950 to-orange-950/35 border border-amber-500/35 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                liveVoice.isLiveActive
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-950/60'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              }`}
            >
              <Radio className={`w-5 h-5 ${liveVoice.isLiveActive ? 'animate-ping' : ''}`} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                <span>
                  {selectedLang === 'or'
                    ? `ସିଧାସଳଖ ଓଡ଼ିଆ ସ୍ୱର କଥାବାର୍ତ୍ତା (${voiceProfile.narratorName.or})`
                    : selectedLang === 'hi'
                    ? `सीधा हिन्दी वॉइस संवाद (${voiceProfile.narratorName.hi})`
                    : `Hands-Free Live Voice Conversation (${voiceProfile.narratorName.en})`}
                </span>
                {liveVoice.isLiveActive && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {liveVoice.isModelSpeaking
                      ? selectedLang === 'or'
                        ? '🔊 ଉତ୍ତର କହୁଛନ୍ତି...'
                        : selectedLang === 'hi'
                        ? '🔊 बोल रहे हैं...'
                        : '🔊 Speaking...'
                      : selectedLang === 'or'
                      ? '🎙️ ଶୁଣୁଛନ୍ତି...'
                      : selectedLang === 'hi'
                      ? '🎙️ सुन रहे हैं...'
                      : '🎙️ Listening...'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {selectedLang === 'or'
                  ? 'ମାଇକ୍ ଖୋଲି ସିଧାସଳଖ ଓଡ଼ିଆରେ କଥା ହୁଅନ୍ତୁ ଏବଂ ତୁରନ୍ତ ସ୍ୱରରେ ଉତ୍ତର ଶୁଣନ୍ତୁ।'
                  : selectedLang === 'hi'
                  ? 'माइक ऑन करके सीधे हिन्दी में बात करें और तुरंत आवाज़ में उत्तर सुनें।'
                  : 'Speak naturally in real time and hear instant spoken historical answers.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {liveVoice.isLiveActive ? (
              <>
                <button
                  type="button"
                  onClick={liveVoice.toggleMicMute}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                    liveVoice.isMicMuted
                      ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                      : 'bg-stone-900 border-stone-700 text-emerald-300 hover:bg-stone-800'
                  }`}
                >
                  {liveVoice.isMicMuted ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>{selectedLang === 'or' ? 'ଅନ୍-ମ୍ୟୁଟ୍' : selectedLang === 'hi' ? 'अनम्यूट' : 'Unmute'}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>{selectedLang === 'or' ? 'ମ୍ୟୁଟ୍' : selectedLang === 'hi' ? 'म्यूट' : 'Mute'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={liveVoice.stopLiveSession}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>
                    {selectedLang === 'or'
                      ? 'ସମାପ୍ତ କରନ୍ତୁ'
                      : selectedLang === 'hi'
                      ? 'संवाद समाप्त करें'
                      : 'End Voice Call'}
                  </span>
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={liveVoice.isConnecting}
                onClick={() => {
                  stopAssistantVoice();
                  void liveVoice.startLiveSession(selectedLang);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 disabled:opacity-50 text-stone-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>
                  {liveVoice.isConnecting
                    ? selectedLang === 'or'
                      ? 'ସଂଯୋଗ ହେଉଛି...'
                      : selectedLang === 'hi'
                      ? 'जुड़ रहा है...'
                      : 'Connecting...'
                    : selectedLang === 'or'
                    ? 'ଓଡ଼ିଆ ଲାଇଭ୍ ସ୍ୱର ଆରମ୍ଭ କରନ୍ତୁ'
                    : selectedLang === 'hi'
                    ? 'हिन्दी लाइव संवाद शुरू करें'
                    : 'Start Live Voice Call'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Live Transcripts & Mic Meter */}
        {liveVoice.isLiveActive && (
          <div className="mt-3 pt-3 border-t border-stone-800/80 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-stone-400">MIC</span>
              <div className="flex-1 h-1.5 rounded-full bg-stone-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all duration-75"
                  style={{ width: `${Math.max(4, liveVoice.micLevel)}%` }}
                />
              </div>
              <span className="text-[10px] text-emerald-300 font-semibold">
                {liveVoice.liveVoiceLabel || voiceProfile.geminiVoiceName}
              </span>
            </div>
            {liveVoice.liveUserTranscript && (
              <div className="p-2 rounded-lg bg-stone-900/90 border border-stone-800 text-amber-200">
                <span className="font-bold mr-1.5">🎙️ You:</span>
                {liveVoice.liveUserTranscript}
              </div>
            )}
            {liveVoice.liveAssistantTranscript && (
              <div className="p-2 rounded-lg bg-stone-900/90 border border-emerald-800/40 text-emerald-200">
                <span className="font-bold mr-1.5">
                  🔊 {voiceProfile.narratorName[selectedLang] || voiceProfile.narratorName.en}:
                </span>
                {liveVoice.liveAssistantTranscript}
              </div>
            )}
          </div>
        )}

        {liveVoice.liveError && (
          <p className="mt-2 text-[11px] text-amber-300">{liveVoice.liveError}</p>
        )}
      </div>

      {/* Voice Status Alert if active */}
      {voiceNotice && (
        <div className="mt-3 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            {voiceNotice}
          </span>
          <button
            type="button"
            onClick={stopAssistantVoice}
            className="text-[11px] underline text-stone-400 hover:text-white"
          >
            Stop Voice
          </button>
        </div>
      )}

      {/* Monument-Specific Quick Questions Chips */}
      <div className="mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {selectedLang === 'or'
                ? `${voiceProfile.placeName.or} ବିଷୟରେ ତୁରନ୍ତ ପଚାରନ୍ତୁ:`
                : selectedLang === 'hi'
                ? `${voiceProfile.placeName.hi} के बारे में तुरंत पूछें:`
                : `Ask About Running Story (${voiceProfile.placeName.en}):`}
            </span>
          </div>
          <span className="text-[10px] text-amber-400/90 bg-stone-950/90 px-2 py-0.5 rounded-full border border-amber-500/30 font-medium">
            {selectedLang === 'or'
              ? '🎯 ଓଡ଼ିଆ ଲିପି ଓ ଓଡ଼ିଆ ସ୍ୱର'
              : selectedLang === 'hi'
              ? '🎯 शुद्ध हिन्दी लिपि व आवाज़'
              : '🎯 Answers Focused Exclusively On This Story'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {voiceProfile.curatedQuestions.map((q, idx) => {
            const questionText = q[selectedLang] || q.en;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => void handleSendQuery(questionText, true)}
                disabled={isLoading}
                className="text-left text-xs bg-stone-950/80 hover:bg-amber-950/40 border border-stone-800 hover:border-amber-500/50 text-stone-300 hover:text-amber-200 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 group disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="line-clamp-2">{questionText}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1 text-sm custom-scrollbar">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          const isSpeaking = activeSpeakingMsgId === m.id;

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fadeIn`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-3.5 sm:p-4 shadow-md ${
                  isUser
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 font-medium rounded-tr-none'
                    : 'bg-stone-950 border border-stone-800/90 text-stone-200 rounded-tl-none'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-stone-800/60 text-[11px] text-amber-400 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5" />
                      {voiceProfile.narratorName[selectedLang] || voiceProfile.narratorName.en}
                      {m.isLive && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/40">
                          <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                          Live Answer
                        </span>
                      )}
                    </span>
                    <span className="text-stone-500 text-[10px]">{m.timestamp}</span>
                  </div>
                )}

                <p className="whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                  {m.text}
                </p>

                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-stone-500 text-[10px]">
                      {m.source || 'ASI Historical Records'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handlePlayVoice(m.id, m.text)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          isSpeaking
                            ? 'bg-amber-500 text-stone-950 animate-pulse'
                            : 'bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/30'
                        }`}
                        title="Listen to this answer"
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>
                              {selectedLang === 'or' ? 'ବନ୍ଦ କରନ୍ତୁ' : selectedLang === 'hi' ? 'रोकें' : 'Stop'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>
                              {selectedLang === 'or'
                                ? 'ସ୍ୱରରେ ଶୁଣନ୍ତୁ'
                                : selectedLang === 'hi'
                                ? 'आवाज़ में सुनें'
                                : 'Listen Aloud'}
                            </span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(m.id, m.text)}
                        className="p-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
                        title="Copy answer"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-amber-300 bg-stone-950 border border-amber-500/40 rounded-2xl px-4 py-3 w-fit animate-pulse shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>
              {selectedLang === 'or'
                ? `${voiceProfile.narratorName.or} ପ୍ରତ୍ୟକ୍ଷ ଉତ୍ତର ପ୍ରସ୍ତୁତ କରୁଛନ୍ତି...`
                : selectedLang === 'hi'
                ? `${voiceProfile.narratorName.hi} सीधा उत्तर तैयार कर रहे हैं...`
                : `${voiceProfile.narratorName.en} is preparing a live answer to your question...`}
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice & Text Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSendQuery();
        }}
        className="mt-4 flex items-center gap-2 relative z-10"
      >
        <button
          type="button"
          onClick={() => void toggleRecording()}
          disabled={isTranscribing}
          className={`px-3 py-2.5 rounded-xl border transition-all flex items-center justify-center gap-1.5 flex-shrink-0 text-xs font-bold ${
            isRecording
              ? 'bg-rose-600 text-white border-rose-500 animate-pulse ring-2 ring-rose-400'
              : isTranscribing
              ? 'bg-amber-600/30 text-amber-300 border-amber-500/50 animate-pulse'
              : 'bg-stone-950 hover:bg-stone-800 border-stone-700 text-stone-200 hover:text-amber-400'
          }`}
          title={
            isRecording
              ? 'Tap to stop recording and transcribe'
              : isTranscribing
              ? 'Transcribing spoken voice...'
              : 'Speak your question in Odia, Hindi, or English'
          }
          aria-label="Toggle voice dictation"
        >
          {isTranscribing ? (
            <RotateCcw className="w-4 h-4 animate-spin" />
          ) : isRecording ? (
            <>
              <MicOff className="w-4 h-4" />
              <span className="font-mono">{recordingSec}s</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">
                {selectedLang === 'or' ? 'କୁହନ୍ତୁ' : selectedLang === 'hi' ? 'बोलें' : 'Speak'}
              </span>
            </>
          )}
        </button>

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={
            selectedLang === 'or'
              ? `${voiceProfile.placeName.or} ବିଷୟରେ ଓଡ଼ିଆରେ କିଛି ବି ପଚାରନ୍ତୁ...`
              : selectedLang === 'hi'
              ? `${voiceProfile.placeName.hi} के बारे में हिन्दी में कुछ भी पूछें...`
              : `Ask anything about ${voiceProfile.placeName.en}...`
          }
          className="flex-1 bg-stone-950 border border-stone-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />

        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading || isTranscribing}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all flex-shrink-0 shadow-lg"
        >
          <span>{selectedLang === 'or' ? 'ପଚାରନ୍ତୁ' : selectedLang === 'hi' ? 'पूछें' : 'Ask'}</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
