/**
 * UtkalSarathi Social & Friends Service ("Utkal Sangha")
 * Provides secure friend discovery, contact matching via SHA-256 HMAC,
 * friend requests, friendships, and blocking.
 */

export interface SocialProfile {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  homeDistrict?: string;
  travelStyle?: 'Heritage & Temples' | 'Nature & Eco-Tours' | 'Culinary & Crafts' | 'Backpacker';
  privacy: {
    allowContactDiscovery: boolean;
    showTripsToFriends: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequest {
  requestId: string;
  fromUserId: string;
  toUserId: string;
  fromDisplayName: string;
  fromUsername: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Friendship {
  friendshipId: string;
  friendUserId: string;
  displayName: string;
  username: string;
  homeDistrict?: string;
  travelStyle?: string;
  establishedAt: string;
}

export interface BlockedUser {
  blockId: string;
  blockedUserId: string;
  blockedUsername: string;
  createdAt: string;
}

const LOCAL_STORAGE_PROFILE_KEY = 'utkalsarathi_social_profile';
const LOCAL_STORAGE_FRIENDS_KEY = 'utkalsarathi_social_friends';
const LOCAL_STORAGE_REQUESTS_KEY = 'utkalsarathi_social_requests';
const LOCAL_STORAGE_BLOCKED_KEY = 'utkalsarathi_social_blocked';

// Fallback seed profile for initial launch & unauthenticated exploration
export function getDefaultSocialProfile(userId = 'traveller_current'): SocialProfile {
  return {
    userId,
    username: 'jagannath_seeker',
    displayName: 'Odisha Explorer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bio: 'Wanderer exploring Konark wheels, Chilika migratory birds, and Deomali trails.',
    homeDistrict: 'Khordha',
    travelStyle: 'Heritage & Temples',
    privacy: {
      allowContactDiscovery: true,
      showTripsToFriends: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Keyed HMAC-SHA256 for privacy-preserving phone matching without sending raw phone numbers
 */
export async function computeContactHmac(phoneNumber: string, salt = 'UtkalSarathi_Contact_Salt_2026'): Promise<string> {
  const normalized = phoneNumber.replace(/[^0-9+]/g, '');
  const enc = new TextEncoder();
  const keyData = enc.encode(salt);
  const msgData = enc.encode(normalized);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, msgData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

class SocialService {
  private profile: SocialProfile | null = null;

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      if (saved) {
        this.profile = JSON.parse(saved);
      } else {
        this.profile = getDefaultSocialProfile();
        this.saveProfile(this.profile);
      }
    } catch {
      this.profile = getDefaultSocialProfile();
    }
  }

  public getProfile(): SocialProfile {
    if (!this.profile) {
      this.profile = getDefaultSocialProfile();
    }
    return this.profile;
  }

  public saveProfile(updated: Partial<SocialProfile>): SocialProfile {
    const current = this.getProfile();
    this.profile = {
      ...current,
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(this.profile));
    } catch {
      // ignore
    }
    return this.profile;
  }

  public async getFriends(): Promise<Friendship[]> {
    try {
      const res = await fetch('/api/social/friends', {
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.friends)) return data.friends;
      }
    } catch {
      // fallback to storage
    }

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_FRIENDS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }

    // Default mock friends for demonstration
    const seedFriends: Friendship[] = [
      {
        friendshipId: 'fr_seed_1',
        friendUserId: 'user_aarav',
        displayName: 'Aarav Mohapatra',
        username: 'aarav_puri',
        homeDistrict: 'Puri',
        travelStyle: 'Heritage & Temples',
        establishedAt: '2026-10-15T10:00:00Z',
      },
      {
        friendshipId: 'fr_seed_2',
        friendUserId: 'user_priya',
        displayName: 'Priya Senapati',
        username: 'priya_koraput',
        homeDistrict: 'Koraput',
        travelStyle: 'Nature & Eco-Tours',
        establishedAt: '2026-10-20T14:30:00Z',
      },
    ];
    this.saveFriendsLocally(seedFriends);
    return seedFriends;
  }

  public saveFriendsLocally(friends: Friendship[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_FRIENDS_KEY, JSON.stringify(friends));
    } catch {
      // ignore
    }
  }

  public async getRequests(): Promise<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }> {
    try {
      const res = await fetch('/api/social/requests');
      if (res.ok) {
        const data = await res.json();
        return {
          incoming: data.incoming || [],
          outgoing: data.outgoing || [],
        };
      }
    } catch {
      // ignore
    }

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_REQUESTS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }

