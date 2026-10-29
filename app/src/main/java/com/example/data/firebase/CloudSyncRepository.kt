package com.example.data.firebase

import com.example.data.local.HazardReportEntity
import com.example.data.local.OfflineDistrictEntity
import com.example.data.local.SavedTripEntity
import com.example.data.local.StoryEntity
import com.example.data.local.TrustedContactEntity
import com.example.data.local.UserPrefsState
import com.example.data.model.AppLanguage
import com.example.data.repository.DayItinerarySlot
import com.google.firebase.Timestamp
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.SetOptions
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import org.json.JSONArray
import org.json.JSONObject

/**
 * Cloud Firestore synchronization repository scoped strictly to `/users/{userId}` and its
 * owner-only subcollections. Always receives an explicit [FirebaseFirestore] instance created
 * with `R.string.firestore_database_id` (or an emulator-connected test instance).
 */
class CloudSyncRepository(
    private val firestore: FirebaseFirestore
) {
    private fun userDoc(userId: String) = firestore.collection("users").document(userId)
    private fun tripsCol(userId: String) = userDoc(userId).collection("trips")
    private fun contactsCol(userId: String) = userDoc(userId).collection("trusted_contacts")
    private fun storiesCol(userId: String) = userDoc(userId).collection("user_stories")
    private fun reportsCol(userId: String) = userDoc(userId).collection("safety_reports")

    // -------------------------------------------------------------------------
    // 1. UserProfile (/users/{userId})
    // -------------------------------------------------------------------------

    fun observeUserProfile(userId: String): Flow<UserPrefsState?> = callbackFlow {
        val path = "users/$userId"
        val registration = userDoc(userId).addSnapshotListener { snapshot, error ->
            if (error != null) {
                FirestoreErrorHandler.handleFirestoreError(error, OperationType.GET, path)
                return@addSnapshotListener
            }
            if (snapshot != null && snapshot.exists()) {
                trySend(snapshot.toUserPrefsState())
            } else {
                trySend(null)
            }
        }
        awaitClose { registration.remove() }
    }

    suspend fun ensureOrUpsertUserProfile(
        userId: String,
        displayName: String,
        prefs: UserPrefsState,
        offlineDistrictIds: List<String>
    ) {
        val path = "users/$userId"
        val safeName = displayName.trim().ifBlank { "Odisha Traveller" }.take(120)
        val safeSpeed = prefs.speechSpeed.toDouble().coerceIn(0.75, 1.5)
        val safeVoice = prefs.preferredVoiceName.takeIf { it in setOf("Charon", "Orus", "Kore") } ?: "Charon"
        val safeLang = prefs.language.code.takeIf { it in setOf("en", "or", "hi") } ?: "en"

        try {
            val existing = userDoc(userId).get().await()
            if (!existing.exists()) {
                val createPayload = mapOf(
                    "userId" to userId,
                    "displayName" to safeName,
                    "languageCode" to safeLang,
                    "preferredVoice" to safeVoice,
                    "speechSpeed" to safeSpeed,
                    "hasCompletedOnboarding" to prefs.hasCompletedOnboarding,
                    "favoriteDestinationIds" to prefs.favoriteDestinationIds.take(100),
                    "offlineDistrictIds" to offlineDistrictIds.distinct().take(30),
                    "recentSearches" to prefs.recentSearches.take(10),
                    "createdAt" to FieldValue.serverTimestamp(),
                    "updatedAt" to FieldValue.serverTimestamp()
                )
                userDoc(userId).set(createPayload).await()
            } else {
                val updatePayload = mapOf(
                    "displayName" to safeName,
                    "languageCode" to safeLang,
                    "preferredVoice" to safeVoice,
                    "speechSpeed" to safeSpeed,
                    "hasCompletedOnboarding" to prefs.hasCompletedOnboarding,
                    "favoriteDestinationIds" to prefs.favoriteDestinationIds.take(100),
                    "offlineDistrictIds" to offlineDistrictIds.distinct().take(30),
                    "recentSearches" to prefs.recentSearches.take(10),
                    "updatedAt" to FieldValue.serverTimestamp()
                )
                userDoc(userId).update(updatePayload).await()
            }
        } catch (e: Exception) {
            throw FirestoreErrorHandler.handleFirestoreError(e, OperationType.WRITE, path)
        }
    }

    // -------------------------------------------------------------------------
    // 2. SavedTrip (/users/{userId}/trips/{tripId}) — Native Maps & Lists
    // -------------------------------------------------------------------------

    fun observeSavedTrips(userId: String): Flow<List<SavedTripEntity>> = callbackFlow {
        val path = "users/$userId/trips"
        val registration = tripsCol(userId)
            .orderBy("updatedAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    FirestoreErrorHandler.handleFirestoreError(error, OperationType.LIST, path)
                    return@addSnapshotListener
                }
                val trips = snapshot?.documents?.mapNotNull { it.toSavedTripEntity() }.orEmpty()
                trySend(trips)
            }
        awaitClose { registration.remove() }
    }

    suspend fun upsertSavedTrip(
        userId: String,
        trip: SavedTripEntity,
        slots: List<DayItinerarySlot>
    ) {
        val docId = sanitizeId(trip.id)
        val path = "users/$userId/trips/$docId"
        val districtIds = trip.selectedDistrictsCsv.split(",").map { it.trim() }.filter { it.isNotBlank() }
            .ifEmpty { listOf("khordha") }.take(30)
        val interests = trip.interestsCsv.split(",").map { it.trim() }.filter { it.isNotBlank() }.take(20)
        val nativeSlots: List<Map<String, Any>> = slots.take(14).map { slot ->
            mapOf(
                "dayNumber" to slot.dayNumber,
                "districtName" to slot.districtName.take(120),
                "primaryStop" to slot.primaryStop.take(160),
                "secondaryStop" to slot.secondaryStop.take(160),
                "estimatedTravelKm" to slot.estimatedTravelKm,
                "estimatedDriveMinutes" to slot.estimatedDriveMinutes,
                "transportRecommendation" to slot.transportRecommendation.take(200),
                "staySuggestion" to slot.staySuggestion.take(200),
                "foodHighlight" to slot.foodHighlight.take(200),
                "dayBudgetInr" to slot.dayBudgetInr,
                "userCustomNotes" to slot.userCustomNotes.take(300)
            )
        }.ifEmpty {
            listOf(
                mapOf(
                    "dayNumber" to 1,
                    "districtName" to "Khordha",
                    "primaryStop" to "Bhubaneswar Temple Circuit",
                    "secondaryStop" to "Ekamra Haat",
                    "estimatedTravelKm" to 25,
                    "estimatedDriveMinutes" to 45,
                    "transportRecommendation" to "Local Cab",
                    "staySuggestion" to "OTDC Panthanivas",
                    "foodHighlight" to "Dalma & Rasagola",
                    "dayBudgetInr" to trip.totalEstimatedCostInr.coerceAtLeast(1500),
                    "userCustomNotes" to ""
                )
            )
        }

        try {
            val ref = tripsCol(userId).document(docId)
            val snap = ref.get().await()
            if (!snap.exists()) {
                val payload = mapOf(
                    "userId" to userId,
                    "title" to trip.title.ifBlank { "Odisha Trip" }.take(200),
                    "startingCity" to trip.startingCity.ifBlank { "Bhubaneswar" }.take(100),
                    "selectedDistrictIds" to districtIds,
                    "durationDays" to trip.durationDays.coerceIn(1, 14),
                    "travelDatesLabel" to trip.travelDatesLabel.ifBlank { "Flexible Season" }.take(120),
                    "travellerCount" to trip.travellerCount.coerceIn(1, 50),
                    "tierPreference" to (trip.tierPreference.takeIf { it in setOf("Budget", "Moderate", "Luxury") } ?: "Moderate"),
                    "interests" to interests,
                    "totalEstimatedCostInr" to trip.totalEstimatedCostInr.coerceIn(0, 10_000_000),
                    "costAssumptionsNote" to trip.costAssumptionsNote.ifBlank { "Deterministic estimate" }.take(1000),
                    "daySlots" to nativeSlots,
                    "createdAt" to FieldValue.serverTimestamp(),
                    "updatedAt" to FieldValue.serverTimestamp()
                )
                ref.set(payload).await()
            } else {
                val updatePayload = mapOf(
                    "title" to trip.title.ifBlank { "Odisha Trip" }.take(200),
                    "startingCity" to trip.startingCity.ifBlank { "Bhubaneswar" }.take(100),
                    "selectedDistrictIds" to districtIds,
                    "durationDays" to trip.durationDays.coerceIn(1, 14),
                    "travelDatesLabel" to trip.travelDatesLabel.ifBlank { "Flexible Season" }.take(120),
                    "travellerCount" to trip.travellerCount.coerceIn(1, 50),
                    "tierPreference" to (trip.tierPreference.takeIf { it in setOf("Budget", "Moderate", "Luxury") } ?: "Moderate"),
                    "interests" to interests,
                    "totalEstimatedCostInr" to trip.totalEstimatedCostInr.coerceIn(0, 10_000_000),
                    "costAssumptionsNote" to trip.costAssumptionsNote.ifBlank { "Deterministic estimate" }.take(1000),
                    "daySlots" to nativeSlots,
                    "updatedAt" to FieldValue.serverTimestamp()
                )
                ref.update(updatePayload).await()
            }
        } catch (e: Exception) {
            throw FirestoreErrorHandler.handleFirestoreError(e, OperationType.WRITE, path)
        }
    }

    suspend fun deleteSavedTrip(userId: String, tripId: String) {
        val docId = sanitizeId(tripId)
        val path = "users/$userId/trips/$docId"
        try {
            tripsCol(userId).document(docId).delete().await()
        } catch (e: Exception) {
            throw FirestoreErrorHandler.handleFirestoreError(e, OperationType.DELETE, path)
        }
    }

    // -------------------------------------------------------------------------
    // 3. TrustedContact (/users/{userId}/trusted_contacts/{contactId}) — PII Isolated
    // -------------------------------------------------------------------------

    fun observeTrustedContacts(userId: String): Flow<List<TrustedContactEntity>> = callbackFlow {
        val path = "users/$userId/trusted_contacts"
        val registration = contactsCol(userId).addSnapshotListener { snapshot, error ->
            if (error != null) {
                FirestoreErrorHandler.handleFirestoreError(error, OperationType.LIST, path)
                return@addSnapshotListener
            }
            val contacts = snapshot?.documents?.mapNotNull { doc ->
                val name = doc.getString("name") ?: return@mapNotNull null
                val relation = doc.getString("relation") ?: "Family"
                val phone = doc.getString("phoneNumber") ?: return@mapNotNull null
                TrustedContactEntity(
                    id = doc.id,
                    name = name,
                    relation = relation,
                    phoneNumber = phone
                )
            }.orEmpty()
            trySend(contacts)
        }
        awaitClose { registration.remove() }
    }

    suspend fun createTrustedContact(userId: String, contact: TrustedContactEntity) {
        val docId = sanitizeId(contact.id)
        val path = "users/$userId/trusted_contacts/$docId"
        val payload = mapOf(
            "userId" to userId,
            "name" to contact.name.trim().take(100),
            "relation" to contact.relation.trim().ifBlank { "Family" }.take(60),
            "phoneNumber" to contact.phoneNumber.trim().take(25),
            "createdAt" to FieldValue.serverTimestamp()
        )
        try {
            contactsCol(userId).document(docId).set(payload).await()
        } catch (e: Exception) {
            throw FirestoreErrorHandler.handleFirestoreError(e, OperationType.CREATE, path)
        }
    }

    suspend fun deleteTrustedContact(userId: String, contactId: String) {
        val docId = sanitizeId(contactId)
        val path = "users/$userId/trusted_contacts/$docId"
        try {
            contactsCol(userId).document(docId).delete().await()
        } catch (e: Exception) {
            throw FirestoreErrorHandler.handleFirestoreError(e, OperationType.DELETE, path)
        }
    }

    // -------------------------------------------------------------------------
    // 4. UserStory (/users/{userId}/user_stories/{storyId})
    // -------------------------------------------------------------------------

    fun observeUserStories(userId: String): Flow<List<StoryEntity>> = callbackFlow {
        val path = "users/$userId/user_stories"
        val registration = storiesCol(userId).addSnapshotListener { snapshot, error ->
            if (error != null) {
                FirestoreErrorHandler.handleFirestoreError(error, OperationType.LIST, path)
                return@addSnapshotListener
            }
            val list = snapshot?.documents?.mapNotNull { it.toStoryEntity() }.orEmpty()
            trySend(list)
        }
        awaitClose { registration.remove() }
    }

    suspend fun upsertUserStory(userId: String, story: StoryEntity) {
        val docId = sanitizeId(story.id)
        val path = "users/$userId/user_stories/$docId"
        try {
            val ref = storiesCol(userId).document(docId)
            val existing = ref.get().await()
            if (!existing.exists()) {
                val payload = mapOf(
                    "userId" to userId,
                    "titleEn" to story.titleEn.take(240),
                    "titleOdia" to story.titleOdia.take(240),
                    "titleHindi" to story.titleHindi.take(240),
                    "districtId" to story.districtId.take(60),
                    "destinationId" to story.destinationId.take(100),
                    "destinationName" to story.destinationName.take(160),
                    "category" to story.category.take(80),
                    "historicalPeriod" to story.historicalPeriod.take(120),
                    "factClassification" to story.factClassification.take(120),
                    "bodyEn" to story.bodyEn.take(8000),
                    "bodyOdia" to story.bodyOdia.take(8000),
                    "bodyHindi" to story.bodyHindi.take(8000),
                    "sourceReferences" to story.sourceReferences.ifBlank { "Odisha Gazetteer" }.take(600),
                    "editorialStatus" to story.editorialStatus.take(120),
                    "isAiGenerated" to story.isAiGenerated,
                    "isFavorite" to story.isFavorite,
                    "isOfflineSaved" to story.isOfflineSaved,
                    "contentHash" to story.contentHash.take(128),
                    "createdAt" to FieldValue.serverTimestamp(),
                    "updatedAt" to FieldValue.serverTimestamp()
                )
                ref.set(payload).await()
            } else {
                val updatePayload = mapOf(
                    "titleOdia" to story.titleOdia.take(240),
                    "titleHindi" to story.titleHindi.take(240),
                    "bodyOdia" to story.bodyOdia.take(8000),
                    "bodyHindi" to story.bodyHindi.take(8000),
                    "editorialStatus" to story.editorialStatus.take(120),
                    "isFavorite" to story.isFavorite,
                    "isOfflineSaved" to story.isOfflineSaved,
                    "updatedAt" to FieldValue.serverTimestamp()
                )
                ref.update(updatePayload).await()
            }
        } catch (e: Exception) {
            throw FirestoreErrorHandler.handleFirestoreError(e, OperationType.WRITE, path)
        }
    }

    // -------------------------------------------------------------------------
    // 5. SafetyReport (/users/{userId}/safety_reports/{reportId})
    // -------------------------------------------------------------------------

    fun observeUserSafetyReports(userId: String): Flow<List<HazardReportEntity>> = callbackFlow {
        val path = "users/$userId/safety_reports"
        val registration = reportsCol(userId).addSnapshotListener { snapshot, error ->
            if (error != null) {
                FirestoreErrorHandler.handleFirestoreError(error, OperationType.LIST, path)
                return@addSnapshotListener
            }
            val hazards = snapshot?.documents?.mapNotNull { doc ->
                if (doc.getString("reportType") != "HAZARD") return@mapNotNull null
                HazardReportEntity(
                    id = doc.id,
                    districtId = doc.getString("districtId") ?: "khordha",
                    locationLabel = doc.getString("targetLabel") ?: "Odisha Road",
                    category = doc.getString("category") ?: "Road Disruption",
                    description = doc.getString("description") ?: "",
                    severity = doc.getString("severity") ?: "Caution",
                    verificationStatus = doc.getString("verificationStatus")
                        ?: "User Submitted — Unverified (Pending Moderation)",
                    latitude = null,
                    longitude = null,
                    reportedAtEpochMs = doc.getTimestamp("createdAt")?.toDate()?.time
                        ?: System.currentTimeMillis()
                )
            }.orEmpty()
            trySend(hazards)
        }
        awaitClose { registration.remove() }
    }

    suspend fun submitSafetyOrListingReport(
        userId: String,
        reportId: String,
        reportType: String, // "HAZARD" or "LISTING_ISSUE"
        districtId: String,
        targetLabel: String,
        category: String,
        description: String,
        severity: String
    ) {
        val docId = sanitizeId(reportId)
        val path = "users/$userId/safety_reports/$docId"
        val safeSeverity = severity.takeIf { it in setOf("Advisory", "Caution", "Urgent", "Editorial") } ?: "Caution"
        val safeDesc = description.trim().padEnd(5, '.').take(1500)
        val payload = mapOf(
            "userId" to userId,
            "reportType" to if (reportType == "LISTING_ISSUE") "LISTING_ISSUE" else "HAZARD",
            "districtId" to districtId.ifBlank { "khordha" }.take(60),
            "targetLabel" to targetLabel.ifBlank { "Odisha Location" }.take(200),
            "category" to category.ifBlank { "General" }.take(80),
            "description" to safeDesc,
            "severity" to safeSeverity,
            "verificationStatus" to "User Submitted — Unverified (Pending Moderation)",
            "createdAt" to FieldValue.serverTimestamp()
        )
        try {
            reportsCol(userId).document(docId).set(payload).await()
        } catch (e: Exception) {
            throw FirestoreErrorHandler.handleFirestoreError(e, OperationType.CREATE, path)
        }
    }

    // -------------------------------------------------------------------------
    // Mappers & Helpers
    // -------------------------------------------------------------------------

    fun extractOfflineDistrictEntities(snapshotPrefsDistricts: List<String>, lookupLabel: (String) -> String): List<OfflineDistrictEntity> {
        return snapshotPrefsDistricts.map { id ->
            OfflineDistrictEntity(districtId = id, districtName = lookupLabel(id))
        }
    }

    suspend fun fetchOfflineDistrictIds(userId: String): List<String> {
        val path = "users/$userId"
        return try {
            val snap = userDoc(userId).get().await()
            @Suppress("UNCHECKED_CAST")
            (snap.get("offlineDistrictIds") as? List<String>).orEmpty()
        } catch (e: Exception) {
            FirestoreErrorHandler.handleFirestoreError(e, OperationType.GET, path)
            emptyList()
        }
    }

    private fun sanitizeId(raw: String): String {
        val cleaned = raw.replace(Regex("[^a-zA-Z0-9_\\-]"), "_").take(120)
        return cleaned.ifBlank { "id_${System.currentTimeMillis()}" }
    }

    private fun DocumentSnapshot.toUserPrefsState(): UserPrefsState {
        val langCode = getString("languageCode") ?: "en"
        @Suppress("UNCHECKED_CAST")
        val favs = (get("favoriteDestinationIds") as? List<String>)?.toSet().orEmpty()
        @Suppress("UNCHECKED_CAST")
        val recents = (get("recentSearches") as? List<String>).orEmpty()
        return UserPrefsState(
            hasCompletedOnboarding = getBoolean("hasCompletedOnboarding") ?: true,
            language = AppLanguage.fromCode(langCode),
            preferredVoiceName = getString("preferredVoice") ?: "Charon",
            speechSpeed = (getDouble("speechSpeed") ?: 1.0).toFloat().coerceIn(0.75f, 1.5f),
            favoriteDestinationIds = favs,
            recentSearches = recents
        )
    }

    private fun DocumentSnapshot.toSavedTripEntity(): SavedTripEntity? {
        val title = getString("title") ?: return null
        @Suppress("UNCHECKED_CAST")
        val dists = (get("selectedDistrictIds") as? List<String>).orEmpty()
        @Suppress("UNCHECKED_CAST")
        val interests = (get("interests") as? List<String>).orEmpty()
        @Suppress("UNCHECKED_CAST")
        val rawSlots = (get("daySlots") as? List<Map<String, Any?>>).orEmpty()

        val jsonArr = JSONArray()
        rawSlots.forEachIndexed { index, m ->
            jsonArr.put(
                JSONObject()
                    .put("dayNumber", (m["dayNumber"] as? Number)?.toInt() ?: (index + 1))
                    .put("districtName", m["districtName"]?.toString().orEmpty())
                    .put("primaryStop", m["primaryStop"]?.toString().orEmpty())
                    .put("secondaryStop", m["secondaryStop"]?.toString().orEmpty())
                    .put("estimatedTravelKm", (m["estimatedTravelKm"] as? Number)?.toInt() ?: 25)
                    .put("estimatedDriveMinutes", (m["estimatedDriveMinutes"] as? Number)?.toInt() ?: 45)
                    .put("transportRecommendation", m["transportRecommendation"]?.toString().orEmpty())
                    .put("staySuggestion", m["staySuggestion"]?.toString().orEmpty())
                    .put("foodHighlight", m["foodHighlight"]?.toString().orEmpty())
                    .put("dayBudgetInr", (m["dayBudgetInr"] as? Number)?.toInt() ?: 2500)
                    .put("userCustomNotes", m["userCustomNotes"]?.toString().orEmpty())
            )
        }

        val updatedMs = (get("updatedAt") as? Timestamp)?.toDate()?.time ?: System.currentTimeMillis()
        val createdMs = (get("createdAt") as? Timestamp)?.toDate()?.time ?: updatedMs

        return SavedTripEntity(
            id = id,
            title = title,
            startingCity = getString("startingCity") ?: "Bhubaneswar",
            selectedDistrictsCsv = dists.joinToString(","),
            durationDays = (getLong("durationDays") ?: 3L).toInt(),
            travelDatesLabel = getString("travelDatesLabel") ?: "Flexible Season",
            travellerCount = (getLong("travellerCount") ?: 2L).toInt(),
            tierPreference = getString("tierPreference") ?: "Moderate",
            interestsCsv = interests.joinToString(","),
            totalEstimatedCostInr = (getLong("totalEstimatedCostInr") ?: 0L).toInt(),
            costAssumptionsNote = getString("costAssumptionsNote") ?: "",
            itineraryDaysJson = jsonArr.toString(),
            createdAtEpochMs = createdMs,
            updatedAtEpochMs = updatedMs
        )
    }

    private fun DocumentSnapshot.toStoryEntity(): StoryEntity? {
        val titleEn = getString("titleEn") ?: return null
        val bodyEn = getString("bodyEn") ?: return null
        val updatedMs = (get("updatedAt") as? Timestamp)?.toDate()?.time ?: System.currentTimeMillis()
        return StoryEntity(
            id = id,
            titleEn = titleEn,
            titleOdia = getString("titleOdia").orEmpty(),
            titleHindi = getString("titleHindi").orEmpty(),
            districtId = getString("districtId") ?: "puri",
            destinationId = getString("destinationId") ?: "puri_jagannath",
            destinationName = getString("destinationName") ?: "Odisha Heritage",
            category = getString("category") ?: "Sacred Architecture",
            historicalPeriod = getString("historicalPeriod") ?: "Historical Odisha",
            narrativeFormat = "Detailed Narrative",
            originalLanguage = "en",
            bodyEn = bodyEn,
            bodyOdia = getString("bodyOdia").orEmpty(),
            bodyHindi = getString("bodyHindi").orEmpty(),
            factClassification = getString("factClassification") ?: "Documented Historical Record",
            sourceReferences = getString("sourceReferences") ?: "Odisha Gazetteer",
            editorialStatus = getString("editorialStatus") ?: "Synced Story",
            isAiGenerated = getBoolean("isAiGenerated") ?: true,
            isFavorite = getBoolean("isFavorite") ?: false,
            isOfflineSaved = getBoolean("isOfflineSaved") ?: false,
            estimatedDurationSec = (bodyEn.split(" ").size / 2.2).toInt().coerceAtLeast(45),
            contentHash = getString("contentHash") ?: "hash_${id.take(12)}",
            updatedAtEpochMs = updatedMs
        )
    }
}
