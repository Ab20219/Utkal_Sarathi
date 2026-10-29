const { test, before, after, beforeEach } = require('node:test');
const fs = require('node:fs');
const { createRequire } = require('node:module');
const globalReq = createRequire('/usr/local/lib/node_modules/@firebase/rules-unit-testing/package.json');
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} = globalReq('@firebase/rules-unit-testing');
const {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  Timestamp,
} = globalReq('firebase/firestore');

const PROJECT_ID = 'demo-test';
const DATABASE_ID = 'ai-studio-android-utkalsar-47b70c34-5223-4df1-8532-ae48353675b2';

let testEnv;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: '127.0.0.1',
      port: 8085,
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

after(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

function dbForAuth(uid) {
  const ctx = uid ? testEnv.authenticatedContext(uid) : testEnv.unauthenticatedContext();
  return ctx.firestore(DATABASE_ID);
}

function validProfile(userId = 'alice') {
  return {
    userId,
    displayName: 'Abhishek Panda',
    languageCode: 'en',
    preferredVoice: 'Charon',
    speechSpeed: 1.0,
    hasCompletedOnboarding: true,
    favoriteDestinationIds: ['puri_jagannath', 'konark_sun_temple'],
    offlineDistrictIds: ['puri', 'khordha'],
    recentSearches: ['Konark', 'Koraput'],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

function validTrip(userId = 'alice') {
  return {
    userId,
    title: 'Khordha -> Puri Heritage Circuit (3D)',
    startingCity: 'Bhubaneswar',
    selectedDistrictIds: ['khordha', 'puri'],
    durationDays: 3,
    travelDatesLabel: 'Nov 2026',
    travellerCount: 2,
    tierPreference: 'Moderate',
    interests: ['Temples', 'GI Crafts'],
    totalEstimatedCostInr: 18500,
    costAssumptionsNote: 'Deterministic Estimate (Moderate tier, 2 travellers, 1 room).',
    daySlots: [
      {
        dayNumber: 1,
        districtName: 'Khordha',
        primaryStop: 'Lingaraj Temple',
        secondaryStop: 'Udayagiri & Khandagiri Caves',
        estimatedTravelKm: 28,
        estimatedDriveMinutes: 45,
        transportRecommendation: 'Pre-booked AC Cab',
        staySuggestion: 'OTDC Panthanivas Bhubaneswar',
        foodHighlight: 'temple Dalma & Pahala Rasagola',
        dayBudgetInr: 6200,
        userCustomNotes: 'Morning darshan',
      },
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

function validContact(userId = 'alice') {
  return {
    userId,
    name: 'Rakesh Panda',
    relation: 'Brother',
    phoneNumber: '+919876543210',
    createdAt: serverTimestamp(),
  };
}

function validStory(userId = 'alice') {
  return {
    userId,
    titleEn: 'Maritime Voyages of Ancient Kalinga Sadhabas',
    titleOdia: 'ପ୍ରାଚୀନ କଳିଙ୍ଗ ସାଧବଙ୍କ ନୌବାଣିଜ୍ୟ',
    titleHindi: 'प्राचीन कलिंग साधबों की समुद्री यात्रा',
    districtId: 'cuttack',
    destinationId: 'cuttack_barabati_maritime',
    destinationName: 'Odisha State Maritime Museum',
    category: 'Maritime History',
    historicalPeriod: 'Ancient & Early Medieval Kalinga',
    factClassification: 'Documented Historical Record',
    bodyEn: 'Ancient Kalinga mariners sailed Boita vessels from Tamralipti, Palur, and Chelitalo across the Bay of Bengal to Bali, Java, Sumatra, and Sri Lanka.',
    bodyOdia: '',
    bodyHindi: '',
    sourceReferences: 'Odisha State Maritime Museum & ASI Epigraphic Records',
    editorialStatus: 'AI Source-Grounded (Pending Editorial Review)',
    isAiGenerated: true,
    isFavorite: true,
    isOfflineSaved: true,
    contentHash: 'sha256_maritime_kalinga_001',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

function validSafetyReport(userId = 'alice') {
  return {
    userId,
    reportType: 'HAZARD',
    districtId: 'kandhamal',
    targetLabel: 'Kalinga Ghat Hairpin Bend 4',
    category: 'Dense Valley Fog',
    description: 'Heavy morning fog reducing visibility below 25 meters near Daringbadi approach.',
    severity: 'Caution',
    verificationStatus: 'User Submitted — Unverified (Pending Moderation)',
    createdAt: serverTimestamp(),
  };
}

test('Unauthenticated requests are denied across all collections and default catch-all', async () => {
  const unauthDb = dbForAuth(null);
  await assertFails(getDoc(doc(unauthDb, 'users', 'alice')));
  await assertFails(setDoc(doc(unauthDb, 'users', 'alice'), validProfile('alice')));
  await assertFails(getDocs(collection(unauthDb, 'users', 'alice', 'trips')));
  await assertFails(getDocs(collection(unauthDb, 'users', 'alice', 'trusted_contacts')));
  await assertFails(getDoc(doc(unauthDb, 'unknown_collection', 'doc1')));
});

test('UserProfile: owner CRUD succeeds; cross-user, shadow fields, invalid enums, and immutable mutations fail', async () => {
  const aliceDb = dbForAuth('alice');
  const bobDb = dbForAuth('bob');

  const profileRef = doc(aliceDb, 'users', 'alice');
  await assertSucceeds(setDoc(profileRef, validProfile('alice')));
  await assertSucceeds(getDoc(profileRef));

  // Cross-user read & write denied
  await assertFails(getDoc(doc(bobDb, 'users', 'alice')));
  await assertFails(updateDoc(doc(bobDb, 'users', 'alice'), { displayName: 'Hacked' }));
  await assertFails(deleteDoc(doc(bobDb, 'users', 'alice')));

  // Valid owner update succeeds
  await assertSucceeds(
    updateDoc(profileRef, {
      languageCode: 'or',
      preferredVoice: 'Orus',
      speechSpeed: 1.15,
      updatedAt: serverTimestamp(),
    })
  );

  // Immutable userId / createdAt mutation denied
  await assertFails(updateDoc(profileRef, { userId: 'bob', updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(profileRef, { createdAt: Timestamp.now(), updatedAt: serverTimestamp() }));

  // Shadow extra field injection denied
  await assertFails(updateDoc(profileRef, { isAdmin: true, updatedAt: serverTimestamp() }));

  // Out-of-bounds speechSpeed or unsupported languageCode denied
  await assertFails(updateDoc(profileRef, { speechSpeed: 3.0, updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(profileRef, { languageCode: 'fr', updatedAt: serverTimestamp() }));

  // Future timestamp on create denied
  const futureProfile = {
    ...validProfile('bob'),
    createdAt: Timestamp.fromMillis(Date.now() + 3600_000),
    updatedAt: serverTimestamp(),
  };
  await assertFails(setDoc(doc(bobDb, 'users', 'bob'), futureProfile));
});

test('SavedTrip: native daySlots CRUD succeeds; spoofed userId, empty daySlots, and cross-user access fail', async () => {
  const aliceDb = dbForAuth('alice');
  const bobDb = dbForAuth('bob');

  const tripRef = doc(aliceDb, 'users', 'alice', 'trips', 'trip_001');
  await assertSucceeds(setDoc(tripRef, validTrip('alice')));
  await assertSucceeds(getDoc(tripRef));
  await assertSucceeds(getDocs(collection(aliceDb, 'users', 'alice', 'trips')));

  // Cross-user list/get denied
  await assertFails(getDoc(doc(bobDb, 'users', 'alice', 'trips', 'trip_001')));
  await assertFails(getDocs(collection(bobDb, 'users', 'alice', 'trips')));

  // Spoofed userId denied
  await assertFails(setDoc(doc(aliceDb, 'users', 'alice', 'trips', 'trip_bad'), validTrip('bob')));

  // Empty daySlots denied
  await assertFails(
    setDoc(doc(aliceDb, 'users', 'alice', 'trips', 'trip_empty'), {
      ...validTrip('alice'),
      daySlots: [],
    })
  );

  // Valid update & delete by owner
  await assertSucceeds(
    updateDoc(tripRef, {
      totalEstimatedCostInr: 19200,
      updatedAt: serverTimestamp(),
    })
  );
  await assertSucceeds(deleteDoc(tripRef));
});

test('TrustedContact: PII isolated to owner; cross-user and invalid phone rejected', async () => {
  const aliceDb = dbForAuth('alice');
  const bobDb = dbForAuth('bob');

  const contactRef = doc(aliceDb, 'users', 'alice', 'trusted_contacts', 'contact_1');
  await assertSucceeds(setDoc(contactRef, validContact('alice')));
  await assertSucceeds(getDoc(contactRef));

  // Cross-user PII read rejected
  await assertFails(getDoc(doc(bobDb, 'users', 'alice', 'trusted_contacts', 'contact_1')));
  await assertFails(getDocs(collection(bobDb, 'users', 'alice', 'trusted_contacts')));

  // Short invalid phone rejected
  await assertFails(
    setDoc(doc(aliceDb, 'users', 'alice', 'trusted_contacts', 'contact_bad'), {
      ...validContact('alice'),
      phoneNumber: '1',
    })
  );
});

test('UserStory & SafetyReport: moderation lock and immutable contentHash enforced', async () => {
  const aliceDb = dbForAuth('alice');
  const bobDb = dbForAuth('bob');

  const storyRef = doc(aliceDb, 'users', 'alice', 'user_stories', 'katha_001');
  await assertSucceeds(setDoc(storyRef, validStory('alice')));

  // Updating favorite/offline succeeds, mutating contentHash fails
  await assertSucceeds(updateDoc(storyRef, { isFavorite: false, updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(storyRef, { contentHash: 'tampered_hash', updatedAt: serverTimestamp() }));

  // SafetyReport: valid Pending Moderation report succeeds
  const reportRef = doc(aliceDb, 'users', 'alice', 'safety_reports', 'rep_001');
  await assertSucceeds(setDoc(reportRef, validSafetyReport('alice')));

  // Spoofing Official Verified status is rejected by rules!
  await assertFails(
    setDoc(doc(aliceDb, 'users', 'alice', 'safety_reports', 'rep_spoof'), {
      ...validSafetyReport('alice'),
      verificationStatus: 'Official OSDMA Verified',
    })
  );

  // SafetyReport is append-only (update denied even for owner)
  await assertFails(updateDoc(reportRef, { severity: 'Urgent' }));

  // Cross-user access denied
  await assertFails(getDoc(doc(bobDb, 'users', 'alice', 'safety_reports', 'rep_001')));
});
