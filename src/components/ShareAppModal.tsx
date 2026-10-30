import React, { useState } from 'react';
import {
  Share2,
  X,
  Copy,
  Check,
  Download,
  Smartphone,
  Globe,
  MessageCircle,
  Send,
} from 'lucide-react';
import { getAppSharePayload, shareApplication } from '../utils/shareApp';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedApk, setCopiedApk] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const payload = getAppSharePayload();

  const handleNativeShare = async () => {
    const result = await shareApplication();
    if (result.success) {
      if (result.method === 'native') {
        onClose();
      } else if (result.method === 'clipboard') {
        setShareFeedback('Share text copied to clipboard!');
        setTimeout(() => setShareFeedback(null), 3000);
      }
    }
  };

  const copyToClipboard = async (text: string, type: 'link' | 'apk') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedApk(true);
        setTimeout(() => setCopiedApk(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${payload.title}\n\n${payload.text}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareToTelegram = () => {
    const text = encodeURIComponent(payload.title);
    const url = encodeURIComponent(payload.url);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
            <Share2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Share UtkalSarathi</h2>
          <p className="text-xs text-amber-100 mt-1 max-w-xs mx-auto">
            Inspire family and friends to discover Odisha’s 30 districts, sacred heritage, and traveller safety!
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {shareFeedback && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>{shareFeedback}</span>
            </div>
          )}

          {/* Primary Android Native Share Button */}
          <button
            onClick={handleNativeShare}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 group"
          >
            <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Share via Android Apps (WhatsApp, Gmail...)</span>
          </button>

          {/* Quick Social Hand-offs */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={shareToWhatsApp}
              className="py-2.5 px-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={shareToTelegram}
              className="py-2.5 px-3 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Telegram</span>
            </button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200 dark:border-stone-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white dark:bg-stone-900 text-stone-500 uppercase tracking-wider text-[10px]">
                Or Copy Direct Links
              </span>
            </div>
          </div>

          {/* Website Link */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              <span>Official Website URL</span>
            </label>
            <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800/80 p-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
              <span className="truncate flex-1 font-mono text-stone-700 dark:text-stone-300 select-all">
                {payload.url}
              </span>
              <button
                onClick={() => copyToClipboard(payload.url, 'link')}
                className="p-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-700 dark:text-stone-200 transition-colors"
                title="Copy Link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Direct APK Download Link */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct Android APK Download (35–50 MB)</span>
            </label>
            <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800/80 p-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
              <span className="truncate flex-1 font-mono text-stone-700 dark:text-stone-300 select-all">
                {payload.apkUrl}
              </span>
              <button
                onClick={() => copyToClipboard(payload.apkUrl, 'apk')}
                className="p-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-700 dark:text-stone-200 transition-colors"
                title="Copy APK Link"
              >
                {copiedApk ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 dark:bg-stone-800/40 border-t border-stone-100 dark:border-stone-800 text-center">
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            UtkalSarathi v2.4.0 • Made with pride for Odisha
          </p>
        </div>
      </div>
    </div>
  );
};
