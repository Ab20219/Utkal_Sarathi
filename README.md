# UtkalSarathi — Smart Tourism, Cultural Heritage & Traveller Safety for Odisha

**Tagline:** *Discover Odisha, Your Way.* (`ଓଡ଼ିଆ • हिन्दी • English`)  
**Target Production Website:** [https://utkalsarathi.vercel.app](https://utkalsarathi.vercel.app)  
**GitHub Repository:** [https://github.com/Ab20219/Utkal_Sarathi](https://github.com/Ab20219/Utkal_Sarathi)

UtkalSarathi is a dual-target smart tourism and traveller-safety platform covering **all 30 official districts of Odisha**. This repository houses both the **Native Android Application** (Kotlin + Jetpack Compose + Room + Firebase AI Logic + Cloud Firestore) in `/app` and the **Production Responsive Website** (Vite + Modular ES Modules + Firebase Web SDK) in `/web` without conflict.

---

## 1. Repository Architecture

```text
Utkal_Sarathi/
├── app/                          # Native Android app (Kotlin, Jetpack Compose, Room, Firebase)
│   ├── build.gradle.kts          # Android build config & dependencies
│   ├── google-services.json      # Android Firebase client configuration
│   └── src/
│       ├── main/                 # 30-district catalog, Utkal Mitra, Katha TTS, Trip Planner, Safety
│       └── test/                 # Robolectric & Firestore Emulator JVM tests
├── web/                          # Standalone Production Website (Deployable on Vercel)
│   ├── package.json              # Web scripts: dev, build, preview, test
│   ├── vite.config.js            # Vite bundler outputting optimized assets to web/dist
│   ├── vercel.json               # Vercel build, security headers & SPA rewrite configuration
│   ├── .env.example              # Documented VITE_* public environment variables
│   ├── index.html                # Accessible SEO/OpenGraph HTML entry shell
│   ├── public/                   # Favicon & synced UtkalSarathi visual artwork
│   ├── scripts/sync-assets.mjs   # Syncs shared artwork from app/src/main/res/drawable
│   ├── src/
│   │   ├── data/                 # 30 districts, 61+ places, 30+ Katha stories, EN/OR/HI i18n
│   │   ├── services/             # Trip & INR budget engine, Haversine fare estimator, Firebase Web
│   │   ├── styles/main.css       # Responsive Obsidian/Saffron/Gold/Teal design system
│   │   └── main.js               # Interactive web controller, TTS narrator, GPS & WhatsApp share
│   └── tests/web.test.mjs        # Automated Node unit & configuration verification suite
├── firestore.rules               # Zero-trust Cloud Firestore security rules
├── firestore.test.js             # Tier-1 Firebase Emulator security rules test suite
├── firebase-blueprint.json       # Cloud Firestore schema blueprint
├── firebase.json                 # Firestore database + emulator + optional Firebase Hosting config
└── ARCHITECTURE_AND_SETUP.md     # Deep-dive Android & Cloud architecture reference
```

---

## 2. Core Features (Web & Android)

1. **All 30 Official Districts of Odisha:** Searchable encyclopedia with Odia (`ଓଡ଼ିଆ`), Hindi (`हिन्दी`), and English names, district headquarters, historical summaries, 61+ curated destinations, **Hidden Gems**, festivals, GI-tagged handlooms, signature foods, transit gateways, and emergency hospitals.
2. **Utkal Katha Multilingual Voice Library:** 30+ verified chronicles and oral legends with explicit epistemic badges (*Documented Historical Record*, *Archaeological Evidence*, *Traditional Oral Legend*), browser Web Speech TTS narration (`0.85x–1.3x` speed, Pause/Resume/Stop), and Jaccard near-duplicate protection.
3. **Personalized Trip & Deterministic INR Budget Calculator:** Multi-district itinerary generator calculating transparent room-shared accommodation, food, transit, monument entry, and an 8% contingency buffer in INR (`₹`), persisted in `localStorage` and optionally synced to Cloud Firestore.
4. **Interactive 30-District Geo-Map & Fair Fare Estimator:** Clickable SVG coordinate map of Odisha with Haversine road/ghat distance calculation, Google Maps live route handoff, and clearly labeled **non-binding reference fare ranges** for Auto-Rickshaw, Hatchback, Sedan, SUV, and OSRTC Bus.
5. **Utkal Mitra Concierge:** Citation-backed Odisha cultural and travel concierge (powered on Android by Firebase AI Logic + offline fallback, and on Web by deterministic source-grounded catalog retrieval that never fabricates unverified facts).
6. **GI Crafts, Cuisine & Eco-Camps:** Direct discovery of Raghurajpur Pattachitra, Cuttack Rupa Tarakasi, Sambalpuri Bandha, Kotpad natural dye, Pahala Rasagola, Nayagarh Chhena Poda, OTDC Panthanivas, and Eco-Tour Odisha nature camps.
7. **UtkalSuraksha Traveller Safety:** One-tap **SOS 112** & **Ambulance 108** dialers, real HTML5 Geolocation check-ins with permission-denied/timeout guidance, WhatsApp live location sharing, private trusted contacts, and moderated community hazard logging (*Pending Moderation*).

---

## 3. Local Setup & Verification Commands

### Website (`/web`)
Requires **Node.js 20+** and **npm 10+**:

```bash
cd web
npm install
npm run build
npm test
npm run dev
```

- Local development server runs at `http://localhost:5173`.
- Production static bundle is emitted to `web/dist`.

### Android Application (`/app`)
Requires **JDK 17+** and **Android SDK 36**:

```bash
gradle assembleDebug
gradle :app:testDebugUnitTest
```

---

## 4. Deploying the Website to Vercel (`https://utkalsarathi.vercel.app`)

1. Push the latest repository changes to `https://github.com/Ab20219/Utkal_Sarathi`.
2. Sign in to [Vercel](https://vercel.com) and click **Add New… → Project**, then import `Ab20219/Utkal_Sarathi`.
3. Configure the **Build and Output Settings** exactly as follows:

| Setting | Exact Value |
| :--- | :--- |
| **Project Name** | `utkalsarathi` |
| **Root Directory** | `web` |
| **Framework Preset** | `Vite` |
| **Install Command** | `npm install` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

4. *(Optional — For Cross-Device Google Sign-In & Cloud Firestore Sync on Web)*:
   - Open [Firebase Console](https://console.firebase.google.com/) → Project `gen-lang-client-0544007391`.
   - Click **Project Settings → General → Your apps → Add app → Web (`</>`)** to register the Web App and copy `apiKey` and `appId`.
   - Go to **Authentication → Settings → Authorized domains** and add `utkalsarathi.vercel.app` (plus any Vercel preview domain if desired).
   - In **Vercel → Project Settings → Environment Variables**, add the variables from `web/.env.example` (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_APP_ID`, `VITE_PUBLIC_SITE_URL=https://utkalsarathi.vercel.app`, etc.).
   - *Note:* Even without Firebase Web variables, the website works 100% out-of-the-box using Local Browser Storage (`localStorage`).
5. Click **Deploy**. Under **Project Settings → Domains**, verify `utkalsarathi.vercel.app` is assigned as your production domain.

---

## 5. Security & Credential Guidelines

- **Never commit signing keystores or `.env` files:** `.gitignore` excludes `*.jks`, `*.keystore`, `debug.keystore`, `debug.keystore.base64`, `local.properties`, and `.env*` files. If any keystore file was previously tracked in Git, untrack it with `git rm --cached debug.keystore.base64` before pushing.
- **Google Cloud API Key Restrictions:** `app/google-services.json` contains an Android Firebase client configuration. In a public GitHub repository, open **Google Cloud Console → APIs & Services → Credentials** and restrict Android API keys by Android package name (`com.aistudio.utkalsarathi.odkxpq`) + SHA-1 certificate, and restrict any Web API key by HTTP referrer (`https://utkalsarathi.vercel.app/*`).
- **Firestore Zero-Trust Security Rules:** `firestore.rules` enforces strict owner-only access on `/users/{userId}` subcollections and forces community `/safetyReports` submissions to carry `verificationStatus == 'Pending Moderation'`.
