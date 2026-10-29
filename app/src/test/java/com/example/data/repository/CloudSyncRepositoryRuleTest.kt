package com.example.data.repository

import com.example.base.FirestoreEmulatorTestBase
import com.example.data.firebase.CloudSyncRepository
import com.example.data.local.SavedTripEntity
import com.example.data.local.StoryEntity
import com.example.data.local.TrustedContactEntity
import com.example.data.local.UserPrefsState
import com.example.data.model.AppLanguage
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Test

class CloudSyncRepositoryRuleTest : FirestoreEmulatorTestBase() {

    private companion object {
        const val OP_TIMEOUT_MS = 10_000L
    }

    @Test
    fun ownerCanSyncProfileTripsContactsStoriesAndReports() = runBlocking {
        val repo = CloudSyncRepository(firestore)
        val aliceUid = signInTestUser("alice_${System.nanoTime()}@utkal.test")

        // 1. Create & Update UserProfile
        val initialPrefs = UserPrefsState(
            hasCompletedOnboarding = true,
            language = AppLanguage.ENGLISH,
            preferredVoiceName = "Charon",
            speechSpeed = 1.0f,
            favoriteDestinationIds = setOf("puri_jagannath"),
            recentSearches = listOf("Konark")
        )
        withTimeout(OP_TIMEOUT_MS) {
            repo.ensureOrUpsertUserProfile(
                userId = aliceUid,
                displayName = "Alice Panda",
                prefs = initialPrefs,
                offlineDistrictIds = listOf("puri", "khordha")
            )
        }

        val updatedPrefs = initialPrefs.copy(
            language = AppLanguage.ODIA,
            preferredVoiceName = "Orus",
            speechSpeed = 1.15f
        )
        withTimeout(OP_TIMEOUT_MS) {
            repo.ensureOrUpsertUserProfile(
                userId = aliceUid,
                displayName = "Alice Panda",
                prefs = updatedPrefs,
                offlineDistrictIds = listOf("puri", "khordha", "koraput")
            )
        }

        val loadedOffline = withTimeout(OP_TIMEOUT_MS) {
            repo.fetchOfflineDistrictIds(aliceUid)
        }
        assertEquals(listOf("puri", "khordha", "koraput"), loadedOffline)

        // 2. Create & Observe SavedTrip (with native daySlots)
        val slot = DayItinerarySlot(
            dayNumber = 1,
            districtName = "Puri",
            primaryStop = "Shree Jagannath Temple",
            secondaryStop = "Raghurajpur Heritage Crafts Village",
            estimatedTravelKm = 62,
            estimatedDriveMinutes = 80,
            transportRecommendation = "AC Intercity Cab",
            staySuggestion = "OTDC Panthanivas Puri",
            foodHighlight = "Mahaprasad & Khaja",
            dayBudgetInr = 6500,
            userCustomNotes = "Early morning visit"
        )
        val trip = SavedTripEntity(
            id = "trip_alice_01",
            title = "Puri Cultural Trail (1D)",
            startingCity = "Bhubaneswar",
            selectedDistrictsCsv = "puri",
            durationDays = 1,
            travelDatesLabel = "Dec 2026",
            travellerCount = 2,
            tierPreference = "Moderate",
            interestsCsv = "Temples,GI Crafts",
            totalEstimatedCostInr = 6500,
            costAssumptionsNote = "Moderate tier deterministic calculation",
            itineraryDaysJson = "[]"
        )
        withTimeout(OP_TIMEOUT_MS) {
            repo.upsertSavedTrip(aliceUid, trip, listOf(slot))
        }

        val syncedTrips = withTimeout(OP_TIMEOUT_MS) {
            repo.observeSavedTrips(aliceUid).first { it.isNotEmpty() }
        }
        assertEquals(1, syncedTrips.size)
        assertEquals("Puri Cultural Trail (1D)", syncedTrips.first().title)

        // 3. Create TrustedContact (PII isolated)
        withTimeout(OP_TIMEOUT_MS) {
            repo.createTrustedContact(
                userId = aliceUid,
                contact = TrustedContactEntity(
                    id = "contact_01",
                    name = "Subhashree Panda",
                    relation = "Sister",
                    phoneNumber = "+919876501234"
                )
            )
        }
        val contacts = withTimeout(OP_TIMEOUT_MS) {
            repo.observeTrustedContacts(aliceUid).first { it.isNotEmpty() }
        }
        assertEquals("Subhashree Panda", contacts.first().name)

        // 4. Upsert UserStory & Toggle Favorite
        val story = StoryEntity(
            id = "katha_ai_puri_01",
            titleEn = "Astronomical Precision of Konark Chariot Wheels",
            titleOdia = "କୋଣାର୍କ ରଥଚକ୍ରର ଜ୍ୟୋତିର୍ବିଜ୍ଞାନ",
            titleHindi = "कोणार्क रथ चक्र की खगोलीय गणना",
            districtId = "puri",
            destinationId = "konark_sun_temple",
            destinationName = "Konark Sun Temple",
            category = "Sacred Architecture",
            historicalPeriod = "Eastern Ganga Dynasty (13th Century CE)",
            narrativeFormat = "Detailed Narrative",
            originalLanguage = "en",
            bodyEn = "Built under King Narasimhadeva I, the twenty-four carved stone wheels of Konark function as precision sundials measuring time to the minute.",
            bodyOdia = "",
            bodyHindi = "",
            factClassification = "Archaeological & Epigraphic Evidence",
            sourceReferences = "ASI World Heritage Monument Dossier",
            editorialStatus = "AI Source-Grounded (Pending Editorial Review)",
            isAiGenerated = true,
            isFavorite = true,
            isOfflineSaved = true,
            estimatedDurationSec = 95,
            contentHash = "sha256_konark_wheels_test_01"
        )
        withTimeout(OP_TIMEOUT_MS) {
            repo.upsertUserStory(aliceUid, story)
            repo.upsertUserStory(aliceUid, story.copy(isFavorite = false))
        }

        // 5. Submit Safety Report (Pending Moderation enforced by rules)
        withTimeout(OP_TIMEOUT_MS) {
            repo.submitSafetyOrListingReport(
                userId = aliceUid,
                reportId = "hazard_test_01",
                reportType = "HAZARD",
                districtId = "puri",
                targetLabel = "Marine Drive Beach Sector 3",
                category = "High Swell Tide",
                description = "Lifeguard red flag raised due to high afternoon swell currents.",
                severity = "Caution"
            )
        }
        val reports = withTimeout(OP_TIMEOUT_MS) {
            repo.observeUserSafetyReports(aliceUid).first { it.isNotEmpty() }
        }
        assertEquals("User Submitted — Unverified (Pending Moderation)", reports.first().verificationStatus)
    }

