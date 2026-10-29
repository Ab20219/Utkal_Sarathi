package com.example

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.example.data.ai.GeminiServiceClient
import com.example.data.catalog.KathaStorySeedCatalog
import com.example.data.catalog.OdishaDistrictCatalog
import com.example.data.local.UtkalDatabase
import com.example.data.model.AppLanguage
import com.example.data.repository.UtkalRepository
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.LooperMode

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
@LooperMode(LooperMode.Mode.INSTRUMENTATION_TEST)
class ExampleRobolectricTest {

    private lateinit var context: Context
    private lateinit var db: UtkalDatabase
    private lateinit var repository: UtkalRepository

    @Before
    fun setUp() {
        context = ApplicationProvider.getApplicationContext()
        if (FirebaseApp.getApps(context).isEmpty()) {
            FirebaseApp.initializeApp(context) ?: FirebaseApp.initializeApp(
                context,
                FirebaseOptions.Builder()
                    .setApplicationId("com.aistudio.utkalsarathi.krmpzv")
                    .setProjectId("demo-test")
                    .setApiKey("fake-api-key-for-test")
                    .build()
            )
        }
        db = Room.inMemoryDatabaseBuilder(context, UtkalDatabase::class.java)
            .allowMainThreadQueries()
            .build()
        repository = UtkalRepository(db, GeminiServiceClient())
    }

    @After
    fun tearDown() {
        db.close()
    }

    @Test
    fun `verify UtkalSarathi app name, branding resources, and WhatsApp share invite`() {
        assertEquals("UtkalSarathi", context.getString(R.string.app_name))
        assertEquals("Discover Odisha, Your Way.", context.getString(R.string.app_tagline))
        assertEquals("SOS 112", context.getString(R.string.sos_label))
        assertEquals("Share on WhatsApp", context.getString(R.string.share_whatsapp_cta))

        val inviteEn = com.example.ui.components.buildUtkalAppInviteText(AppLanguage.ENGLISH, "https://gen-lang-client-0544007391.web.app")
        val inviteOr = com.example.ui.components.buildUtkalAppInviteText(AppLanguage.ODIA)
        val inviteHi = com.example.ui.components.buildUtkalAppInviteText(AppLanguage.HINDI)
        assertTrue(inviteEn.contains("https://gen-lang-client-0544007391.web.app"))
        assertFalse(inviteOr.contains("ais-pre-"))
        assertTrue(inviteOr.contains("ଉତ୍କଳ ସାରଥୀ"))
        assertTrue(inviteHi.contains("उत्कल सारथी"))
    }

    @Test
    fun `verify all 30 official Odisha districts exist with multilingual names and destinations`() {
        val districts = OdishaDistrictCatalog.allDistricts
        assertEquals(30, districts.size)

        val expectedIds = setOf(
            "angul", "balangir", "balasore", "bargarh", "bhadrak", "boudh", "cuttack",
            "deogarh", "dhenkanal", "gajapati", "ganjam", "jagatsinghpur", "jajpur",
            "jharsuguda", "kalahandi", "kandhamal", "kendrapara", "kendujhar", "khordha",
            "koraput", "malkangiri", "mayurbhanj", "nabarangpur", "nayagarh", "nuapada",
            "puri", "rayagada", "sambalpur", "subarnapur", "sundargarh"
        )
        assertEquals(expectedIds, districts.map { it.id }.toSet())

        districts.forEach { d ->
            assertTrue("Odia name missing for ${d.nameEn}", d.nameOdia.isNotBlank())
            assertTrue("Hindi name missing for ${d.nameEn}", d.nameHindi.isNotBlank())
            assertTrue("Destinations empty for ${d.nameEn}", d.destinations.isNotEmpty())
            assertTrue("Source missing for ${d.nameEn}", d.sourceReference.isNotBlank())
        }
    }

    @Test
    fun `verify Katha story seeding, unique canonical IDs, and duplicate rejection`() = runBlocking {
        repository.seedInitialRecordsIfEmpty()
        val initialStories = repository.allStoriesFlow.first()
        assertTrue("Expected at least 30 seeded stories covering all districts", initialStories.size >= 30)
        assertEquals(initialStories.size, initialStories.map { it.id }.distinct().size)

        // Attempt to batch-import an exact duplicate + 1 brand new distinct story
        val existingFirst = initialStories.first()
        val batchPayload = """
            [
              {
                "titleEn": "${existingFirst.titleEn}",
                "districtId": "${existingFirst.districtId}",
                "bodyEn": "${existingFirst.bodyEn}"
              },
              {
                "titleEn": "Ancient Maritime Excavations of Manikapatna on Chilika",
                "districtId": "puri",
                "destinationName": "Manikapatna Port Site",
                "category": "Archaeology",
                "factClassification": "Archaeological & Epigraphic Evidence",
                "bodyEn": "Excavations at Manikapatna along the outer channel of Chilika lagoon uncovered Roman rouletted ware, Chinese celadon ceramics, and Sri Lankan coins confirming Kalinga's global maritime trade.",
                "sourceReferences": "Odisha Institute of Maritime & South East Asian Studies"
              }
            ]
        """.trimIndent()

        val importResult = repository.importStoriesBatchJson(batchPayload)
        assertTrue(importResult.isSuccess)
        val (added, skipped) = importResult.getOrThrow()
        assertEquals(1, added.size)
        assertEquals(1, skipped)
    }

    @Test
    fun `verify deterministic trip planner generates accurate multi-day budget and persists`() = runBlocking {
        val (trip, slots) = repository.generateDeterministicItinerary(
            startingCity = "Bhubaneswar",
            selectedDistrictIds = listOf("khordha", "puri", "cuttack"),
            durationDays = 3,
            travelDatesLabel = "Dec 1 - Dec 3",
            travellerCount = 2,
            tier = "Moderate",
            interests = listOf("Temples & Heritage", "GI Crafts")
        )
        assertEquals(3, slots.size)
        assertEquals(slots.sumOf { it.dayBudgetInr }, trip.totalEstimatedCostInr)
        assertTrue(trip.costAssumptionsNote.contains("Excludes"))

        repository.saveTrip(trip)
        val savedList = repository.savedTripsFlow.first()
        assertEquals(1, savedList.size)
        assertEquals(trip.id, savedList.first().id)
    }

    @Test
    fun `verify Utkal Mitra AI curated fallback works gracefully without API key`() = runBlocking {
        val koraput = OdishaDistrictCatalog.getDistrictById("koraput")
        assertNotNull(koraput)
        val result = repository.geminiClient.askUtkalMitra(
            userQuery = "Tell me about Deomali and Kalajeera rice",
            selectedDistrict = koraput,
            language = AppLanguage.ODIA,
            conversationHistory = emptyList(),
            useHighThinking = false,
            useSearchGrounding = true
        )
        assertTrue(result.text.isNotBlank())
        assertTrue(result.text.contains("କୋରାପୁଟ"))
        assertFalse(KathaStorySeedCatalog.isNearDuplicate("Completely different topic on Similipal", listOf("Konark Sun Temple stone chariot wheels")))
    }
}
