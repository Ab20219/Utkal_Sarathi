# UtkalSarathi — Architecture, Cloud Security, Story Pipeline & Build Documentation

**Tagline:** *Discover Odisha, Your Way.*

## 1. Firebase Cloud Architecture & Zero-Secret AI Integration
- **Firebase Authentication (`CredentialManager` Google Sign-In):**
  - Uses `GetSignInWithGoogleOption` for interactive Google Sign-In and `GetGoogleIdOption` for silent startup session recovery (`R.string.default_web_client_id`).
  - Emergency **SOS 112** dialer remains accessible on the Sign-In gate for traveller safety.
- **Cloud Firestore (`R.string.firestore_database_id`):**
  - Provisioned database: `ai-studio-android-utkalsar-47b70c34-5223-4df1-8532-ae48353675b2` (`gen-lang-client-0544007391`).
  - Zero-trust hardened `firestore.rules` + `firebase-blueprint.json` enforcing strict owner-only isolation (`/users/{userId}` and subcollections `trips`, `trusted_contacts`, `user_stories`, `safety_reports`), native list/map validation, bounded strings/lists, immutable `userId` and `createdAt`, and mandatory `Pending Moderation` status on community reports.
  - Bi-directional offline cache in **Room SQLite (`UtkalDatabase`)** and **Jetpack DataStore** ensures 100% offline availability in low-signal ghat/forest corridors.
- **Firebase AI Logic (`Firebase.ai` + Firebase App Check):**
  - Protected via `AppCheckConfigurator.configureAppCheck(this, intent)` (`ReCaptchaEnterpriseProviderFactory` / `DebugAppCheckProviderFactory`) with **zero client-side `GEMINI_API_KEY` required**.
  - `gemini-3.8-flash` (fallback `gemini-2.5-flash`) with `Tool.googleSearch()` for live Search Grounding in **Utkal Mitra AI** and structured `Schema.array` story generation in **Utkal Katha**.
  - `gemini-4-argon` with `ThinkingLevel.HIGH` (without `maxOutputTokens`) for complex historical and multi-district reasoning.
  - `gemini-3.8-live` via `Firebase.ai.liveModel` + `startAudioConversation` for real-time Live Voice conversations with input/output transcription.
  - `gemini-3.8-flash-tts` (fallback `gemini-3.1-flash-tts-preview`) (`Charon`, `Orus`, `Kore` voices) synthesized to RIFF `.wav` files in `narration_cache/` for instant offline replay.

## 2. Expanding Utkal Katha to 1,000+ / 10,000+ Distinct Story Records
`katha_stories` uses an indexed SQLite schema (`districtId`, `category`, and `UNIQUE contentHash` via normalized SHA-256) plus Jaccard token similarity (`>0.80` near-duplicate rejection). Translations (`bodyEn`, `bodyOdia`, `bodyHindi`) live inside a single canonical `StoryEntity.id` so translations are never double-counted as separate stories. User-generated and batch-imported stories sync automatically to `/users/{userId}/user_stories/{storyId}`.

## 3. Building & Testing
- **Tier 1 Security Rules Unit Tests (JS):** `FIRESTORE_EMULATOR_HOST="127.0.0.1:8085" node --test firestore.test.js`
- **Tier 2 Android SDK + Emulator Rule Tests (Kotlin Robolectric):** `gradle :app:testDebugUnitTest --tests '*Rule*'`
- **Full Robolectric & Unit Test Suite:** `gradle :app:testDebugUnitTest`
- **Compile & Verify Debug APK:** AI Studio build / `gradle assembleDebug` (`app/build/outputs/apk/debug/app-debug.apk`).
