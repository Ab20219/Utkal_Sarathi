package com.example.data.repository

import com.example.data.ai.GeminiServiceClient
import com.example.data.catalog.KathaStorySeedCatalog
import com.example.data.catalog.OdishaDistrictCatalog
import com.example.data.local.HazardReportEntity
import com.example.data.local.ListingIssueReportEntity
import com.example.data.local.OfflineDistrictEntity
import com.example.data.local.SavedTripEntity
import com.example.data.local.StoryEntity
import com.example.data.local.TrustedContactEntity
import com.example.data.local.UtkalDatabase
import com.example.data.model.AppLanguage
import com.example.data.model.DistrictRecord
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

data class KathaLibraryStats(
    val totalDistinctStories: Int = 0,
    val curatedReviewedCount: Int = 0,
    val aiSourceGroundedCount: Int = 0,
    val multilingualTranslatedCount: Int = 0,
    val offlineAudioCachedCount: Int = 0
)

data class DayItinerarySlot(
    val dayNumber: Int,
    val districtName: String,
    val primaryStop: String,
    val secondaryStop: String,
    val estimatedTravelKm: Int,
    val estimatedDriveMinutes: Int,
    val transportRecommendation: String,
    val staySuggestion: String,
    val foodHighlight: String,
    val dayBudgetInr: Int,
    var userCustomNotes: String = ""
)

