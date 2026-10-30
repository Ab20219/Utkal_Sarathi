import React, { useState, useEffect } from 'react';
import {
  SavedItineraryRecord,
  DayPlan,
  loadSavedItineraries,
  saveItineraryRecord,
  deleteSavedItineraryRecord,
  duplicateSavedItineraryRecord,
} from '../utils/itinerary';
import { formatINR, TravelStyle } from '../utils/budget';
import {
  Bookmark,
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Copy,
  Share2,
  Printer,
  CheckCircle2,
  X,
  Compass,
  Download,
  AlertTriangle,
  Plus,
  Users,
  IndianRupee,
} from 'lucide-react';

interface SavedItinerariesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadItinerary: (itinerary: SavedItineraryRecord) => void;
  currentPlans: DayPlan[];
  currentConfig: {
    startCity: string;
    days: number;
    travelers: number;
    style: TravelStyle;
    tripScope: 'single' | 'nearby' | 'multi';
    selectedNearbyDistricts?: string[];
    selectedMultiDistricts?: string[];
    selectedInterests: string[];
    totalCost: number;
    targetBudget?: number;
  };
}

export const SavedItinerariesModal: React.FC<SavedItinerariesModalProps> = ({
  isOpen,
  onClose,
  onLoadItinerary,
  currentPlans,
  currentConfig,
}) => {
  const [savedList, setSavedList] = useState<SavedItineraryRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'save_new'>('list');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved list when opened
  useEffect(() => {
    if (isOpen) {
      const records = loadSavedItineraries();
      setSavedList(records);
      setNewTitle(
        `${currentConfig.days}-Day ${currentConfig.startCity} ${
          currentConfig.tripScope === 'multi' ? 'Circuit' : 'Odisha Tour'
        }`
      );
    }
  }, [isOpen, currentConfig]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (!isOpen) return null;

  const handleSaveCurrentTrip = () => {
    const finalTitle =
      newTitle.trim() ||
      `${currentConfig.days}-Day ${currentConfig.startCity} Odyssey`;
    const newRecord: SavedItineraryRecord = {
      id: `itinerary_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: finalTitle,
      createdAt: Date.now(),
      startCity: currentConfig.startCity,
      days: currentConfig.days,
      travelers: currentConfig.travelers,
      travelStyle: currentConfig.style,
      tripScope: currentConfig.tripScope,
      selectedNearbyDistricts: currentConfig.selectedNearbyDistricts,
      selectedMultiDistricts: currentConfig.selectedMultiDistricts,
      selectedInterests: currentConfig.selectedInterests,
      totalCost: currentConfig.totalCost,
      plans: currentPlans,
      targetBudget: currentConfig.targetBudget,
      notes: newNotes.trim() || undefined,
    };

    const updated = saveItineraryRecord(newRecord);
    setSavedList(updated);
    setActiveTab('list');
    showToast(`Saved "${finalTitle}" to your itineraries!`);
  };

  const handleDelete = (id: string) => {
    const updated = deleteSavedItineraryRecord(id);
    setSavedList(updated);
    setDeleteConfirmId(null);
    showToast('Itinerary removed from your collection.');
  };

  const handleDuplicate = (id: string) => {
    const updated = duplicateSavedItineraryRecord(id);
    setSavedList(updated);
    showToast('Itinerary duplicated successfully!');
  };

  const handleShareWhatsApp = (record: SavedItineraryRecord) => {
    const lines = [
      `🛕 *UtkalSarathi Odisha Travel Itinerary*`,
      `📍 *${record.title}*`,
      `📅 Duration: ${record.days} Days • 👥 Travelers: ${record.travelers} (${record.travelStyle.toUpperCase()})`,
      `💰 Estimated Budget: ${formatINR(record.totalCost)}`,
      `Starting District: ${record.startCity}`,
      ``,
      ...record.plans.map(
        (p) =>
          `*Day ${p.dayNumber}*: ${p.title}\n${p.destinations
            .map((d) => `  • ${d.destination.name} (${d.timeSlot.split(' ')[0]})`)
            .join('\n')}`
      ),
      ``,
      `Plan your complete Odisha journey on UtkalSarathi!`,
    ];

    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      lines.join('\n')
    )}`;
    window.open(shareUrl, '_blank');
  };

  const handlePrint = (record: SavedItineraryRecord) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Pop-up blocked. Please allow pop-ups to print itinerary.');
      return;
    }

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${record.title} - UtkalSarathi</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #1c1917; max-width: 800px; margin: auto; }
            h1 { color: #b45309; border-bottom: 2px solid #f59e0b; padding-bottom: 8px; margin-bottom: 4px; }
            .meta { font-size: 14px; color: #57534e; margin-bottom: 24px; }
            .day-card { border: 1px solid #d6d3d1; border-radius: 12px; margin-bottom: 20px; padding: 16px; page-break-inside: avoid; }
            .day-header { font-weight: bold; font-size: 16px; color: #78350f; margin-bottom: 12px; }
            .slot { margin-bottom: 12px; padding-left: 12px; border-left: 3px solid #d97706; }
            .slot-time { font-weight: bold; font-size: 13px; color: #92400e; }
            .slot-name { font-size: 15px; font-weight: 600; margin: 2px 0; }
            .slot-desc { font-size: 13px; color: #44403c; line-height: 1.4; }
            .transit { font-size: 12px; color: #047857; margin-top: 4px; }
            .budget-summary { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 16px; margin-top: 24px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>${record.title}</h1>
          <div class="meta">
            <strong>Duration:</strong> ${record.days} Days |
            <strong>Travelers:</strong> ${record.travelers} |
            <strong>Starting District:</strong> ${record.startCity} |
            <strong>Estimated Total Cost:</strong> ${formatINR(record.totalCost)}
          </div>
          ${record.plans
            .map(
              (day) => `
            <div class="day-card">
              <div class="day-header">Day ${day.dayNumber}: ${day.title}</div>
              ${day.destinations
                .map(
                  (slot) => `
                <div class="slot">
                  <div class="slot-time">${slot.timeSlot}</div>
                  <div class="slot-name">${slot.destination.name} (${slot.destination.odiaName})</div>
                  <div class="slot-desc">${slot.activity}</div>
                  <div class="transit">Transit: ${slot.transportFromPrevious}</div>
                </div>
              `
                )
                .join('')}
            </div>
          `
            )
            .join('')}
          <div class="budget-summary">
            <strong>Estimated Total Budget:</strong> ${formatINR(record.totalCost)} (~${formatINR(
      Math.round(record.totalCost / Math.max(1, record.travelers))
    )} per person). Grounded in verified government fares and standard OTDC tariffs.
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-stone-900 border border-stone-750 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-stone-100">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Saved Itineraries Manager</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {savedList.length} Saved
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Manage, export, print, or share your custom Odisha travel routes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center font-bold text-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-stone-800 bg-stone-900 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>My Saved Routes ({savedList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('save_new')}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'save_new'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save Active Itinerary</span>
          </button>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="mx-5 mt-3 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'save_new' ? (
            <div className="space-y-4">
              <div className="bg-stone-850 border border-stone-750 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Trip Overview Preview
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {formatINR(currentConfig.totalCost)}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-stone-900/80 p-2 rounded-lg border border-stone-800">
                    <span className="text-stone-400 block text-[10px]">Starting District</span>
                    <strong className="text-stone-200">{currentConfig.startCity}</strong>
                  </div>
                  <div className="bg-stone-900/80 p-2 rounded-lg border border-stone-800">
                    <span className="text-stone-400 block text-[10px]">Duration</span>
                    <strong className="text-stone-200">{currentConfig.days} Days</strong>
                  </div>
                  <div className="bg-stone-900/80 p-2 rounded-lg border border-stone-800">
                    <span className="text-stone-400 block text-[10px]">Travelers</span>
                    <strong className="text-stone-200">{currentConfig.travelers} Pax</strong>
                  </div>
                  <div className="bg-stone-900/80 p-2 rounded-lg border border-stone-800">
                    <span className="text-stone-400 block text-[10px]">Style</span>
                    <strong className="text-stone-200 capitalize">{currentConfig.style}</strong>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Itinerary Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 3-Day Golden Triangle Pilgrimage"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Personal Travel Notes & Preferences (Optional)
                </label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g., Early morning Puri Jagannath darshan, booked OTDC Panthanivas, prefer vegetarian Odia meals."
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveCurrentTrip}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Bookmark className="w-4 h-4" />
                <span>Save Current Itinerary</span>
              </button>
            </div>
          ) : (
            /* Saved List Tab */
            <div className="space-y-3">
              {savedList.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-stone-800 text-stone-500 mx-auto flex items-center justify-center">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-stone-300 text-sm">
                    No Saved Itineraries Yet
                  </h4>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    Save your current customized plan to access it offline, export for travel, or share directly to WhatsApp.
                  </p>
                  <button
                    onClick={() => setActiveTab('save_new')}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                  >
                    Save Active Plan Now
                  </button>
                </div>
              ) : (
                savedList.map((record) => (
                  <div
                    key={record.id}
                    className="bg-stone-850 border border-stone-750 hover:border-amber-500/40 rounded-2xl p-4 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-stone-100 text-sm sm:text-base">
                          {record.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-stone-400">
                          <span>
                            {new Date(record.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span>•</span>
                          <span className="text-amber-400 font-semibold">
                            {record.startCity}
                          </span>
                          <span>•</span>
                          <span>{record.days} Days</span>
                          <span>•</span>
                          <span>{record.travelers} Pax ({record.travelStyle})</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-extrabold text-amber-400">
                          {formatINR(record.totalCost)}
                        </div>
                        <span className="text-[10px] text-stone-400">
                          ~{formatINR(Math.round(record.totalCost / Math.max(1, record.travelers)))} / pax
                        </span>
                      </div>
                    </div>

                    {record.notes && (
                      <p className="text-xs text-stone-300 bg-stone-900/60 p-2 rounded-lg border border-stone-800/80 italic">
                        "{record.notes}"
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            onLoadItinerary(record);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Load to Planner</span>
                        </button>
                        <button
                          onClick={() => handleDuplicate(record.id)}
                          title="Duplicate Itinerary"
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white border border-stone-700 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleShareWhatsApp(record)}
                          title="Share to WhatsApp"
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          onClick={() => handlePrint(record)}
                          title="Print or Export PDF"
                          className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-400" />
                          <span>Print</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(record.id)}
                          title="Delete Itinerary"
                          className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-800/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Delete Confirmation Dialog */}
                    {deleteConfirmId === record.id && (
                      <div className="p-3 rounded-xl bg-red-950/70 border border-red-700 text-xs text-red-200 flex items-center justify-between gap-2 animate-fade-in">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                          <span>Delete "{record.title}"?</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2.5 py-1 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
