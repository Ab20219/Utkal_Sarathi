import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  limit,
  orderBy
} from 'firebase/firestore';

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

const FIREBASE_CONFIG = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'gen-lang-client-0544007391.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'gen-lang-client-0544007391',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'gen-lang-client-0544007391.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '776144599923',
  appId: env.VITE_FIREBASE_APP_ID || ''
};

const FIRESTORE_DB_ID =
  env.VITE_FIRESTORE_DATABASE_ID ||
  'ai-studio-android-utkalsar-47b70c34-5223-4df1-8532-ae48353675b2';

export function isFirebaseWebConfigured() {
  return Boolean(
    FIREBASE_CONFIG.apiKey &&
      FIREBASE_CONFIG.apiKey.length > 10 &&
      FIREBASE_CONFIG.appId &&
      FIREBASE_CONFIG.appId.includes(':web:')
  );
}

let appInstance = null;
let authInstance = null;
let dbInstance = null;

function ensureFirebaseInitialized() {
  if (!isFirebaseWebConfigured()) return null;
  if (!appInstance) {
    appInstance = getApps().length > 0 ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance, FIRESTORE_DB_ID);
  }
  return { app: appInstance, auth: authInstance, db: dbInstance };
}

export function subscribeToAuth(callback) {
  const sdk = ensureFirebaseInitialized();
  if (!sdk) {
    callback({ configured: false, user: null });
    return () => {};
  }
  return onAuthStateChanged(sdk.auth, (user) => {
    callback({ configured: true, user });
  });
}

export async function signInWithGoogleWeb() {
  const sdk = ensureFirebaseInitialized();
  if (!sdk) {
    throw new Error(
      'Firebase Web App credentials (VITE_FIREBASE_API_KEY and VITE_FIREBASE_APP_ID) are not configured yet. Your data remains safely saved in this browser.'
    );
  }
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(sdk.auth, provider);
  const u = credential.user;

  // Upsert user profile strictly adhering to firestore.rules isValidUserProfile()
  await setDoc(
    doc(sdk.db, 'users', u.uid),
    {
      uid: u.uid,
      displayName: (u.displayName || 'Odisha Traveller').slice(0, 120),
      preferredLanguage: 'en',
      preferredVoice: 'odisha_sage_deep',
      updatedAt: Date.now()
    },
    { merge: true }
  );

  return u;
}

export async function signOutWeb() {
  const sdk = ensureFirebaseInitialized();
  if (!sdk) return;
  await signOut(sdk.auth);
}

export async function syncTripToFirestore(trip) {
  const sdk = ensureFirebaseInitialized();
  if (!sdk || !sdk.auth.currentUser) return false;
  const uid = sdk.auth.currentUser.uid;

  // Strictly matches firestore.rules isValidTrip(userId)
  await setDoc(doc(sdk.db, 'users', uid, 'trips', trip.id), {
    ownerId: uid,
    title: String(trip.title).slice(0, 160),
    days: Number(trip.days),
    budgetStyle: String(trip.budgetStyle).slice(0, 40),
    pace: String(trip.pace).slice(0, 40),
    districtsCsv: String(trip.districtsCsv).slice(0, 600),
    totalInr: Number(trip.totalInr),
    dayPlansJson: JSON.stringify(trip.dayPlans).slice(0, 30000),
    createdAt: Date.now()
  });
  return true;
}

export async function syncContactToFirestore(contact) {
  const sdk = ensureFirebaseInitialized();
  if (!sdk || !sdk.auth.currentUser) return false;
  const uid = sdk.auth.currentUser.uid;

  // Strictly matches firestore.rules isValidContact(userId)
  await setDoc(doc(sdk.db, 'users', uid, 'trustedContacts', contact.id), {
    ownerId: uid,
    name: String(contact.name).slice(0, 100),
    relation: String(contact.relation || 'Family').slice(0, 60),
    phone: String(contact.phone).slice(0, 30)
  });
  return true;
}

export async function submitModeratedHazardToFirestore(report) {
  const sdk = ensureFirebaseInitialized();
  if (!sdk || !sdk.auth.currentUser) return false;
  const uid = sdk.auth.currentUser.uid;

  // Strictly matches firestore.rules isValidSafetyReportCreate() -> verificationStatus MUST be 'Pending Moderation'
  await setDoc(doc(sdk.db, 'safetyReports', report.id), {
    authorId: uid,
    districtId: String(report.districtId || 'khordha').slice(0, 50),
    locationLabel: String(report.locationLabel).slice(0, 160),
    category: String(report.category).slice(0, 60),
    description: String(report.description).slice(0, 1200),
    severity: String(report.severity || 'Caution').slice(0, 30),
    verificationStatus: 'Pending Moderation',
    reportedAt: Date.now()
  });
  return true;
}

export async function fetchCommunityHazardsFromFirestore() {
  const sdk = ensureFirebaseInitialized();
  if (!sdk || !sdk.auth.currentUser) return [];
  const q = query(collection(sdk.db, 'safetyReports'), orderBy('reportedAt', 'desc'), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