class UtkalRepository(
    private val db: UtkalDatabase,
    val geminiClient: GeminiServiceClient
) {
    private val storyDao = db.storyDao()
    private val tripDao = db.tripDao()
    private val safetyDao = db.safetyDao()
    private val offlinePackDao = db.offlinePackDao()

    val allStoriesFlow: Flow<List<StoryEntity>> = storyDao.observeAllStories()
    val totalStoriesCountFlow: Flow<Int> = storyDao.observeTotalDistinctStories()
    val reviewedCountFlow: Flow<Int> = storyDao.observeReviewedCount()
    val generatedCountFlow: Flow<Int> = storyDao.observeGeneratedCount()
    val translatedCountFlow: Flow<Int> = storyDao.observeTranslatedCount()
    val cachedAudioCountFlow: Flow<Int> = storyDao.observeCachedAudioCount()

    val savedTripsFlow: Flow<List<SavedTripEntity>> = tripDao.observeAllTrips()
    val hazardReportsFlow: Flow<List<HazardReportEntity>> = safetyDao.observeHazardReports()
    val trustedContactsFlow: Flow<List<TrustedContactEntity>> = safetyDao.observeTrustedContacts()
    val offlineDistrictsFlow: Flow<List<OfflineDistrictEntity>> = offlinePackDao.observeOfflineDistricts()
    val listingIssuesFlow: Flow<List<ListingIssueReportEntity>> = offlinePackDao.observeListingIssues()

    suspend fun seedInitialRecordsIfEmpty() = withContext(Dispatchers.IO) {
        val currentCount = storyDao.observeTotalDistinctStories().first()
        if (currentCount == 0) {
            val seeds = KathaStorySeedCatalog.buildInitialVerifiedStories()
            storyDao.insertStoriesIgnoreDuplicates(seeds)
        }
        val hazards = safetyDao.observeHazardReports().first()
        if (hazards.isEmpty()) {
            safetyDao.insertHazardReport(
                HazardReportEntity(
                    id = "osdma_coastal_rip_advisory",
                    districtId = "puri",
                    locationLabel = "Puri & Konark Chandrabhaga Coastline",
                    category = "Coastal Tide Advisory",
                    description = "Swim only within lifeguarded Blue Flag beach zones; strong undertow currents occur along Chandrabhaga and river mouths.",
                    severity = "Caution",
                    verificationStatus = "Official OSDMA / Tourist Lifeguard Standing Safety Guideline",
                    latitude = 19.7982,
                    longitude = 85.8249
                )
            )
            safetyDao.insertHazardReport(
                HazardReportEntity(
                    id = "ghat_fog_elephant_corridor",
                    districtId = "kandhamal",
                    locationLabel = "Kalinga Ghat & Similipal-Kuldiha Forest Corridors",
                    category = "Wildlife Crossing",
                    description = "Avoid night driving on forested ghat roads after dusk due to wild elephant movement and dense winter valley mist.",
                    severity = "Advisory",
                    verificationStatus = "Official Odisha Forest Dept Standing Advisory",
                    latitude = 20.1450,
                    longitude = 84.4120
                )
            )
        }
    }

    suspend fun toggleStoryFavorite(story: StoryEntity): StoryEntity {
        val updated = story.copy(isFavorite = !story.isFavorite, updatedAtEpochMs = System.currentTimeMillis())
        storyDao.upsertStory(updated)
        return updated
    }

    suspend fun toggleStoryOffline(story: StoryEntity): StoryEntity {
        val updated = story.copy(isOfflineSaved = !story.isOfflineSaved, updatedAtEpochMs = System.currentTimeMillis())
        storyDao.upsertStory(updated)
        return updated
    }

    suspend fun recordStoryPlayback(storyId: String, lang: AppLanguage, cachedWavPath: String?) {
        val now = System.currentTimeMillis()
        storyDao.markPlayed(storyId, now)
        if (cachedWavPath != null) {
            val existing = storyDao.getStoryById(storyId) ?: return
            val updated = when (lang) {
                AppLanguage.ENGLISH -> existing.copy(cachedAudioPathEn = cachedWavPath, isOfflineSaved = true)
                AppLanguage.ODIA -> existing.copy(cachedAudioPathOdia = cachedWavPath, isOfflineSaved = true)
                AppLanguage.HINDI -> existing.copy(cachedAudioPathHindi = cachedWavPath, isOfflineSaved = true)
            }
            storyDao.updateStory(updated)
        }
    }

    /**
     * AI-powered source-grounded story expansion with strict SHA-256 + Jaccard near-duplicate rejection.
     * Note: Translations live inside the same StoryEntity so translations are NEVER counted as separate stories.
     */
    suspend fun expandStoriesForDistrictWithAi(district: DistrictRecord): Result<List<StoryEntity>> = withContext(Dispatchers.IO) {
        val currentStories = storyDao.observeAllStories().first()
        val existingBodies = currentStories.map { it.bodyEn }.toMutableList()
        val existingTitles = currentStories.filter { it.districtId == district.id }.map { it.titleEn }

        val draftResult = geminiClient.generateSourceGroundedStoriesForDistrict(
            district = district,
            existingTitles = existingTitles,
            count = 2
        )
        draftResult.map { drafts ->
            val insertedEntities = mutableListOf<StoryEntity>()
            val primaryDest = district.destinations.first()
            for (draft in drafts) {
                val hash = KathaStorySeedCatalog.computeNormalizedContentHash(draft.titleEn, draft.bodyEn)
                if (storyDao.findByContentHash(hash) != null) continue
                if (KathaStorySeedCatalog.isNearDuplicate(draft.bodyEn, existingBodies)) continue

                val entity = StoryEntity(
                    id = "katha_ai_${district.id}_${UUID.randomUUID().toString().take(8)}",
                    titleEn = draft.titleEn,
                    titleOdia = draft.titleOdia,
                    titleHindi = draft.titleHindi,
                    districtId = district.id,
                    destinationId = primaryDest.id,
                    destinationName = primaryDest.name,
                    category = draft.category,
                    historicalPeriod = draft.historicalPeriod,
                    narrativeFormat = "Detailed Narrative",
                    originalLanguage = "en",
                    bodyEn = draft.bodyEn,
                    bodyOdia = draft.bodyOdia,
                    bodyHindi = draft.bodyHindi,
                    factClassification = draft.factClassification,
                    sourceReferences = draft.sourceReferences,
                    editorialStatus = "AI Source-Grounded (Pending Editorial Review)",
                    isAiGenerated = true,
                    estimatedDurationSec = (draft.bodyEn.split(" ").size / 2.2).toInt().coerceIn(60, 420),
                    contentHash = hash
                )
                storyDao.upsertStory(entity)
                existingBodies.add(draft.bodyEn)
                insertedEntities.add(entity)
            }
            insertedEntities
        }
    }

    /**
     * Batch JSONL/JSON array import pipeline supporting expansion to 10,000+ distinct story records
     * without hardcoding records into APK source code.
     */
    suspend fun importStoriesBatchJson(jsonArrayPayload: String): Result<Pair<List<StoryEntity>, Int>> = withContext(Dispatchers.IO) {
        try {
            val arr = JSONArray(jsonArrayPayload.trim())
            val existingBodies = storyDao.observeAllStories().first().map { it.bodyEn }.toMutableList()
            val importedList = mutableListOf<StoryEntity>()
            var skippedDuplicates = 0

            for (i in 0 until arr.length()) {
                val obj = arr.optJSONObject(i) ?: continue
                val titleEn = obj.optString("titleEn").trim()
                val bodyEn = obj.optString("bodyEn").trim()
                val districtId = obj.optString("districtId", "puri").lowercase()
                if (titleEn.isBlank() || bodyEn.length < 40) continue

                val hash = KathaStorySeedCatalog.computeNormalizedContentHash(titleEn, bodyEn)
                if (storyDao.findByContentHash(hash) != null || KathaStorySeedCatalog.isNearDuplicate(bodyEn, existingBodies)) {
                    skippedDuplicates++
                    continue
                }

                val district = OdishaDistrictCatalog.getDistrictById(districtId) ?: OdishaDistrictCatalog.allDistricts.first()
                val dest = district.destinations.first()
                val story = StoryEntity(
                    id = obj.optString("id").takeIf { it.isNotBlank() } ?: "katha_batch_${district.id}_${hash.take(10)}",
                    titleEn = titleEn,
                    titleOdia = obj.optString("titleOdia", ""),
                    titleHindi = obj.optString("titleHindi", ""),
                    districtId = district.id,
                    destinationId = obj.optString("destinationId", dest.id),
                    destinationName = obj.optString("destinationName", dest.name),
                    category = obj.optString("category", "Sacred Architecture"),
                    historicalPeriod = obj.optString("historicalPeriod", "Documented Odisha Heritage"),
                    narrativeFormat = obj.optString("narrativeFormat", "Short Story"),
                    originalLanguage = obj.optString("originalLanguage", "en"),
                    bodyEn = bodyEn,
                    bodyOdia = obj.optString("bodyOdia", ""),
                    bodyHindi = obj.optString("bodyHindi", ""),
                    factClassification = obj.optString("factClassification", "Documented Historical Record"),
                    sourceReferences = obj.optString("sourceReferences", district.sourceReference),
                    editorialStatus = "Imported Batch Record (Deduplicated)",
                    isAiGenerated = obj.optBoolean("isAiGenerated", false),
                    estimatedDurationSec = (bodyEn.split(" ").size / 2.2).toInt().coerceAtLeast(45),
                    contentHash = hash
                )
                storyDao.upsertStory(story)
                existingBodies.add(bodyEn)
                importedList.add(story)
            }
            Result.success(importedList to skippedDuplicates)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Deterministic Personalized Odisha Trip Planner with route ordering, Haversine road distances,
     * transparent per-tier INR calculations, and explicit cost assumptions.
     */
    fun generateDeterministicItinerary(
        startingCity: String,
        selectedDistrictIds: List<String>,
        durationDays: Int,
        travelDatesLabel: String,
        travellerCount: Int,
        tier: String, // "Budget", "Moderate", "Luxury"
        interests: List<String>
    ): Pair<SavedTripEntity, List<DayItinerarySlot>> {
        val validDistricts = selectedDistrictIds
            .mapNotNull { OdishaDistrictCatalog.getDistrictById(it) }
            .ifEmpty { listOfNotNull(OdishaDistrictCatalog.getDistrictById("khordha"), OdishaDistrictCatalog.getDistrictById("puri")) }

        // Per-person daily base benchmarks in INR (transparent deterministic formula)
        val stayPerRoomNight = when (tier) {
            "Budget" -> 1400 // Dharamshala / clean guesthouse / OTDC basic
            "Luxury" -> 7800 // Heritage boutique / premium beach or eco resort
            else -> 3400 // OTDC Panthanivas / Eco-Tour Odisha cottage
        }
        val foodPerPersonDay = when (tier) {
            "Budget" -> 450
            "Luxury" -> 1600
            else -> 850
        }
        val transportRatePerKm = when (tier) {
            "Budget" -> 5 // OSRTC bus / Express train / shared auto blend
            "Luxury" -> 22 // Dedicated AC SUV
            else -> 14 // AC Sedan / Intercity rail + local cab
        }

        val roomsNeeded = ((travellerCount + 1) / 2).coerceAtLeast(1)
        val startDistrict = OdishaDistrictCatalog.searchDistrictsAndPlaces(startingCity).firstOrNull()
            ?: OdishaDistrictCatalog.getDistrictById("khordha")!!

        var prevLat = startDistrict.latitude
        var prevLon = startDistrict.longitude

        val slots = mutableListOf<DayItinerarySlot>()
        var cumulativeCost = 0

        for (day in 1..durationDays.coerceIn(1, 14)) {
            val district = validDistricts[(day - 1) % validDistricts.size]
            val primary = district.destinations.getOrElse(0) { district.destinations.first() }
            val secondary = district.destinations.getOrElse(1) { primary }

            val isGhat = district.region.name == "SOUTHERN" || district.id in setOf("mayurbhanj", "kendujhar", "sundargarh")
            val legKm = OdishaDistrictCatalog.estimateRoadDistanceKm(prevLat, prevLon, primary.latitude, primary.longitude, isGhat) + 22
            val avgSpeedKmph = if (isGhat) 38.0 else 50.0
            val driveMins = ((legKm / avgSpeedKmph) * 60).toInt().coerceAtLeast(30)

            val dayTransportCost = if (tier == "Budget") {
                (legKm * transportRatePerKm * travellerCount).coerceAtLeast(250 * travellerCount)
            } else {
                (legKm * transportRatePerKm).coerceAtLeast(1600)
            }
            val dayStayCost = stayPerRoomNight * roomsNeeded
            val dayFoodCost = foodPerPersonDay * travellerCount
            val miscBuffer = 200 * travellerCount
            val dayTotal = dayTransportCost + dayStayCost + dayFoodCost + miscBuffer
            cumulativeCost += dayTotal

            val stayLabel = when (tier) {
                "Budget" -> "Verified Guesthouse / Yatri Nivas near ${district.headquarters}"
                "Luxury" -> "Heritage Resort / Premium Eco-Retreat in ${district.nameEn}"
                else -> "OTDC Panthanivas or Eco-Tour Odisha Nature Camp (${district.nameEn})"
            }

            val transportMode = when (tier) {
                "Budget" -> "East Coast Rail / OSRTC Coach via ${district.transportHubs.substringBefore(";")}"
                "Luxury" -> "Private Chauffeur AC SUV from ${if (day == 1) startingCity else validDistricts[(day - 2) % validDistricts.size].nameEn}"
                else -> "Intercity Express + Local Pre-booked AC Cab (${legKm} km est.)"
            }

            slots.add(
                DayItinerarySlot(
                    dayNumber = day,
                    districtName = "${district.nameEn} (${district.nameOdia})",
                    primaryStop = primary.name,
                    secondaryStop = if (secondary.id != primary.id) secondary.name else district.localExperiences.firstOrNull().orEmpty(),
                    estimatedTravelKm = legKm,
                    estimatedDriveMinutes = driveMins,
                    transportRecommendation = transportMode,
                    staySuggestion = stayLabel,
                    foodHighlight = district.signatureFood.joinToString(" • "),
                    dayBudgetInr = dayTotal,
                    userCustomNotes = if (interests.isNotEmpty()) "Focus: ${interests.joinToString(", ")}" else ""
                )
            )
            prevLat = primary.latitude
            prevLon = primary.longitude
        }

        val assumptions = "Deterministic Estimate ($tier tier, $travellerCount traveller(s), $roomsNeeded room(s)): Stay ₹$stayPerRoomNight/room/night + Food ₹$foodPerPersonDay/person/day + Transit ₹$transportRatePerKm/km + ₹200/person local buffer. Excludes flight/long-distance origin rail fares to $startingCity, monument camera tickets, wildlife safari permits, and personal handloom shopping."

        val entity = SavedTripEntity(
            id = "trip_${UUID.randomUUID().toString().take(8)}",
            title = "${validDistricts.joinToString(" → ") { it.nameEn }} (${durationDays}D)",
            startingCity = startingCity.ifBlank { "Bhubaneswar" },
            selectedDistrictsCsv = validDistricts.joinToString(",") { it.id },
            durationDays = durationDays,
            travelDatesLabel = travelDatesLabel.ifBlank { "Flexible Season (Oct–Mar Recommended)" },
            travellerCount = travellerCount,
            tierPreference = tier,
            interestsCsv = interests.joinToString(","),
            totalEstimatedCostInr = cumulativeCost,
            costAssumptionsNote = assumptions,
            itineraryDaysJson = serializeDaySlots(slots)
        )
        return entity to slots
    }

    suspend fun saveTrip(trip: SavedTripEntity) = tripDao.upsertTrip(trip)

    suspend fun deleteTrip(tripId: String) = tripDao.deleteTrip(tripId)

    fun parseDaySlots(json: String): List<DayItinerarySlot> {
        return runCatching {
            val arr = JSONArray(json)
            (0 until arr.length()).mapNotNull { idx ->
                val o = arr.optJSONObject(idx) ?: return@mapNotNull null
                DayItinerarySlot(
                    dayNumber = o.optInt("dayNumber", idx + 1),
                    districtName = o.optString("districtName"),
                    primaryStop = o.optString("primaryStop"),
                    secondaryStop = o.optString("secondaryStop"),
                    estimatedTravelKm = o.optInt("estimatedTravelKm"),
                    estimatedDriveMinutes = o.optInt("estimatedDriveMinutes"),
                    transportRecommendation = o.optString("transportRecommendation"),
                    staySuggestion = o.optString("staySuggestion"),
                    foodHighlight = o.optString("foodHighlight"),
                    dayBudgetInr = o.optInt("dayBudgetInr"),
                    userCustomNotes = o.optString("userCustomNotes")
                )
            }
        }.getOrDefault(emptyList())
    }

    fun serializeDaySlots(slots: List<DayItinerarySlot>): String {
        val arr = JSONArray()
        slots.forEach { s ->
            arr.put(
                JSONObject()
                    .put("dayNumber", s.dayNumber)
                    .put("districtName", s.districtName)
                    .put("primaryStop", s.primaryStop)
                    .put("secondaryStop", s.secondaryStop)
                    .put("estimatedTravelKm", s.estimatedTravelKm)
                    .put("estimatedDriveMinutes", s.estimatedDriveMinutes)
                    .put("transportRecommendation", s.transportRecommendation)
                    .put("staySuggestion", s.staySuggestion)
                    .put("foodHighlight", s.foodHighlight)
                    .put("dayBudgetInr", s.dayBudgetInr)
                    .put("userCustomNotes", s.userCustomNotes)
            )
        }
        return arr.toString()
    }

    suspend fun submitCommunityHazardReport(
        districtId: String,
        locationLabel: String,
        category: String,
        description: String,
        severity: String,
        lat: Double?,
        lon: Double?
    ): HazardReportEntity {
        val entity = HazardReportEntity(
            id = "hazard_${UUID.randomUUID().toString().take(8)}",
            districtId = districtId,
            locationLabel = locationLabel.trim(),
            category = category,
            description = description.trim(),
            severity = severity,
            verificationStatus = "User Submitted — Unverified (Pending Moderation)",
            latitude = lat,
            longitude = lon
        )
        safetyDao.insertHazardReport(entity)
        return entity
    }

    suspend fun addTrustedContact(name: String, relation: String, phone: String): TrustedContactEntity {
        val entity = TrustedContactEntity(
            id = "contact_${UUID.randomUUID().toString().take(8)}",
            name = name.trim(),
            relation = relation.trim(),
            phoneNumber = phone.trim()
        )
        safetyDao.upsertTrustedContact(entity)
        return entity
    }

    suspend fun deleteTrustedContact(id: String) = safetyDao.deleteTrustedContact(id)

    suspend fun toggleDistrictOfflinePack(district: DistrictRecord, currentlySaved: Boolean) {
        if (currentlySaved) {
            offlinePackDao.removeDistrictOffline(district.id)
        } else {
            offlinePackDao.saveDistrictOffline(
                OfflineDistrictEntity(
                    districtId = district.id,
                    districtName = "${district.nameEn} (${district.nameOdia})"
                )
            )
        }
    }

    suspend fun reportListingIssue(listingId: String, listingTitle: String, issueDescription: String): ListingIssueReportEntity {
        val entity = ListingIssueReportEntity(
            id = "issue_${UUID.randomUUID().toString().take(8)}",
            listingId = listingId,
            listingTitle = listingTitle,
            issueDescription = issueDescription.trim()
        )
        offlinePackDao.insertListingIssue(entity)
        return entity
    }

    // Cloud-to-local offline cache mirror helpers
    suspend fun mirrorCloudTripsToLocal(trips: List<SavedTripEntity>) = withContext(Dispatchers.IO) {
        trips.forEach { tripDao.upsertTrip(it) }
    }

    suspend fun mirrorCloudContactsToLocal(contacts: List<TrustedContactEntity>) = withContext(Dispatchers.IO) {
        contacts.forEach { safetyDao.upsertTrustedContact(it) }
    }

    suspend fun mirrorCloudStoriesToLocal(stories: List<StoryEntity>) = withContext(Dispatchers.IO) {
        stories.forEach { cloudStory ->
            val local = storyDao.getStoryById(cloudStory.id)
            if (local != null) {
                storyDao.upsertStory(
                    cloudStory.copy(
                        cachedAudioPathEn = local.cachedAudioPathEn,
                        cachedAudioPathOdia = local.cachedAudioPathOdia,
                        cachedAudioPathHindi = local.cachedAudioPathHindi,
                        lastPlayedEpochMs = local.lastPlayedEpochMs
                    )
                )
            } else {
                storyDao.upsertStory(cloudStory)
            }
        }
    }

    suspend fun mirrorCloudHazardsToLocal(hazards: List<HazardReportEntity>) = withContext(Dispatchers.IO) {
        hazards.forEach { safetyDao.insertHazardReport(it) }
    }

    suspend fun mirrorCloudOfflineDistrictsToLocal(districtIds: List<String>) = withContext(Dispatchers.IO) {
        districtIds.forEach { id ->
            val district = OdishaDistrictCatalog.getDistrictById(id) ?: return@forEach
            offlinePackDao.saveDistrictOffline(
                OfflineDistrictEntity(
                    districtId = district.id,
                    districtName = "${district.nameEn} (${district.nameOdia})"
                )
            )
        }
    }
}

