import React, { useState } from 'react';
import {
  EMERGENCY_CONTACTS,
  OFFLINE_PHRASES,
  buildOfflinePack,
} from '../utils/offlinePack';
import { ODISHA_HISTORICAL_STORIES } from '../data/odishaHistoricalStories';
import {
  Download,
  CheckCircle2,
  PhoneCall,
  Languages,
  Printer,
  X,
  AlertTriangle,
  WifiOff,
  Wifi,
} from 'lucide-react';

interface OfflineModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedTripNotes?: string;
  onPackUpdated: () => void;
}

export const OfflineModal: React.FC<OfflineModalProps> = ({
  isOpen,
  onClose,
  savedTripNotes,
  onPackUpdated,
}) => {
  const [packSaved, setPackSaved] = useState<boolean>(() => {
    return !!localStorage.getItem('utkalsarathi_offline_pack');
  });
  const [saveToast, setSaveToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveToDevice = () => {
    const pack = buildOfflinePack(savedTripNotes);
    const offlineStoriesSummary = ODISHA_HISTORICAL_STORIES.map((s) => ({
      id: s.id,
      title: s.title,
      odiaTitle: s.odiaTitle,
      hindiTitle: s.hindiTitle,
      district: s.district,
      audioTranscriptEn: s.audioTranscriptEn,
      audioTranscriptOr: s.audioTranscriptOr,
      audioTranscriptHi: s.audioTranscriptHi,
      documentedHistory: s.documentedHistory,
    }));
    try {
      localStorage.setItem('utkalsarathi_offline_pack', JSON.stringify(pack));
      localStorage.setItem('utkalsarathi_offline_stories_v1', JSON.stringify(offlineStoriesSummary));
      setPackSaved(true);
      onPackUpdated();
      setSaveToast(
        `Saved Offline Safety Pack + ${offlineStoriesSummary.length} Monument Text Chronicles to device storage.`
      );
      setTimeout(() => setSaveToast(null), 4000);
    } catch {
      setSaveToast('Device storage limit reached; core safety contacts saved.');
      setTimeout(() => setSaveToast(null), 4000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col text-stone-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-850 via-amber-950/60 to-stone-850 px-5 py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-md">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                Offline Travel &amp; Emergency Pack
              </h3>
              <p className="text-xs text-stone-400">
                Local cache for eco-sanctuaries, highways &amp; low-signal zones
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center font-bold"
            aria-label="Close offline modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {saveToast && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              {saveToast}
            </div>
          )}

          {/* Device Sync Status */}
          <div className="p-4 rounded-xl bg-stone-850 border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-stone-400 block font-medium">Local Storage Status:</span>
              <div className="flex items-center gap-2 mt-0.5">
                {packSaved ? (
                  <span className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Offline Pack &amp; 25 Monument Texts Cached Locally
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold text-sm flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Not Yet Cached Locally
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleSaveToDevice}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              {packSaved ? 'Refresh Device Cache' : 'Save to Device'}
            </button>
          </div>

          {/* Transparent Offline vs Online Capability Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-800/40 space-y-1.5">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Works 100% Offline</span>
              </div>
              <ul className="text-stone-300 space-y-1 text-[11px] list-disc pl-4">
                <li>30-District Hospitals, Police &amp; OSDMA Shelters</li>
                <li>25 Utkal Katha Trilingual Monument Chronicles &amp; 150 Volumes</li>
                <li>Deterministic Itinerary Generator, Transit Fares &amp; Phrasebook</li>
              </ul>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-950/25 border border-amber-800/40 space-y-1.5">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" />
                <span>Requires Internet Connection</span>
              </div>
              <ul className="text-stone-300 space-y-1 text-[11px] list-disc pl-4">
                <li>Cloud Neural Hindi &amp; Odia Gemini TTS Voice Narration</li>
                <li>Live Microphone Speech Transcription &amp; Cloud AI Chat</li>
                <li>WhatsApp Live GPS Link Sharing &amp; External Maps</li>
              </ul>
            </div>
          </div>

          {/* Saved Trip Summary if available */}
          {savedTripNotes && (
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs space-y-1">
              <span className="font-bold text-amber-300 uppercase tracking-wider block">
                Saved Itinerary Summary:
              </span>
              <p className="text-stone-300 leading-relaxed">{savedTripNotes}</p>
            </div>
          )}

          {/* Offline Emergency Pocket Card */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-stone-200 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-red-400" />
                Offline Emergency Hotlines Directory
              </h4>
              <button
                onClick={handlePrint}
                className="text-xs text-stone-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Wallet Card
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {EMERGENCY_CONTACTS.map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-lg bg-stone-850 border border-stone-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-stone-200 block">{c.name.split('(')[0]}</span>
                    <span className="text-[10px] text-stone-400">{c.odiaName}</span>
                  </div>
                  <span className="font-mono font-extrabold text-amber-400 ml-2">{c.number}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Essential Travel Phrasebook (Odia - English - Hindi) */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-stone-200 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-cyan-400" />
              Survival Odia Phrasebook for Travellers
            </h4>

            <div className="space-y-2.5">
              {OFFLINE_PHRASES.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-stone-850 border border-stone-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-100">{p.english}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-stone-800 text-stone-400 uppercase">
                      {p.category}
                    </span>
                  </div>

                  <div className="text-amber-300 font-semibold text-sm">{p.odia}</div>
                  <div className="text-stone-400 italic text-[11px]">
                    Pronunciation: &quot;{p.odiaPhonetic}&quot;
                  </div>
                  <div className="text-stone-400 text-[11px]">हिन्दी: {p.hindi}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-850 border-t border-stone-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