    @Test
    fun crossUserAndUnauthenticatedWritesAreDeniedByRules() = runBlocking {
        val repo = CloudSyncRepository(firestore)
        val aliceUid = signInTestUser("alice_sec_${System.nanoTime()}@utkal.test")
        withTimeout(OP_TIMEOUT_MS) {
            repo.createTrustedContact(
                userId = aliceUid,
                contact = TrustedContactEntity(
                    id = "contact_sec_1",
                    name = "Private Contact",
                    relation = "Parent",
                    phoneNumber = "+919999988888"
                )
            )
        }

        // Sign in as Bob and attempt to write into Alice's private subcollection -> MUST throw SecurityException
        signInTestUser("bob_sec_${System.nanoTime()}@utkal.test")
        try {
            withTimeout(OP_TIMEOUT_MS) {
                repo.createTrustedContact(
                    userId = aliceUid,
                    contact = TrustedContactEntity(
                        id = "contact_intruder",
                        name = "Intruder",
                        relation = "None",
                        phoneNumber = "+910000000000"
                    )
                )
            }
            fail("Expected SecurityException for cross-user write to trusted_contacts")
        } catch (expected: SecurityException) {
            assertNotNull(expected.message)
            assertTrue(expected.message!!.contains("operationType"))
        }

        // Sign out completely and attempt unauthenticated profile write -> MUST throw SecurityException
        auth.signOut()
        try {
            withTimeout(OP_TIMEOUT_MS) {
                repo.ensureOrUpsertUserProfile(
                    userId = aliceUid,
                    displayName = "Anon Attacker",
                    prefs = UserPrefsState(),
                    offlineDistrictIds = emptyList()
                )
            }
            fail("Expected SecurityException for unauthenticated write")
        } catch (expected: SecurityException) {
            val payload = org.json.JSONObject(checkNotNull(expected.message))
            assertEquals("users/$aliceUid", payload.getString("path"))
            assertEquals("write", payload.getString("operationType"))
        }
    }
}
