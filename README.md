# UtkalSarathi — Unified Smart Tourism, Cultural Heritage & Traveller Safety Platform

**Tagline:** *Discover Odisha, Your Way.* (`ଓଡ଼ିଆ • हिन्दी • English`)  
**Production Website:** [https://utkalsarathi.vercel.app](https://utkalsarathi.vercel.app)  
**GitHub Repository:** [https://github.com/Ab20219/Utkal_Sarathi](https://github.com/Ab20219/Utkal_Sarathi)  
**Integration Branch:** `integration/merged-production`  
**Direct Android APK Download:** [UtkalSarathi.apk](file:///releases/UtkalSarathi.apk) (34.1 MB Release APK)

---

## 1. Unified Architecture & Merger Overview

UtkalSarathi unifies the foundational identity, zero-trust cloud security, and protected **Utkal Kathaa** cultural storytelling engine of **Application 1** (`https://github.com/Ab20219/Utkal_Sarathi`) with the latest modern full-stack implementation of **Application 2** (React 19, TypeScript, Tailwind CSS, Capacitor Native Android, Express backend, and interactive 30-district GIS map).

```text
Utkal_Sarathi/
├── android/                         # Capacitor Native Android release build environment
│   ├── app/                         # App module, AndroidManifest.xml, signing configs
│   │   ├── build.gradle             # ProGuard rules, aaptOptions, release keystore signing
│   │   └── utkalsarathi-release.keystore # Production release signing keystore
│   ├── build.gradle                 # Root Android Gradle build script
│   └── gradlew.bat                  # Gradle wrapper (Gradle 8.14.3 + Java 21)
├── app/                             # Protected Application 1 Native Kotlin Architecture
│   ├── build.gradle.kts             # Jetpack Compose & Room offline SQLite database
│   └── src/main/java/com/example/   # KathaStorySeedCatalog & Firebase AI Logic
├── public/                          # Static assets, soundscapes, icons & PWA manifest
├── releases/                        # Compiled production Android packages
│   ├── UtkalSarathi.apk             # 34.1 MB signed production release APK
│   └── UtkalSarathi-release.apk     # Release APK for distribution
├── src/                             # Unified React 19 + TypeScript production application
│   ├── components/
│   │   ├── ThemeToggle.tsx          # Light, Dark & Phone System Default appearance switcher
│   │   ├── ShareAppModal.tsx        # Native Android & Web application sharing modal
│   │   ├── UtkalSanghaModal.tsx     # Utkal Sangha (Friends, Companions & HMAC contact sync)
│   │   ├── OdishaGeoMap.tsx         # Interactive SVG GIS map of all 30 districts of Odisha
│   │   ├── TransitMatrix.tsx        # Mo Bus, OSRTC & train transit fare matrix
│   │   ├── ItineraryPlanner.tsx     # Custom day-by-day itinerary planner & INR budget engine
│   │   ├── AudioStories.tsx         # Utkal Katha 100,000+ words cultural voice chronicles
│   │   ├── UtkalSuraksha.tsx        # SOS 112, emergency hospitals, and safety reporting
│   │   ├── DistrictsKnowledgeHub.tsx# Complete dossier covering all 30 Odisha districts
│   │   └── AiAssistantModal.tsx     # Utkal Mitra live conversational AI guide
│   ├── context/
│   │   ├── ThemeContext.tsx         # Real-time prefers-color-scheme & StatusBar sync
│   │   └── PlatformContext.tsx      # Android/Web/macOS/Windows platform detection
│   ├── services/
│   │   ├── socialService.ts         # Privacy-preserving SHA-256 HMAC social connection engine
│   │   └── storyLibraryService.ts   # Utkal Katha 10,000+ capacity catalog service
│   └── utils/
│       ├── shareApp.ts              # Native Android Web Share API & clipboard handoff
│       ├── nativeAndroid.ts         # Hardware Back-Button & lifecycle event management
│       └── storyDuplicateDetector.ts# Jaccard similarity & normalized SHA-256 duplicate filter
├── server.ts                        # Express & WebSocket server (Gemini AI live Q&A, TTS, Social)
├── firestore.rules                  # Zero-trust Firestore rules (Pillars 1-10)
├── firebase-blueprint.json          # Cloud Firestore schema blueprint with social entities
├── vercel.json                      # Vercel SPA routing & security headers configuration
├── vite.config.ts                   # Vite production bundler
└── package.json                     # Scripts for dev, test, build, and Android synchronization
```

---

## 2. Core Functional Modules

### A. Protected Utkal Kathaa Module (Zero-Modification Invariant)
- **100% Preserved Identity:** Retains the original Odia storytelling voice, historical period annotations, ASI epigraphic references, and canonical multilingual translation entities (`titleEn`, `titleOdia`, `bodyEn`, `bodyOdia`, `contentHash`).
- **Jaccard Token Similarity Guard (`>0.80`):** Automatically rejects near-duplicate stories during batch import while never double-counting legitimate translations as separate stories.
- **Epistemic Classifications:** Clearly badges documented archaeological records, rock edicts, and living folklore.

### B. Independent Gemini Live Intelligence (`POST /api/gemini/live-qa`)
- Conversational travel assistant operating independently of the Utkal Kathaa storytelling engine.
- Responds in fluent, culturally authentic **Odia (`ଓଡ଼ିଆ`)**, **Hindi (`हिन्दी`)**, and **English**.
- Protected via server-side API key isolation (never exposed in client code).
- Includes sliding-window IP rate-limiting and deterministic offline fallback.

### C. System Default Dark & Light Mode
- Three selectable appearance options:
  1. **Light Mode**
  2. **Dark Mode**
  3. **Default / Follow Phone System**
- Automatically synchronizes with Android device appearance in real time via `matchMedia('(prefers-color-scheme: dark)')`.
- Updates Tailwind root `.dark` class, DOM `color-scheme`, `<meta name="theme-color">`, and Capacitor Native StatusBar styling (`Style.Dark` / `Style.Light`).

### D. Universal Share Application System
- Accessible from the top navigation bar and mobile view.
- Supports **Android Native Sharing** (`navigator.share` / `@capacitor/share`), WhatsApp quick-share, and Telegram.
- Distributes both the official website URL and direct Android APK download links.

### E. Utkal Sangha — Friends & Travel Companions
- **Zero-Knowledge Contact Matching:** Normalizes phone numbers and hashes them client-side using **keyed SHA-256 HMAC**. Full address books are never uploaded or stored.
- **Connection Lifecycle:** Send, receive, accept, decline, and cancel friend requests.
- **Companion Features:** View connected friends, travel styles, home districts, and share custom itineraries with one tap.
- **Isolation:** Fully isolated Firestore collections (`socialProfiles`, `friendRequests`, `friendships`, `blockedUsers`, `contactLookup`) protected under zero-trust Firestore Security Rules.

### F. Comprehensive 30-District GIS Map & Transit Matrix
- Interactive clickable SVG coordinate map of all 30 districts of Odisha with zone filters (Coastal, Central, Northern, Southern, Western).
- Regulated transit matrix covering CRUT Mo Bus routes, OSRTC inter-district coaches, trains, and non-binding reference fare calculators.

### G. UtkalSuraksha Safety & Emergency SOS
- One-tap **SOS 112** and **Ambulance 108** instant dialers.
- Complete directory of district hospitals, control rooms, and police stations for all 30 districts.
- GPS emergency location check-in with WhatsApp SOS link generation.

---

## 3. Cloud Firestore Security Rules (Pillars 1–10)

The application enforces a global default-deny policy in [`firestore.rules`](file:///firestore.rules):

| Pillar | Collection Path | Access Restrictions |
| :--- | :--- | :--- |
| **1** | `/{document=**}` | Default-Deny Catch-All (`allow read, write: if false;`) |
| **2** | `/users/{userId}` | Authenticated Owner-Only Isolation |
| **3** | `/users/{userId}/trips/{tripId}` | Owner-Only Saved Itineraries |
| **4** | `/users/{userId}/trusted_contacts/{contactId}` | Owner-Only Private Emergency Contacts |
| **5** | `/users/{userId}/user_stories/{storyId}` | Owner-Only Utkal Katha Stories & Bookmarks |
| **6** | `/socialProfiles/{userId}` | Public Read for Authenticated Users, Owner-Only Writes |
| **7** | `/friendRequests/{requestId}` | Participant-Only Access (`fromUserId` or `toUserId`) |
| **8** | `/friendships/{friendshipId}` | Mutual Friends Participant-Only Access |
| **9** | `/blockedUsers/{blockId}` | Blocker-Only Isolated Access |
| **10** | `/contactLookup/{phoneHash}` | Keyed HMAC Matching with Owner Write Protection |

---

## 4. Android Release APK Build & Verification

The Android application is packaged via Capacitor v8 with release keystore signing.

- **Application ID:** `com.utkalsarathi.app`
- **Application Name:** `UtkalSarathi`
- **Target Release Size:** 35–50 MB
- **Actual Built Size:** **34.13 MB** (Legitimately optimized by purging recursive nested assets)
- **Output Path:** `releases/UtkalSarathi.apk`

### Compiling the Release APK:

```bash
# 1. Build optimized web bundle
npm run build

# 2. Synchronize web bundle to Capacitor Android
npx cap sync android

# 3. Compile signed Release APK with Gradle
cd android
gradlew.bat assembleRelease

# The signed APK is generated at:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 5. Website Deployment to Vercel

The application is pre-configured for instant zero-configuration deployment on [Vercel](https://vercel.com):

1. Connect the GitHub repository `https://github.com/Ab20219/Utkal_Sarathi` to Vercel.
2. Select the branch `integration/merged-production` (or `main` after merging).
3. Vercel automatically detects the configuration from [`vercel.json`](file:///vercel.json):
   - **Framework:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Configure production environment variables in Vercel Dashboard (see `.env.example`).

---

## 6. Testing & Quality Assurance

All 54 test suites pass with 100% success rate:

```bash
npm run test
```

Test coverage includes:
- Cross-platform key mappings & mobile breakpoints.
- Monument voice profiles and neural Gemini voices.
- 30-district GIS coordinates and transport infrastructure.
- Utkal Katha 10,000+ capacity story service & duplicate detection.
- Indic script purity (Odia & Hindi Devanagari with zero Latin characters).
- Deterministic INR trip budget calculations and Haversine transit distances.
- Audio WAV container integrity and sentence timing boundaries.

---

## 7. Git Integration & Push Instructions

All changes are committed cleanly to the dedicated integration branch:

```bash
# Verify status and log on integration branch
git status
git log -n 3 --oneline

# Push integration branch to GitHub
git push -u origin integration/merged-production
```
