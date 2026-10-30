import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SupportedLanguage } from '../types';
import {
  ODISHA_30_DISTRICTS,
  getDistrictsByZone,
  DistrictInfo,
} from '../data/odishaDistricts';
import { fetchApi } from '../utils/apiConfig';
import { answerGeneralOdishaAssistantMultilingual } from '../utils/utkalKathaVoiceEngine';
import { unifiedVoicePipeline } from '../services/unifiedVoicePipeline';
import { useGeminiLiveVoice } from '../hooks/useGeminiLiveVoice';
import {
  Bot,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Info,
  User,
  X,
  RefreshCw,
  Mic,
  MicOff,
  MapPin,
  Compass,
  Shield,
  Utensils,
  Bus,
  Phone,
  Search,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Building,
  TreePine,
  Award,
  Gem,
  Bed,
  HeartPulse,
  Navigation,
  UtensilsCrossed,
  Radio,
  PhoneCall,
  PhoneOff,
} from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  initialPrompt?: string;
  onSelectDistrictForTrip?: (districtName: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  source?: string;
  timestamp: string;
  districtData?: DistrictInfo | null;
}

type AssistantTab = 'chat' | 'districts' | 'temples' | 'cuisine' | 'safety';

const QUICK_PROMPTS = [
  {
    en: 'What are the rules & dress code for Puri Jagannath Temple?',
    or: 'ପୁରୀ ଶ୍ରୀମନ୍ଦିର ପ୍ରବେଶ ଓ ବେଶଭୂଷା ନିୟମ କ’ଣ?',
    hi: 'पुरी जगन्नाथ मंदिर दर्शन व वेशभूषा के क्या नियम हैं?',
  },
  {
    en: 'Guide to Mayurbhanj: Similipal Safari, Mudhi Mansa & Kai Chutney?',
    or: 'ମୟୂରଭଞ୍ଜ ଶିମିଳିପାଳ ସଫାରୀ ଓ ମୁଢ଼ି ମାଂସ ବିଷୟରେ କୁହନ୍ତୁ?',
    hi: 'मयूरभंज: शिमिलिपाल सफारी, मुढ़ी मांसा और काई चटनी?',
  },
  {
    en: 'Koraput Coffee, Deomali Peak and Duduma Waterfall itinerary?',
    or: 'କୋରାପୁଟ କଫି, ଦେଓମାଳୀ ଏବଂ ଦୁଦୁମା ଜଳପ୍ରପାତ କିପରି ବୁଲିବି?',
    hi: 'कोरापुट कॉफ़ी, देवमाली चोटी और दुदुमा झरना कैसे घूमें?',
  },
  {
    en: 'Dhenkanal Magji & Nayagarh Chhena Poda GI Tag sweets?',
    or: 'ଢେଙ୍କାନାଳ ମଗଜି ଓ ନୟାଗଡ଼ ଛେନାପୋଡ଼ ଜିଆଇ ଟ୍ୟାଗ୍ ମିଠା?',
    hi: 'ढेंकानाल मगजी और नयागढ़ छेना पोड़ जीआई टैग मिठाई?',
  },
  {
    en: 'Mo Bus route and fare from Bhubaneswar to Puri / Konark?',
    or: 'ଭୁବନେଶ୍ୱରରୁ ପୁରୀ ଓ କୋଣାର୍କ ମୋ ବସ୍ ଭଡ଼ା ଏବଂ ରୁଟ୍ କେତେ?',
    hi: 'भुवनेश्वर से पुरी और कोणार्क मो बस का किराया क्या है?',
  },
  {
    en: 'Historical inscriptions of Konark, Dhauli & Kharavela Hatigumpha?',
    or: 'କୋଣାର୍କ, ଧଉଳି ଓ ଖାରବେଳଙ୍କ ହାତୀଗୁମ୍ଫା ଶିଳାଲେଖ ଇତିହାସ କ’ଣ?',
    hi: 'कोणार्क, धौली और खारवेल के हाथीगुम्फा शिलालेखों का इतिहास क्या है?',
  },
];

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  language,
  setLanguage,
  initialPrompt,
  onSelectDistrictForTrip,
}) => {
  const [activeTab, setActiveTab] = useState<AssistantTab>('chat');
  const [selectedZone, setSelectedZone] = useState<'All' | 'Coastal' | 'Western' | 'Southern' | 'Northern' | 'Central'>('All');
  const [districtSearch, setDistrictSearch] = useState<string>('');
  const [activeDistrictDetail, setActiveDistrictDetail] = useState<DistrictInfo | null>(null);

  const getWelcomeGreeting = (lang: SupportedLanguage) =>
    lang === 'or'
      ? 'ଜୟ ଜଗନ୍ନାଥ! ମୁଁ ଉତ୍କଳ ମିତ୍ର — ଓଡ଼ିଶାର ସମସ୍ତ ୩୦ଟି ଜିଲ୍ଲା ଓ ୨୫ଟି ଐତିହାସିକ ସ୍ଥାନର ପ୍ରାମାଣିକ ଓଡ଼ିଆ ଭଏସ୍ ଆସିଷ୍ଟାଣ୍ଟ। ଆପଣ ମାଇକ୍ ଦବାଇ କିମ୍ବା ଲାଇଭ୍ ସ୍ୱର ମୋଡ୍ ଖୋଲି ସିଧାସଳଖ ଓଡ଼ିଆରେ କଥା ହୋଇପାରିବେ!'
      : lang === 'hi'
      ? 'जय जगन्नाथ! मैं उत्कल मित्र हूँ — ओडिशा के सभी 30 ज़िलों और 25 ऐतिहासिक स्थलों का आधिकारिक हिन्दी वॉइस असिस्टेंट। आप माइक दबाकर या लाइव वॉइस संवाद चालू करके सीधे हिन्दी में बात कर सकते हैं!'
      : 'Namaskar & Jay Jagannath! I am Utkal Mitra — your multilingual Odisha Heritage & 30-District Voice Assistant (ଓଡ଼ିଆ, हिन्दी & English). Tap the microphone or start a Live Voice Call to talk hands-free!';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      sender: 'assistant',
      text: getWelcomeGreeting(language),
      source: 'UtkalSarathi 30-District Curated Tourism Intelligence',
      timestamp: 'Just now',
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSec, setRecordingSec] = useState<number>(0);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [voiceBanner, setVoiceBanner] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsAbortRef = useRef<AbortController | null>(null);

  const liveVoice = useGeminiLiveVoice({
    lang: language,
    persona: 'utkal-mitra',
    greetOnConnect: true,
    onTurnCompleted: (userTranscript, assistantTranscript) => {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => {
        const next = [...prev];
        if (userTranscript) {
          next.push({
            id: `live-u-${Date.now()}`,
            sender: 'user',
            text: userTranscript,
            timestamp: nowStr,
          });
        }
        if (assistantTranscript) {
          next.push({
            id: `live-a-${Date.now() + 1}`,
            sender: 'assistant',
            text: assistantTranscript,
            source:
              language === 'or'
                ? 'ଉତ୍କଳ ମିତ୍ର • ଲାଇଭ୍ ଓଡ଼ିଆ ସ୍ୱର'
                : language === 'hi'
                ? 'उत्कल मित्र • लाइव हिन्दी संवाद'
                : 'Utkal Mitra • Gemini Live Voice',
            timestamp: nowStr,
          });
        }
        return next;
      });
    },
  });

  const stopAudioPlayback = () => {
    unifiedVoicePipeline.stopAll();
    setSpeakingMessageId(null);
  };

  // Sync welcome greeting whenever user switches between Odia, Hindi, and English
  useEffect(() => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === 'm-init'
          ? {
              ...m,
              text: getWelcomeGreeting(language),
              source:
                language === 'or'
                  ? 'ଉତ୍କଳ ସାରଥୀ ୩୦-ଜିଲ୍ଲା ପର୍ଯ୍ୟଟନ ନିର୍ଦ୍ଦେଶିକା'
                  : language === 'hi'
                  ? 'उत्कल सारथी ३०-ज़िला पर्यटन मार्गदर्शिका'
                  : 'UtkalSarathi 30-District Curated Tourism Intelligence',
            }
          : m
      )
    );
    stopAudioPlayback();
    if (liveVoice.isLiveActive) {
      liveVoice.stopLiveSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    if (!isOpen) {
      stopAudioPlayback();
      if (liveVoice.isLiveActive) {
        liveVoice.stopLiveSession();
      }
      if (recordTimerRef.current) {
        window.clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      setIsRecording(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      void handleSendPrompt(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt, isOpen]);

  // Speech Recognition setup (Web Speech API fallback)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'or' ? 'or-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

      let capturedFinal = '';
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        capturedFinal = transcript;
        setInput(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (capturedFinal.trim()) {
          const textToSubmit = capturedFinal.trim();
          capturedFinal = '';
          void handleSendPrompt(textToSubmit, undefined, true);
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      speechRecognitionRef.current = recognition;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

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

    stopAudioPlayback();

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
        const mimeCandidates = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/mp4',
          'audio/aac',
          'audio/ogg;codecs=opus',
          'audio/3gpp',
        ];
        const chosenMime =
          typeof MediaRecorder.isTypeSupported === 'function'
            ? mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || ''
            : '';
        const recorder = chosenMime
          ? new MediaRecorder(stream, { mimeType: chosenMime })
          : new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) recordedChunksRef.current.push(ev.data);
        };

        recorder.onstop = async () => {
          if (recordTimerRef.current) {
            window.clearInterval(recordTimerRef.current);
            recordTimerRef.current = null;
          }
          setRecordingSec(0);
          const mimeType = recorder.mimeType || chosenMime || 'audio/webm';
          stream.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
          const blob = new Blob(recordedChunksRef.current, { type: mimeType });
          if (blob.size < 250) return;

          setIsTranscribing(true);
          setVoiceBanner(
            language === 'or'
              ? 'ଓଡ଼ିଆ ସ୍ୱର ଲିପିବଦ୍ଧ ହେଉଛି...'
              : language === 'hi'
              ? 'हिन्दी आवाज़ लिखी जा रही है...'
              : 'Transcribing spoken voice...'
          );

          try {
            const audioBase64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(String(reader.result || ''));
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            const res = await fetchApi('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64, mimeType, lang: language }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.transcript) {
                setInput(data.transcript);
                setVoiceBanner('');
                setIsTranscribing(false);
                void handleSendPrompt(data.transcript, undefined, true);
                return;
              }
            }
            setVoiceBanner(
              language === 'or'
                ? 'ସ୍ୱର ସ୍ପଷ୍ଟ ହେଲା ନାହିଁ—ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ କିମ୍ବା ତଳେ ଟାଇପ୍ କରନ୍ତୁ।'
                : language === 'hi'
                ? 'आवाज़ स्पष्ट नहीं हो सकी—कृपया पुनः प्रयास करें या नीचे टाइप करें।'
                : 'Could not transcribe clearly—please retry or type below.'
            );
          } catch {
            setVoiceBanner(
              language === 'or'
                ? 'ଅଫଲାଇନ୍ ଅଛି—ଦୟାକରି ତଳେ ଆପଣଙ୍କ ପ୍ରଶ୍ନ ଟାଇପ୍ କରନ୍ତୁ।'
                : language === 'hi'
                ? 'ऑफ़लाइन—कृपया नीचे अपना प्रश्न टाइप करें।'
                : 'Offline—please type your question below.'
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
        setVoiceBanner(
          language === 'or'
            ? '🎙️ ଓଡ଼ିଆରେ କୁହନ୍ତୁ... ଶେଷ ହେଲେ ପୁଣି ମାଇକ୍ ଦବାନ୍ତୁ।'
            : language === 'hi'
            ? '🎙️ हिन्दी में बोलें... पूर्ण होने पर माइक पुनः दबाएं।'
            : '🎙️ Listening... tap Mic again when finished.'
        );
        return;
      } catch {
        // Fallback to SpeechRecognition or inline message
      }
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.lang =
          language === 'or' ? 'or-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
        speechRecognitionRef.current.start();
        setIsRecording(true);
        return;
      } catch {}
    }

    setVoiceBanner(
      language === 'or'
        ? 'ମାଇକ୍ରୋଫୋନ୍ ଉପଲବ୍ଧ ନାହିଁ—ଦୟାକରି ତଳେ ଟାଇପ୍ କରନ୍ତୁ।'
        : language === 'hi'
        ? 'माइक्रोफ़ोन उपलब्ध नहीं है—कृपया नीचे टाइप करें।'
        : 'Voice dictation is unavailable in this browser—please type your question below.'
    );
  };

  const handleSpeak = async (msgId: string, text: string) => {
    if (speakingMessageId === msgId) {
      stopAudioPlayback();
      setVoiceBanner('');
      return;
    }

    if (liveVoice.isLiveActive) {
      liveVoice.stopLiveSession();
    }

    stopAudioPlayback();

    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    setSpeakingMessageId(msgId);

    const result = await unifiedVoicePipeline.speak({
      text: cleanText,
      lang: language,
      persona: 'utkal-mitra',
      playbackSpeed: 1.0,
      allowPhoneticFallback: false,
      onStart: () => {
        setSpeakingMessageId(msgId);
      },
      onEnded: () => {
        setSpeakingMessageId(null);
      },
      onError: () => {
        setSpeakingMessageId(null);
      },
    });

    if (!result.success) {
      setSpeakingMessageId(null);
      if (result.notice) {
        setVoiceBanner(result.notice);
      }
    }
  };

  const handleSendPrompt = async (
    textToSend: string,
    explicitDistrict?: DistrictInfo,
    forceSpeak = false
  ) => {
    if (!textToSend.trim() || isLoading) return;

    if (liveVoice.isLiveActive) {
      setInput('');
      liveVoice.sendLiveTextPrompt(textToSend);
      return;
    }

    stopAudioPlayback();

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    if (activeTab !== 'chat') setActiveTab('chat');

    try {
      const langName = language === 'or' ? 'Odia' : language === 'hi' ? 'Hindi' : 'English';
      const res = await fetchApi('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          language: langName,
        }),
      });

      const data = await res.json();
      const localFallbackText = answerGeneralOdishaAssistantMultilingual(textToSend, language);
      const localSourceLabel =
        language === 'or'
          ? 'ଉତ୍କଳ ସାରଥୀ ୩୦-ଜିଲ୍ଲା ଅଭିଲେଖାଗାର'
          : language === 'hi'
          ? 'उत्कल सारथी ३०-जिला अभिलेखागार'
          : 'UtkalSarathi 30-District Verified Archive';
      const replyText = data.reply || localFallbackText;
      const replyMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        source: data.source || localSourceLabel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        districtData: data.districtData || explicitDistrict || null,
      };

      setMessages((prev) => [...prev, replyMsg]);
      if (autoSpeak || forceSpeak) {
        void handleSpeak(replyMsg.id, replyText);
      }
    } catch {
      const localFallbackText = answerGeneralOdishaAssistantMultilingual(textToSend, language);
      const localSourceLabel =
        language === 'or'
          ? 'ଉତ୍କଳ ସାରଥୀ ୩୦-ଜିଲ୍ଲା ଅଭିଲେଖାଗାର'
          : language === 'hi'
          ? 'उत्कल सारथी ३०-जिला अभिलेखागार'
          : 'UtkalSarathi 30-District Verified Archive';
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: localFallbackText,
        source: localSourceLabel,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
      if (autoSpeak || forceSpeak) {
        void handleSpeak(errorMsg.id, localFallbackText);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered 30 districts list for Explorer tab
  const filteredDistricts = useMemo(() => {
    let list = getDistrictsByZone(selectedZone);
    if (districtSearch.trim()) {
      const q = districtSearch.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.odiaName.includes(q) ||
          d.headquarters.toLowerCase().includes(q) ||
          d.highlights.some((h) => h.toLowerCase().includes(q)) ||
          d.signatureCuisine.some((c) => c.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedZone, districtSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-stone-900 border border-stone-700/80 rounded-2xl max-w-4xl w-full h-[92vh] flex flex-col text-stone-100 shadow-2xl overflow-hidden">
        
        {/* Header with Title and Controls */}
        <div className="bg-gradient-to-r from-stone-900 via-purple-950/70 to-stone-900 px-4 sm:px-6 py-3.5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-amber-600 flex items-center justify-center text-white shadow-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-white text-base tracking-tight">
                  Utkal Mitra AI
                </h3>
                <span className="text-xs text-amber-300 font-serif font-semibold">
                  (ଉତ୍କଳ ମିତ୍ର)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Advanced 30-District Edition
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Gemini 3.8 Flash Grounded
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Covers all 30 districts of Odisha: Heritage, Eco-Tourism, GI Tags, Fares & Safety
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switch */}
            <div className="flex items-center bg-stone-800 rounded-lg p-0.5 border border-stone-700 text-xs font-semibold">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded transition-colors ${
                  language === 'en' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-400 hover:text-white'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('or')}
                className={`px-2 py-1 rounded transition-colors ${
                  language === 'or' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-400 hover:text-white'
                }`}
                title="Odia (ଓଡ଼ିଆ)"
              >
                OR (ଓଡ଼ିଆ)
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded transition-colors ${
                  language === 'hi' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-400 hover:text-white'
                }`}
                title="Hindi (हिन्दी)"
              >
                HI (हिन्दी)
              </button>
            </div>

            <button
              type="button"
              onClick={() => setAutoSpeak((prev) => !prev)}
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                autoSpeak
                  ? 'bg-emerald-950/70 border-emerald-600/50 text-emerald-300'
                  : 'bg-stone-800 border-stone-700 text-stone-400'
              }`}
              title="Automatically read assistant replies aloud in Odia, Hindi, or English"
            >
              {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>
                {language === 'or'
                  ? 'ସ୍ୱୟଂ ସ୍ୱର'
                  : language === 'hi'
                  ? 'ऑटो आवाज़'
                  : 'Auto-Voice'}
              </span>
            </button>

            <button
              onClick={() => {
                stopAudioPlayback();
                liveVoice.stopLiveSession();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Close assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="bg-stone-850 px-4 py-2 border-b border-stone-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'chat'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('districts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'districts'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>30 Districts Explorer</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
                {ODISHA_30_DISTRICTS.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('temples')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'temples'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Temple Etiquette & Darshan</span>
              <span className="sm:hidden">Temples</span>
            </button>

            <button
              onClick={() => setActiveTab('cuisine')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'cuisine'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GI Tags & Flavors</span>
              <span className="sm:hidden">Cuisine</span>
            </button>

            <button
              onClick={() => setActiveTab('safety')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'safety'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">UtkalSuraksha Helplines</span>
              <span className="sm:hidden">Safety</span>
            </button>
          </div>

          <div className="text-[11px] text-stone-400 hidden md:flex items-center gap-1">
            <Info className="w-3 h-3 text-amber-400" />
            <span>Strict anti-commercialization & zero hallucination guidelines</span>
          </div>
        </div>

        {/* TAB 1: CONVERSATIONAL CHAT */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Real-Time Hands-Free Odia & Hindi Live Voice Conversation Bar */}
            <div className="px-4 py-2.5 bg-gradient-to-r from-purple-950/50 via-stone-900 to-amber-950/40 border-b border-stone-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                      liveVoice.isLiveActive
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    }`}
                  >
                    <Radio className={`w-4 h-4 ${liveVoice.isLiveActive ? 'animate-ping' : ''}`} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                      <span>
                        {language === 'or'
                          ? 'ଉତ୍କଳ ମିତ୍ର ଲାଇଭ୍ ଓଡ଼ିଆ ଭଏସ୍ ଆସିଷ୍ଟାଣ୍ଟ (Hands-Free)'
                          : language === 'hi'
                          ? 'उत्कल मित्र लाइव हिन्दी वॉइस असिस्टेंट (Hands-Free)'
                          : 'Utkal Mitra Live Voice Assistant (ଓଡ଼ିଆ • हिन्दी • EN)'}
                      </span>
                      {liveVoice.isLiveActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {liveVoice.isModelSpeaking
                            ? language === 'or'
                              ? '🔊 ଉତ୍ତର କହୁଛନ୍ତି...'
                              : language === 'hi'
                              ? '🔊 बोल रहे हैं...'
                              : '🔊 Speaking...'
                            : language === 'or'
                            ? '🎙️ ଶୁଣୁଛନ୍ତି...'
                            : language === 'hi'
                            ? '🎙️ सुन रहे हैं...'
                            : '🎙️ Listening...'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-400">
                      {language === 'or'
                        ? 'ସିଧାସଳଖ ଓଡ଼ିଆରେ କଥା ହୁଅନ୍ତୁ ଏବଂ ତୁରନ୍ତ ଓଡ଼ିଆ ସ୍ୱରରେ ଉତ୍ତର ଶୁଣନ୍ତୁ'
                        : language === 'hi'
                        ? 'सीधे हिन्दी में बात करें और तुरंत हिन्दी आवाज़ में उत्तर सुनें'
                        : 'Speak naturally and hear instant native Odia, Hindi, or English voice replies'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {liveVoice.isLiveActive ? (
                    <>
                      <button
                        type="button"
                        onClick={liveVoice.toggleMicMute}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 ${
                          liveVoice.isMicMuted
                            ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                            : 'bg-stone-800 border-stone-700 text-emerald-300 hover:bg-stone-750'
                        }`}
                      >
                        {liveVoice.isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                        <span>
                          {liveVoice.isMicMuted
                            ? language === 'or'
                              ? 'ଅନ୍-ମ୍ୟୁଟ୍'
                              : language === 'hi'
                              ? 'अनम्यूट'
                              : 'Unmute'
                            : language === 'or'
                            ? 'ମ୍ୟୁଟ୍'
                            : language === 'hi'
                            ? 'म्यूट'
                            : 'Mute'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={liveVoice.stopLiveSession}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                      >
                        <PhoneOff className="w-3.5 h-3.5" />
                        <span>
                          {language === 'or'
                            ? 'ବନ୍ଦ କରନ୍ତୁ'
                            : language === 'hi'
                            ? 'संवाद रोकें'
                            : 'End Call'}
                        </span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={liveVoice.isConnecting}
                      onClick={() => {
                        stopAudioPlayback();
                        void liveVoice.startLiveSession(language);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 disabled:opacity-50 text-stone-950 font-extrabold text-xs flex items-center gap-1.5 shadow"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>
                        {liveVoice.isConnecting
                          ? language === 'or'
                            ? 'ସଂଯୋଗ ହେଉଛି...'
                            : language === 'hi'
                            ? 'जुड़ रहा है...'
                            : 'Connecting...'
                          : language === 'or'
                          ? 'ଓଡ଼ିଆ ଲାଇଭ୍ ସ୍ୱର ଆରମ୍ଭ କରନ୍ତୁ'
                          : language === 'hi'
                          ? 'हिन्दी लाइव संवाद शुरू करें'
                          : 'Start Live Voice Call'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {liveVoice.isLiveActive && (
                <div className="mt-2 pt-2 border-t border-stone-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-stone-400">MIC</span>
                    <div className="flex-1 h-1.5 rounded-full bg-stone-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all duration-75"
                        style={{ width: `${Math.max(4, liveVoice.micLevel)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-emerald-300 font-semibold">
                      {liveVoice.liveVoiceLabel || 'Live Neural HD'}
                    </span>
                  </div>
                  {liveVoice.liveUserTranscript && (
                    <div className="px-2.5 py-1.5 rounded-lg bg-stone-950/90 border border-stone-800 text-amber-200">
                      <strong className="mr-1.5">🎙️ You:</strong>
                      {liveVoice.liveUserTranscript}
                    </div>
                  )}
                  {liveVoice.liveAssistantTranscript && (
                    <div className="px-2.5 py-1.5 rounded-lg bg-stone-950/90 border border-emerald-800/40 text-emerald-200">
                      <strong className="mr-1.5">🔊 Utkal Mitra:</strong>
                      {liveVoice.liveAssistantTranscript}
                    </div>
                  )}
                </div>
              )}

              {liveVoice.liveError && (
                <p className="mt-1.5 text-[11px] text-amber-300">{liveVoice.liveError}</p>
              )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-700 to-indigo-800 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-amber-600 text-white rounded-tr-none'
                        : 'bg-stone-800/95 text-stone-100 rounded-tl-none border border-stone-700/60'
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                    {/* Rich District Card Embed inside chat if district matched */}
                    {msg.districtData && (
                      <div className="mt-3 p-3 bg-stone-900/90 rounded-xl border border-amber-500/30 text-stone-200">
                        <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-400 text-sm">
                              {msg.districtData.name} ({msg.districtData.odiaName})
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                              HQ: {msg.districtData.headquarters} • {msg.districtData.zone} Zone
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveDistrictDetail(msg.districtData!);
                                setActiveTab('districts');
                              }}
                              className="text-[11px] font-semibold text-teal-300 hover:text-teal-200 flex items-center gap-0.5 px-2 py-0.5 rounded bg-teal-500/20 border border-teal-500/40"
                            >
                              <span>View Full Dossier</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                            {onSelectDistrictForTrip && (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectDistrictForTrip(msg.districtData!.name);
                                  onClose();
                                }}
                                className="text-[11px] font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-0.5 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40"
                              >
                                <span>Plan Trip</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-stone-300 italic mb-2">
                          "{msg.districtData.tagline}"
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-stone-850 p-2 rounded-lg border border-stone-800">
                            <span className="font-semibold text-amber-300 block mb-1">
                              🌟 Top Highlights:
                            </span>
                            <span className="text-stone-300">
                              {msg.districtData.highlights.join(', ')}
                            </span>
                          </div>

                          {msg.districtData.hiddenGems && msg.districtData.hiddenGems.length > 0 && (
                            <div className="bg-amber-950/20 p-2 rounded-lg border border-amber-800/40">
                              <span className="font-semibold text-amber-300 flex items-center gap-1 mb-1">
                                <Gem className="w-3 h-3 text-amber-400" />
                                💎 Hidden Gems:
                              </span>
                              <span className="text-amber-100/90 text-[10px]">
                                {msg.districtData.hiddenGems.join(' • ')}
                              </span>
                            </div>
                          )}

                          {msg.districtData.recommendedStays && msg.districtData.recommendedStays.length > 0 && (
                            <div className="bg-stone-850 p-2 rounded-lg border border-stone-800">
                              <span className="font-semibold text-teal-300 flex items-center gap-1 mb-1">
                                <Bed className="w-3 h-3 text-teal-400" />
                                🏨 Recommended Stays:
                              </span>
                              <div className="space-y-1 text-[10px]">
                                {msg.districtData.recommendedStays.slice(0, 2).map((s, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-stone-300">
                                    <span className="truncate max-w-[150px]">{s.name} ({s.estPrice})</span>
                                    <a href={`tel:${s.contact}`} className="text-emerald-400 hover:underline flex items-center gap-0.5 font-mono">
                                      <Phone className="w-2.5 h-2.5" />
                                      <span>Call</span>
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {msg.districtData.foodSpots && msg.districtData.foodSpots.length > 0 ? (
                            <div className="bg-stone-850 p-2 rounded-lg border border-stone-800">
                              <span className="font-semibold text-orange-300 flex items-center gap-1 mb-1">
                                <Utensils className="w-3 h-3 text-orange-400" />
                                🍲 Food & Sweets:
                              </span>
                              <div className="space-y-0.5 text-[10px] text-stone-300">
                                {msg.districtData.foodSpots.slice(0, 2).map((f, idx) => (
                                  <div key={idx} className="truncate">
                                    <strong className="text-amber-200">{f.item}:</strong> {f.recommendation}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-stone-850 p-2 rounded-lg border border-stone-800">
                              <span className="font-semibold text-orange-300 block mb-1">
                                🍲 Signature Food:
                              </span>
                              <span className="text-stone-300 text-[10px]">
                                {msg.districtData.signatureCuisine.join(', ')}
                              </span>
                            </div>
                          )}

                          <div className="bg-stone-850 p-2 rounded-lg border border-stone-800 sm:col-span-2">
                            <span className="font-semibold text-blue-300 flex items-center gap-1 mb-1">
                              <Bus className="w-3 h-3 text-blue-400" />
                              🚆 Transit & Last-Mile:
                            </span>
                            <span className="text-stone-300 text-[10px]">
                              {msg.districtData.transportHubs.nearestAirport ? `Air: ${msg.districtData.transportHubs.nearestAirport} | ` : ''}
                              Rail: {msg.districtData.transportHubs.nearestRail} | Road: {msg.districtData.transportHubs.highway}
                              <span className="block text-stone-400 text-[9px] mt-0.5">Tip: {msg.districtData.transportHubs.lastMileTransit}</span>
                            </span>
                          </div>
                        </div>

                        {/* Guide & Medical Bar */}
                        <div className="mt-2 pt-2 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-stone-400 gap-1.5">
                          <span className="flex items-center gap-1">
                            <HeartPulse className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                            <span>{msg.districtData.safetyAndHelpline.districtHospital}</span>
                          </span>
                          <div className="flex items-center gap-3">
                            <a
                              href={`tel:${msg.districtData.safetyAndHelpline.controlRoomNumber}`}
                              className="text-emerald-400 hover:underline font-mono flex items-center gap-0.5"
                            >
                              <Phone className="w-2.5 h-2.5" />
                              <span>Control: {msg.districtData.safetyAndHelpline.controlRoomNumber}</span>
                            </a>
                            {msg.districtData.touristGuideInfo && (
                              <a
                                href={`tel:${msg.districtData.touristGuideInfo.phone}`}
                                className="text-amber-400 hover:underline font-mono flex items-center gap-0.5"
                                title={msg.districtData.touristGuideInfo.contactName}
                              >
                                <Compass className="w-2.5 h-2.5" />
                                <span>Guide: {msg.districtData.touristGuideInfo.phone}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-stone-400 border-t border-stone-700/40 pt-1.5">
                      <span className="truncate max-w-[200px] sm:max-w-[340px]">
                        {msg.source ? `Source: ${msg.source}` : msg.timestamp}
                      </span>
                      {msg.sender === 'assistant' && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="hover:text-amber-300 flex items-center gap-1 transition-colors"
                            title="Copy reply"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleSpeak(msg.id, msg.text)}
                            className="hover:text-amber-300 flex items-center gap-1 transition-colors"
                            title="Read aloud"
                          >
                            {speakingMessageId === msg.id ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                <span>Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Listen</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-stone-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 items-center text-xs text-stone-400 pl-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                  <span>Utkal Mitra is synthesizing verified Odisha 30-district records...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-4 py-2 border-t border-stone-800 bg-stone-850/60 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-[11px] font-semibold text-stone-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Suggested:
                </span>
                {QUICK_PROMPTS.map((qp, idx) => {
                  const chipText = language === 'or' ? qp.or : language === 'hi' ? qp.hi : qp.en;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendPrompt(chipText)}
                      className="px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white text-xs border border-stone-700 transition-colors"
                    >
                      {chipText}
                    </button>
                  );
                })}
              </div>
            </div>

            {voiceBanner && (
              <div className="px-4 py-2 bg-amber-950/70 border-t border-amber-700/40 text-amber-200 text-xs flex items-center justify-between gap-2">
                <span>{voiceBanner}</span>
                <button
                  type="button"
                  onClick={() => setVoiceBanner('')}
                  className="text-amber-400 hover:text-white font-bold px-1.5"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Message Input Bar with Microphone Voice Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSendPrompt(input);
              }}
              className="p-3 bg-stone-850 border-t border-stone-800 flex items-center gap-2"
            >
              <button
                type="button"
                disabled={isTranscribing}
                onClick={() => void toggleRecording()}
                className={`px-3 h-10 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                  isRecording
                    ? 'bg-red-600 text-white animate-pulse shadow-lg ring-2 ring-red-400'
                    : isTranscribing
                    ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 animate-pulse'
                    : 'bg-stone-800 text-stone-200 hover:text-white hover:bg-stone-750 border border-stone-700'
                }`}
                title={
                  isRecording
                    ? 'Listening... click to stop and send'
                    : 'Click to speak in Odia, Hindi, or English'
                }
                aria-label="Voice input microphone"
              >
                {isTranscribing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : isRecording ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span className="font-mono">{recordingSec}s</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">
                      {language === 'or' ? 'କୁହନ୍ତୁ' : language === 'hi' ? 'बोलें' : 'Speak'}
                    </span>
                  </>
                )}
              </button>

              <input
                type="text"
                placeholder={
                  isRecording
                    ? language === 'or'
                      ? 'ଓଡ଼ିଆରେ ଶୁଣୁଛି...'
                      : language === 'hi'
                      ? 'हिन्दी में सुन रहा हूँ...'
                      : 'Listening to your voice...'
                    : language === 'or'
                    ? 'ଓଡ଼ିଶାର ୩୦ଟି ଜିଲ୍ଲା, ମନ୍ଦିର ନୀତି, ଖାଦ୍ୟ କିମ୍ବା ଯାତାୟାତ ବିଷୟରେ ଓଡ଼ିଆରେ ପଚାରନ୍ତୁ...'
                    : language === 'hi'
                    ? 'ओडिशा के 30 ज़िलों, मंदिर दर्शन, भोजन या परिवहन के बारे में हिन्दी में पूछें...'
                    : 'Ask about any of Odisha’s 30 districts, temple dress codes, food, or transit...'
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-purple-500 placeholder-stone-500"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading || isTranscribing}
                className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white flex items-center justify-center transition-colors shadow-sm"
                aria-label="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: 30 DISTRICTS EXPLORER */}
        {activeTab === 'districts' && (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            {/* Left list: zone filters, search, district cards */}
            <div className="w-full md:w-1/2 border-r border-stone-800 flex flex-col min-h-0 bg-stone-900/60">
              <div className="p-3 border-b border-stone-800 space-y-2">
                {/* Search box */}
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search 30 districts (e.g. Koraput, Sambalpur, Mayurbhanj)..."
                    value={districtSearch}
                    onChange={(e) => setDistrictSearch(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Zone selector chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                  {(['All', 'Coastal', 'Western', 'Southern', 'Northern', 'Central'] as const).map(
                    (zone) => (
                      <button
                        key={zone}
                        onClick={() => setSelectedZone(zone)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                          selectedZone === zone
                            ? 'bg-amber-600 text-white'
                            : 'bg-stone-800 text-stone-400 hover:text-white'
                        }`}
                      >
                        {zone}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* District grid / list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <div className="text-[11px] text-stone-400 mb-1 flex items-center justify-between">
                  <span>Showing {filteredDistricts.length} of 30 Districts</span>
                  <span className="text-amber-400">Click to explore details & ask AI</span>
                </div>

                {filteredDistricts.map((district) => {
                  const isSelected = activeDistrictDetail?.id === district.id;
                  return (
                    <div
                      key={district.id}
                      onClick={() => setActiveDistrictDetail(district)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-stone-800 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                          : 'bg-stone-850/70 border-stone-800 hover:border-stone-700 hover:bg-stone-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">
                            {district.name}
                          </h4>
                          <span className="text-xs text-amber-400 font-medium font-serif">
                            {district.odiaName}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
                          {district.zone}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 line-clamp-1 mt-1">
                        {district.tagline}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {district.highlights.slice(0, 2).map((h, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300"
                          >
                            {h}
                          </span>
                        ))}
                        {district.highlights.length > 2 && (
                          <span className="text-[10px] text-stone-500">
                            +{district.highlights.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right details view: deep district inspector with 6-pillar depth */}
            <div className="w-full md:w-1/2 flex-1 p-4 overflow-y-auto bg-stone-900">
              {activeDistrictDetail ? (
                <div className="space-y-4 animate-fade-in pb-4">
                  {/* District Header & Actions */}
                  <div className="border-b border-stone-800 pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-extrabold text-white">
                            {activeDistrictDetail.name}
                          </h3>
                          <span className="text-base text-amber-400 font-serif font-bold">
                            {activeDistrictDetail.odiaName}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/60 font-semibold">
                            {activeDistrictDetail.zone} Zone
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5">
                          Headquarters: <strong className="text-stone-300">{activeDistrictDetail.headquarters}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {onSelectDistrictForTrip && (
                          <button
                            onClick={() => {
                              onSelectDistrictForTrip(activeDistrictDetail.name);
                              onClose();
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1 shadow"
                          >
                            <Compass className="w-3.5 h-3.5" />
                            <span>Plan Trip</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            handleSendPrompt(
                              `Provide an in-depth travel and cultural guide for ${activeDistrictDetail.name} district, including attractions, hidden gems, local cuisine spots, stays, and transit tips.`,
                              activeDistrictDetail
                            );
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1 shadow"
                        >
                          <Bot className="w-3.5 h-3.5" />
                          <span>Ask AI</span>
                        </button>
                      </div>
                    </div>

                    <p className="mt-2.5 text-xs text-stone-300 leading-relaxed italic bg-stone-850 p-2.5 rounded-xl border border-stone-800">
                      "{activeDistrictDetail.tagline}"
                    </p>
                  </div>

                  {/* PILLAR 1: 💎 HIDDEN GEMS & OFFBEAT DISCOVERIES */}
                  {activeDistrictDetail.hiddenGems && activeDistrictDetail.hiddenGems.length > 0 && (
                    <div className="bg-gradient-to-br from-amber-950/30 via-stone-850 to-stone-850 p-3.5 rounded-xl border border-amber-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <Gem className="w-3.5 h-3.5 text-amber-400" />
                          <span>💎 Hidden Gems & Offbeat Discoveries:</span>
                        </h4>
                        <span className="text-[10px] text-amber-400/80 font-medium">Lesser-Known Heritage & Nature</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeDistrictDetail.hiddenGems.map((gem, i) => (
                          <div
                            key={i}
                            className="p-2 rounded-lg bg-stone-900/80 border border-amber-500/20 text-xs text-stone-200 flex items-start gap-1.5"
                          >
                            <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span className="leading-tight">{gem}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PILLAR 2: 🏨 RECOMMENDED STAYS & ECO CAMPS */}
                  {activeDistrictDetail.recommendedStays && activeDistrictDetail.recommendedStays.length > 0 && (
                    <div className="bg-stone-850 p-3.5 rounded-xl border border-stone-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                          <Bed className="w-3.5 h-3.5 text-teal-400" />
                          <span>🏨 Recommended Stays & Nature Camps:</span>
                        </h4>
                        <span className="text-[10px] text-stone-400">Verified Bookings</span>
                      </div>
                      <div className="space-y-2">
                        {activeDistrictDetail.recommendedStays.map((stay, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-stone-900/90 border border-stone-750 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-white text-xs">
                                  {stay.name}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-950/60 text-teal-300 border border-teal-800/50">
                                  {stay.type}
                                </span>
                                <span className="text-[10px] font-mono text-amber-400">
                                  {stay.estPrice}
                                </span>
                              </div>
                            </div>
                            <a
                              href={`tel:${stay.contact}`}
                              className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1 flex-shrink-0 self-start sm:self-auto"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{stay.contact}</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PILLAR 3: 🍲 FOOD SPOTS & AUTHENTIC CUISINE */}
                  <div className="bg-stone-850 p-3.5 rounded-xl border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-orange-400" />
                        <span>🍲 Iconic Food Spots & Sweetmakers:</span>
                      </h4>
                      <span className="text-[10px] text-stone-400">GI Tags & Local Flavors</span>
                    </div>

                    {activeDistrictDetail.foodSpots && activeDistrictDetail.foodSpots.length > 0 ? (
                      <div className="space-y-1.5">
                        {activeDistrictDetail.foodSpots.map((spot, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-stone-900/80 border border-stone-750 text-xs flex items-start justify-between gap-2"
                          >
                            <div>
                              <strong className="text-amber-300">{spot.item}</strong>
                              <span className="text-stone-300 block text-[11px]">
                                {spot.recommendation}
                              </span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-orange-950/60 text-orange-300 border border-orange-800/40 whitespace-nowrap">
                              Must-Eat
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {activeDistrictDetail.signatureCuisine.map((c, i) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-1 rounded-lg bg-stone-800 text-stone-200 border border-stone-700"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* PILLAR 4: 🌟 TOP ATTRACTIONS & ECO-TOURISMS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-stone-850 p-3 rounded-xl border border-stone-800">
                      <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        Key Heritage Attractions:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {activeDistrictDetail.highlights.map((h, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2 py-0.5 rounded bg-stone-800 text-stone-200 border border-stone-700"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-stone-850 p-3 rounded-xl border border-stone-800">
                      <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                        <TreePine className="w-3.5 h-3.5" />
                        Eco-Tourism & Nature:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {activeDistrictDetail.ecoTourismAndNature.map((eco, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-200 border border-emerald-800/50"
                          >
                            {eco}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* PILLAR 5: 🚆 TRANSIT & CONNECTIVITY */}
                  <div className="bg-stone-850 p-3.5 rounded-xl border border-stone-800 space-y-1.5 text-xs">
                    <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1.5 mb-2">
                      <Bus className="w-3.5 h-3.5" />
                      Transit & Connectivity:
                    </h4>
                    {activeDistrictDetail.transportHubs.nearestAirport && (
                      <p className="text-stone-300">
                        <strong className="text-stone-200">Nearest Airport:</strong>{' '}
                        {activeDistrictDetail.transportHubs.nearestAirport}
                      </p>
                    )}
                    <p className="text-stone-300">
                      <strong className="text-stone-200">Rail Junction:</strong>{' '}
                      {activeDistrictDetail.transportHubs.nearestRail}
                    </p>
                    <p className="text-stone-300">
                      <strong className="text-stone-200">Highway Route:</strong>{' '}
                      {activeDistrictDetail.transportHubs.highway}
                    </p>
                    <div className="p-2 rounded-lg bg-blue-950/30 border border-blue-900/40 text-[11px] text-blue-200 mt-1">
                      <strong>Last-Mile Transit Advice:</strong> {activeDistrictDetail.transportHubs.lastMileTransit}
                    </div>
                  </div>

                  {/* PILLAR 6: 🏥 EMERGENCY MEDICAL & POLICE HELPLINES */}
                  <div className="bg-gradient-to-r from-emerald-950/30 to-stone-850 border border-emerald-800/50 p-3.5 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
                      Hospital, Police & Emergency Contacts:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
                        <span className="text-stone-400 text-[10px] block">District Hospital / Medical:</span>
                        <strong className="text-white text-xs">{activeDistrictDetail.safetyAndHelpline.districtHospital}</strong>
                      </div>
                      <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
                        <span className="text-stone-400 text-[10px] block">Town Police Station:</span>
                        <strong className="text-white text-xs">{activeDistrictDetail.safetyAndHelpline.policeStation}</strong>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-stone-300 text-[11px]">
                        Disaster Control Room: <strong className="font-mono text-emerald-300">{activeDistrictDetail.safetyAndHelpline.controlRoomNumber}</strong>
                      </span>
                      <a
                        href={`tel:${activeDistrictDetail.safetyAndHelpline.controlRoomNumber}`}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 text-xs"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call Control Room</span>
                      </a>
                    </div>
                  </div>

                  {/* TOURIST GUIDE & INFORMATION DESK */}
                  {activeDistrictDetail.touristGuideInfo && (
                    <div className="bg-stone-850 p-3.5 rounded-xl border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-amber-400" />
                          <h4 className="text-xs font-bold text-amber-300">
                            {activeDistrictDetail.touristGuideInfo.contactName}
                          </h4>
                        </div>
                        <p className="text-[11px] text-stone-400">
                          Information Counter • Desk: {activeDistrictDetail.touristGuideInfo.deskLocation}
                        </p>
                      </div>
                      <a
                        href={`tel:${activeDistrictDetail.touristGuideInfo.phone}`}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-1 text-xs self-start sm:self-auto"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{activeDistrictDetail.touristGuideInfo.phone}</span>
                      </a>
                    </div>
                  )}

                  {/* Culture & Crafts */}
                  <div className="bg-stone-850 p-3 rounded-xl border border-stone-800">
                    <h4 className="text-xs font-bold text-purple-400 flex items-center gap-1.5 mb-1.5">
                      <Award className="w-3.5 h-3.5" />
                      Handloom, Art & Major Festivals:
                    </h4>
                    <p className="text-xs text-stone-300">
                      <strong>Crafts:</strong> {activeDistrictDetail.handicraftsAndArt.join(', ')}
                    </p>
                    <p className="text-xs text-stone-300 mt-1">
                      <strong>Festivals:</strong> {activeDistrictDetail.majorFestivals.join(', ')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                  <Compass className="w-12 h-12 text-stone-600 mb-3" />
                  <h4 className="text-sm font-semibold text-stone-200">Select any District</h4>
                  <p className="text-xs max-w-sm mt-1 text-stone-400">
                    Explore all 30 districts of Odisha with authentic cultural descriptions, hidden gems, hotels & stays, signature food spots, transport advice, hospitals, and certified tourist guides.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TEMPLE ETIQUETTE & DARSHAN */}
        {activeTab === 'temples' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="border-b border-stone-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-500" />
                Odisha Sacred Temple Protocol & Darshan Guidelines
              </h3>
              <p className="text-xs text-stone-400">
                Culturally respectful guidelines aligned with Shree Jagannath Temple Administration (SJTA) & ASI
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-stone-850 p-4 rounded-xl border border-stone-800 space-y-2">
                <h4 className="font-bold text-amber-400 text-sm">
                  Shree Jagannath Temple, Puri (ଶ୍ରୀମନ୍ଦିର)
                </h4>
                <ul className="text-xs text-stone-300 space-y-1.5 list-disc list-inside">
                  <li><strong>Dress Code:</strong> Clean traditional Indian attire (Dhoti-Kurta, Saree, Salwar). Non-leather footwear only.</li>
                  <li><strong>Prohibited Items:</strong> Mobile phones, cameras, smartwatches, leather belts/wallets are strictly banned past the Singhadwara.</li>
                  <li><strong>Mahaprasad (Abhada):</strong> Available daily after Bhoga (around 1:30 PM - 2:00 PM) at Ananda Bazaar inside the complex.</li>
                  <li><strong>Temple Priest &amp; Sevayat Guidance:</strong> Use authorized Temple Information Desks rather than unverified intermediaries.</li>
                </ul>
                <button
                  onClick={() => handleSendPrompt('Tell me about the Mahaprasad Rosaghara tradition and opening times in Puri Jagannath Temple')}
                  className="mt-2 text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  Ask Utkal Mitra about Puri Darshan <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-stone-850 p-4 rounded-xl border border-stone-800 space-y-2">
                <h4 className="font-bold text-amber-400 text-sm">
                  Lingaraj Temple, Bhubaneswar (ଏକାମ୍ର କ୍ଷେତ୍ର)
                </h4>
                <ul className="text-xs text-stone-300 space-y-1.5 list-disc list-inside">
                  <li><strong>Historical Origin:</strong> 11th-century Kalinga architectural masterpiece dedicated to Lord Harihara (Shiva & Vishnu).</li>
                  <li><strong>Entry Policy:</strong> Sanctum entry is reserved for followers of Sanatana Dharma. Non-Hindu visitors can view the complex from the designated Curzon viewing platform.</li>
                  <li><strong>Photography:</strong> Strict prohibition within the inner courtyard.</li>
                  <li><strong>Nearby sacred spots:</strong> Bindusagar Lake, Ananta Basudeva temple (famous for afternoon temple prasad).</li>
                </ul>
                <button
                  onClick={() => handleSendPrompt('Explain the architectural marvels and history of Ekamra Kshetra Lingaraj Temple')}
                  className="mt-2 text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  Ask Utkal Mitra about Lingaraj <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-stone-850 p-4 rounded-xl border border-stone-800 space-y-2">
                <h4 className="font-bold text-amber-400 text-sm">
                  Konark Sun Temple (ଅର୍କ କ୍ଷେତ୍ର - UNESCO)
                </h4>
                <ul className="text-xs text-stone-300 space-y-1.5 list-disc list-inside">
                  <li><strong>Timings & Tickets:</strong> 6:00 AM to 8:00 PM daily. Indian citizens: ₹40, Foreigners: ₹600. Children under 15 free.</li>
                  <li><strong>Sundial Wheels:</strong> 24 carved stone wheels represent hours of the day with spokes functioning as sundials.</li>
                  <li><strong>Evening Show:</strong> English & Odia Light & Sound Show at 7:00 PM / 8:00 PM.</li>
                  <li><strong>Mo Bus:</strong> Frequent direct AC buses (Route 71) connect Puri and Konark along the Marine Drive.</li>
                </ul>
                <button
                  onClick={() => handleSendPrompt('How do the sundial wheels at Konark Sun Temple tell exact time?')}
                  className="mt-2 text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  Ask Utkal Mitra about Konark <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-stone-850 p-4 rounded-xl border border-stone-800 space-y-2">
                <h4 className="font-bold text-amber-400 text-sm">
                  Biraja Temple (Jajpur) & Maa Samaleswari (Sambalpur)
                </h4>
                <ul className="text-xs text-stone-300 space-y-1.5 list-disc list-inside">
                  <li><strong>Biraja Khetra (Jajpur):</strong> Sacred Shakti Peetha where Navaratri Rath Yatra is uniquely celebrated for Goddess Biraja.</li>
                  <li><strong>Maa Samaleswari (Sambalpur):</strong> Western Odisha’s prime deity on the banks of Mahanadi, renovated with the SAMALEI heritage corridor.</li>
                  <li><strong>Nuakhai Harvest Festival:</strong> First grain offered to Maa Samaleswari with traditional Sambalpuri fervor.</li>
                </ul>
                <button
                  onClick={() => handleSendPrompt('Tell me about Shakti Peethas in Odisha: Biraja Temple, Taratarini and Samaleswari')}
                  className="mt-2 text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  Ask Utkal Mitra about Shakti Peethas <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GI TAGS & CUISINE TRAIL */}
        {activeTab === 'cuisine' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="border-b border-stone-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-500" />
                Odisha Geographical Indication (GI) Delicacies & Culinary Map
              </h3>
              <p className="text-xs text-stone-400">
                Direct farm & sweetmaker heritage across coastal, central and tribal districts
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                {
                  title: 'Nayagarh Chhena Poda',
                  odia: 'ନୟାଗଡ଼ ଛେନାପୋଡ଼',
                  district: 'Nayagarh',
                  desc: 'Pioneered in Dashapalla; slow-roasted fresh cottage cheese, cardamom, and sugar baked in sal leaves.',
                },
                {
                  title: 'Kendrapara Rasabali',
                  odia: 'କେନ୍ଦ୍ରାପଡ଼ା ରସାବଳୀ',
                  district: 'Kendrapara',
                  desc: 'GI-tagged dessert originating from Baladevjew Temple; deep-fried chenna patties simmered in thickened cardamom rabdi.',
                },
                {
                  title: 'Dhenkanal Magji',
                  odia: 'ଢେଙ୍କାନାଳ ମଗଜି',
                  district: 'Dhenkanal',
                  desc: 'GI-certified confection made from buffalo milk cheese, cardamom, and sugar with a distinctive dense melt-in-mouth texture.',
                },
                {
                  title: 'Mayurbhanj Mudhi Mansa',
                  odia: 'ମୁଢ଼ି ମାଂସ ଓ କାଇ ଚଟଣୀ',
                  district: 'Mayurbhanj',
                  desc: 'Signature crispy puffed rice soaked in mutton curry; complemented by the famous GI-tagged indigenous Kai (red weaver ant) chutney.',
                },
                {
                  title: 'Odisha Rasagola (GI)',
                  odia: 'ଓଡ଼ିଶା ରସଗୋଲା',
                  district: 'Puri / Cuttack / Pahala',
                  desc: 'Soft, light brown syrup cottage cheese sweet historically offered to Goddess Lakshmi during Niladri Bije at Shree Jagannath Temple.',
                },
                {
                  title: 'Koraput Arabica Coffee',
                  odia: 'କୋରାପୁଟ କଫି',
                  district: 'Koraput',
                  desc: 'High-altitude shade-grown Arabica coffee cultivated sustainably by tribal collectives in the mist-laden Deomali highlands.',
                },
                {
                  title: 'Kandhamal Organic Haldi',
                  odia: 'କନ୍ଧମାଳ ହଳଦୀ',
                  district: 'Kandhamal',
                  desc: 'GI-tagged golden turmeric prized worldwide for its intense aroma, natural medicinal qualities, and high curcumin content.',
                },
                {
                  title: 'Cuttack Dahibara Aloodum',
                  odia: 'କଟକ ଦହିବରା ଆଳୁଦମ',
                  district: 'Cuttack',
                  desc: 'Iconic street specialty: urad dal vadas in spiced thin yogurt water, topped with potato-ghuguni curry, sev, and coriander.',
                },
                {
                  title: 'Sambalpuri Pitha & Chaul Dhuda',
                  odia: 'ପିଠା ଓ ଚାଉଳ ଧୁଡ଼ା',
                  district: 'Sambalpur',
                  desc: 'Traditional rice-flour pitha with sweet coconut or savory fillings, prepared fresh during Nuakhai and Pushpuni festivals.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-stone-850 p-3.5 rounded-xl border border-stone-800 hover:border-amber-500/40 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{item.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-orange-950/60 text-orange-300 border border-orange-800">
                        {item.district}
                      </span>
                    </div>
                    <span className="text-xs text-amber-400 font-serif block mt-0.5">
                      {item.odia}
                    </span>
                    <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSendPrompt(`Tell me where to taste authentic ${item.title} in ${item.district} and the cultural preparation secrets.`)}
                    className="mt-3 text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    <span>Ask where to try</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: UTKALSURAKSHA HELPLINES */}
        {activeTab === 'safety' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="border-b border-stone-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                UtkalSuraksha 24/7 Safety Network & Emergency Helplines
              </h3>
              <p className="text-xs text-stone-400">
                Official verified state helplines, weather alert conduits & tourist police stations
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                {
                  title: 'All-in-One Emergency',
                  number: '112',
                  desc: 'Police, Fire and Ambulance response across all 30 districts of Odisha.',
                  color: 'text-red-400',
                },
                {
                  title: 'Tourist Police Odisha',
                  number: '06752-222074',
                  desc: 'Dedicated tourist assistance booths in Puri Sea Beach, Konark, and Bhubaneswar.',
                  color: 'text-amber-400',
                },
                {
                  title: 'Women Safety Helpline',
                  number: '181',
                  desc: 'Toll-free 24/7 dedicated support and counseling assistance for female travelers.',
                  color: 'text-pink-400',
                },
                {
                  title: 'Disaster & Weather Alert (SRC)',
                  number: '1070',
                  desc: 'Special Relief Commissioner Odisha emergency control room for cyclonic alerts.',
                  color: 'text-blue-400',
                },
                {
                  title: 'Railway Passenger Security',
                  number: '139',
                  desc: 'East Coast Railway (ECoR) emergency helpline for train travel issues.',
                  color: 'text-purple-400',
                },
                {
                  title: 'Highway Ambulance Network',
                  number: '108',
                  desc: 'Immediate emergency medical response on NH-16, NH-55, and state corridors.',
                  color: 'text-emerald-400',
                },
              ].map((help, idx) => (
                <div
                  key={idx}
                  className="bg-stone-850 p-4 rounded-xl border border-stone-800 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold text-stone-400">{help.title}</span>
                    <a
                      href={`tel:${help.number.replace(/[^0-9]/g, '')}`}
                      className={`text-xl font-extrabold ${help.color} font-mono block my-1 hover:underline`}
                    >
                      {help.number}
                    </a>
                    <p className="text-xs text-stone-300 leading-relaxed">{help.desc}</p>
                  </div>
                  <a
                    href={`tel:${help.number.replace(/[^0-9]/g, '')}`}
                    className="mt-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-stone-700"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Direct Call</span>
                  </a>
                </div>
              ))}
            </div>

            <div className="bg-stone-850 p-4 rounded-xl border border-stone-800 mt-4">
              <h4 className="font-bold text-white text-sm mb-2">
                Emergency Medical Centers Across All 5 Zones
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-300">
                <div className="p-2 rounded bg-stone-800">
                  <strong className="text-amber-400 block">Capital / Coastal:</strong>
                  AIIMS Bhubaneswar (0674-2476789), SCB Medical College Cuttack (0671-2414080)
                </div>
                <div className="p-2 rounded bg-stone-800">
                  <strong className="text-amber-400 block">Western Zone:</strong>
                  VIMSAR Burla / Sambalpur (0663-2430768), Bhima Bhoi Medical College Balangir
                </div>
                <div className="p-2 rounded bg-stone-800">
                  <strong className="text-amber-400 block">Southern Zone:</strong>
                  MKCG Medical College Berhampur (0680-2292746), SLN Medical College Koraput
                </div>
                <div className="p-2 rounded bg-stone-800">
                  <strong className="text-amber-400 block">Northern Zone:</strong>
                  Government Medical College Sundargarh, Fakir Mohan Medical College Balasore
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