    const seedRequests = {
      incoming: [
        {
          requestId: 'req_seed_1',
          fromUserId: 'user_bikash',
          toUserId: this.getProfile().userId,
          fromDisplayName: 'Bikash Jena',
          fromUsername: 'bikash_mayurbhanj',
          status: 'pending' as const,
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ],
      outgoing: [],
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_REQUESTS_KEY, JSON.stringify(seedRequests));
    } catch {}
    return seedRequests;
  }

  public async sendRequest(targetUsername: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/social/requests/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: this.getProfile().userId,
          fromDisplayName: this.getProfile().displayName,
          fromUsername: this.getProfile().username,
          toUsername: targetUsername,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    // Local simulation
    const reqs = await this.getRequests();
    const newReq: FriendRequest = {
      requestId: `req_${Date.now()}`,
      fromUserId: this.getProfile().userId,
      toUserId: `user_${targetUsername}`,
      fromDisplayName: this.getProfile().displayName,
      fromUsername: this.getProfile().username,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    reqs.outgoing.push(newReq);
    try {
      localStorage.setItem(LOCAL_STORAGE_REQUESTS_KEY, JSON.stringify(reqs));
    } catch {}

    return { success: true, message: `Friend request sent to @${targetUsername}!` };
  }

  public async respondToRequest(requestId: string, action: 'accept' | 'reject' | 'cancel'): Promise<boolean> {
    try {
      const res = await fetch('/api/social/requests/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      });
      if (res.ok) return true;
    } catch {
      // fallback
    }

    const reqs = await this.getRequests();
    if (action === 'accept') {
      const found = reqs.incoming.find((r) => r.requestId === requestId);
      if (found) {
        const friends = await this.getFriends();
        friends.push({
          friendshipId: `fs_${Date.now()}`,
          friendUserId: found.fromUserId,
          displayName: found.fromDisplayName,
          username: found.fromUsername,
          homeDistrict: 'Odisha',
          establishedAt: new Date().toISOString(),
        });
        this.saveFriendsLocally(friends);
        reqs.incoming = reqs.incoming.filter((r) => r.requestId !== requestId);
      }
    } else if (action === 'reject') {
      reqs.incoming = reqs.incoming.filter((r) => r.requestId !== requestId);
    } else if (action === 'cancel') {
      reqs.outgoing = reqs.outgoing.filter((r) => r.requestId !== requestId);
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_REQUESTS_KEY, JSON.stringify(reqs));
    } catch {}
    return true;
  }

  public async removeFriend(friendUserId: string): Promise<boolean> {
    const friends = await this.getFriends();
    const updated = friends.filter((f) => f.friendUserId !== friendUserId);
    this.saveFriendsLocally(updated);
    return true;
  }

  public async blockUser(userId: string, username: string): Promise<boolean> {
    await this.removeFriend(userId);
    let blocked: BlockedUser[] = [];
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BLOCKED_KEY);
      if (saved) blocked = JSON.parse(saved);
    } catch {}
    blocked.push({
      blockId: `blk_${Date.now()}`,
      blockedUserId: userId,
      blockedUsername: username,
      createdAt: new Date().toISOString(),
    });
    try {
      localStorage.setItem(LOCAL_STORAGE_BLOCKED_KEY, JSON.stringify(blocked));
    } catch {}
    return true;
  }

  public async searchUsers(query: string): Promise<Array<{ userId: string; username: string; displayName: string; district: string }>> {
    if (!query || query.trim().length < 2) return [];

    try {
      const res = await fetch(`/api/social/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.users)) return data.users;
      }
    } catch {
      // fallback
    }

    const directory = [
      { userId: 'u_debashis', username: 'debashis_cuttack', displayName: 'Debashis Rout', district: 'Cuttack' },
      { userId: 'u_ananya', username: 'ananya_bhubaneswar', displayName: 'Ananya Pattnaik', district: 'Khordha' },
      { userId: 'u_sambit', username: 'sambit_rourkela', displayName: 'Sambit Kumar Das', district: 'Sundargarh' },
      { userId: 'u_manisha', username: 'manisha_berhampur', displayName: 'Manisha Panigrahi', district: 'Ganjam' },
      { userId: 'u_subham', username: 'subham_sambalpur', displayName: 'Subham Pradhan', district: 'Sambalpur' },
    ];

    const q = query.toLowerCase();
    return directory.filter((u) => u.username.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q));
  }

  public async matchContacts(phoneNumbers: string[]): Promise<Array<{ username: string; displayName: string }>> {
    // Generate keyed HMACs for each contact
    const hashes = await Promise.all(phoneNumbers.map((p) => computeContactHmac(p)));

    try {
      const res = await fetch('/api/social/contacts/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hashes }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.matches || [];
      }
    } catch {
      // fallback
    }

    return [
      { username: 'ananya_bhubaneswar', displayName: 'Ananya Pattnaik (In Contacts)' },
    ];
  }
}

export const socialService = new SocialService();
