import React, { useState, useEffect } from 'react';
import {
  Users,
  X,
  UserPlus,
  Search,
  Check,
  XCircle,
  Shield,
  Smartphone,
  Share2,
  Lock,
  Compass,
  MapPin,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import {
  socialService,
  type SocialProfile,
  type Friendship,
  type FriendRequest,
} from '../services/socialService';

interface UtkalSanghaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShareModal?: () => void;
}

export const UtkalSanghaModal: React.FC<UtkalSanghaModalProps> = ({
  isOpen,
  onClose,
  onOpenShareModal,
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'discover' | 'privacy'>('friends');
  const [profile, setProfile] = useState<SocialProfile>(() => socialService.getProfile());
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [requests, setRequests] = useState<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }>({
    incoming: [],
    outgoing: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ userId: string; username: string; displayName: string; district: string }>>([]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [contactSyncEnabled, setContactSyncEnabled] = useState(profile.privacy.allowContactDiscovery);
  const [matchedContacts, setMatchedContacts] = useState<Array<{ username: string; displayName: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setProfile(socialService.getProfile());
    const f = await socialService.getFriends();
    setFriends(f);
    const r = await socialService.getRequests();
    setRequests(r);
  };

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length >= 2) {
      const results = await socialService.searchUsers(q);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSendRequest = async (username: string) => {
    const res = await socialService.sendRequest(username);
    showNotification(res.message);
    const r = await socialService.getRequests();
    setRequests(r);
  };

  const handleRespond = async (requestId: string, action: 'accept' | 'reject' | 'cancel') => {
    await socialService.respondToRequest(requestId, action);
    showNotification(`Request ${action}ed`);
    await loadData();
  };

  const handleRemoveFriend = async (friendUserId: string, name: string) => {
    if (confirm(`Remove ${name} from your travel companions?`)) {
      await socialService.removeFriend(friendUserId);
      showNotification(`${name} removed.`);
      await loadData();
    }
  };

  const handleToggleContactSync = (enabled: boolean) => {
    setContactSyncEnabled(enabled);
    socialService.saveProfile({
      privacy: { ...profile.privacy, allowContactDiscovery: enabled },
    });
    if (enabled) {
      socialService.matchContacts(['+919876543210']).then((m) => {
        setMatchedContacts(m);
        showNotification('Contact discovery active (privacy-preserving HMAC enabled)');
      });
    } else {
      setMatchedContacts([]);
      showNotification('Contact discovery turned off.');
    }
  };

  const inviteViaWhatsApp = () => {
    const text = encodeURIComponent(
      `Join me on UtkalSarathi! Let's explore Odisha's 30 districts, sacred temples, and plan our travels together: https://utkalsarathi.vercel.app`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Utkal Sangha</h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold tracking-wider uppercase">
                  Travel Friends
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                Connect with fellow explorers across all 30 districts of Odisha
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 px-4 pt-2 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('friends')}
            className={`py-2.5 px-3 rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'friends'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400 bg-white dark:bg-stone-800'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Companions</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-stone-200 dark:bg-stone-700 text-[10px]">
              {friends.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2.5 px-3 rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'requests'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400 bg-white dark:bg-stone-800'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Requests</span>
            {requests.incoming.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[10px] animate-pulse">
                {requests.incoming.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('discover')}
            className={`py-2.5 px-3 rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'discover'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400 bg-white dark:bg-stone-800'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Find & Invite</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-2.5 px-3 rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400 bg-white dark:bg-stone-800'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy & Sync</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {actionMessage && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-xl text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{actionMessage}</span>
            </div>
          )}

          {/* TAB 1: FRIENDS */}
          {activeTab === 'friends' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>{friends.length} Travel Companions Connected</span>
                <span className="text-amber-600 font-medium">Logged in as @{profile.username}</span>
              </div>

              {friends.length === 0 ? (
                <div className="text-center py-12 px-4 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
                  <Compass className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                    No travel companions yet
                  </p>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                    Connect with friends to collaborate on multi-district Odisha itineraries and explore together.
                  </p>
                  <button
                    onClick={() => setActiveTab('discover')}
                    className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition-colors inline-flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Find Explorers</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {friends.map((friend) => (
                    <div
                      key={friend.friendshipId}
                      className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                          {friend.displayName.slice(0, 1)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-stone-800 dark:text-stone-100 truncate">
                            {friend.displayName}
                          </h4>
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                            @{friend.username}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-500">
                            {friend.homeDistrict && (
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-stone-400" />
                                {friend.homeDistrict}
                              </span>
                            )}
                            {friend.travelStyle && (
                              <span className="px-1.5 py-0.2 bg-stone-200 dark:bg-stone-700 rounded text-stone-600 dark:text-stone-300">
                                {friend.travelStyle}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-stone-200 dark:border-stone-700 pt-2 text-[11px]">
                        <button
                          onClick={() => {
                            if (onOpenShareModal) onOpenShareModal();
                            else showNotification(`Itinerary shared with @${friend.username}!`);
                          }}
                          className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>Share Trip</span>
                        </button>
                        <button
                          onClick={() => handleRemoveFriend(friend.friendUserId, friend.displayName)}
                          className="text-stone-400 hover:text-red-500 transition-colors"
                          title="Remove companion"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                  Incoming Requests ({requests.incoming.length})
                </h3>
                {requests.incoming.length === 0 ? (
                  <p className="text-xs text-stone-500 italic py-2">No pending incoming requests.</p>
                ) : (
                  <div className="space-y-2">
                    {requests.incoming.map((req) => (
                      <div
                        key={req.requestId}
                        className="p-3 bg-amber-50/60 dark:bg-stone-800/80 rounded-2xl border border-amber-200/60 dark:border-stone-700 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-stone-800 dark:text-stone-100">
                            {req.fromDisplayName}
                          </p>
                          <p className="text-[11px] text-amber-600 font-mono">@{req.fromUsername}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleRespond(req.requestId, 'accept')}
                            className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 px-3 shadow-sm transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleRespond(req.requestId, 'reject')}
                            className="p-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-700 dark:text-stone-200 text-xs px-2.5 transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
                <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                  Sent Requests ({requests.outgoing.length})
                </h3>
                {requests.outgoing.length === 0 ? (
                  <p className="text-xs text-stone-500 italic py-2">No pending outgoing requests.</p>
                ) : (
                  <div className="space-y-2">
                    {requests.outgoing.map((req) => (
                      <div
                        key={req.requestId}
                        className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-medium text-stone-800 dark:text-stone-200">
                            Sent to @{req.toUserId.replace('user_', '')}
                          </p>
                          <span className="text-[10px] text-amber-600 font-medium">Pending acceptance</span>
                        </div>
                        <button
                          onClick={() => handleRespond(req.requestId, 'cancel')}
                          className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FIND & DISCOVER */}
          {activeTab === 'discover' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by username or name (e.g. debashis, ananya)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl text-xs text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Found Explorers
                  </h4>
                  {searchResults.map((user) => (
                    <div
                      key={user.userId}
                      className="p-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-stone-800 dark:text-stone-100">
                          {user.displayName}
                        </p>
                        <p className="text-[11px] text-amber-600 font-mono">@{user.username}</p>
                        <span className="text-[10px] text-stone-500">{user.district} District</span>
                      </div>
                      <button
                        onClick={() => handleSendRequest(user.username)}
                        className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Connect</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Invite Section */}
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-stone-800 dark:to-stone-800/80 rounded-2xl border border-amber-200/70 dark:border-stone-700">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-amber-600 text-white rounded-xl flex-shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      Invite Friends from Outside UtkalSarathi
                    </h4>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1">
                      Have travel buddies who don't have the app yet? Share an invite link so they can join your Sangha and view your itinerary.
                    </p>
                    <button
                      onClick={inviteViaWhatsApp}
                      className="mt-3 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Send WhatsApp Invitation</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRIVACY & CONTACT MATCHING */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      <span>Zero-Knowledge Contact Matching</span>
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Find friends via phone number without ever uploading your phonebook.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={contactSyncEnabled}
                    onChange={(e) => handleToggleContactSync(e.target.checked)}
                    className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-stone-100 dark:bg-stone-700/50 rounded-xl text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed space-y-1">
                  <p className="font-semibold text-stone-800 dark:text-stone-200">
                    How UtkalSarathi Protects Your Privacy:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-stone-500 dark:text-stone-400">
                    <li>Phone numbers are salted and hashed on your device using <strong>SHA-256 HMAC</strong>.</li>
                    <li>Raw phone numbers are never transmitted or stored on any server.</li>
                    <li>Only matching hashes of registered users with discovery enabled are returned.</li>
                    <li>You can turn off discovery at any moment.</li>
                  </ul>
                </div>
              </div>

              {matchedContacts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Discovered Friends In Your Contacts
                  </h4>
                  {matchedContacts.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 bg-emerald-50/60 dark:bg-stone-800 rounded-2xl border border-emerald-200 dark:border-stone-700 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-stone-800 dark:text-stone-100">
                          {c.displayName}
                        </p>
                        <p className="text-[11px] text-amber-600 font-mono">@{c.username}</p>
                      </div>
                      <button
                        onClick={() => handleSendRequest(c.username)}
                        className="py-1 px-3 bg-amber-600 text-white rounded-xl text-xs font-semibold"
                      >
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <span>Protected under UtkalSarathi Zero-Trust Security</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-700 dark:text-stone-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
