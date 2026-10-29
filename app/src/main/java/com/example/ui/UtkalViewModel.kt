package com.example.ui

import android.content.Context
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.example.R
import com.example.data.ai.GeminiLiveSessionManager
import com.example.data.ai.GeminiServiceClient
import com.example.data.ai.LiveSessionUiState
import com.example.data.catalog.OdishaDistrictCatalog
import com.example.data.firebase.CloudSyncRepository
import com.example.data.firebase.SignedInTraveller
import com.example.data.local.HazardReportEntity
import com.example.data.local.ListingIssueReportEntity
import com.example.data.local.OfflineDistrictEntity
import com.example.data.local.SavedTripEntity
import com.example.data.local.StoryEntity
import com.example.data.local.TrustedContactEntity
import com.example.data.local.UserPreferencesRepository
import com.example.data.local.UserPrefsState
import com.example.data.local.UtkalDatabase
import com.example.data.model.AppLanguage
import com.example.data.model.ChatMessage
import com.example.data.model.DistrictRecord
import com.example.data.repository.DayItinerarySlot
import com.example.data.repository.KathaLibraryStats
import com.example.data.repository.UtkalRepository
import com.example.data.voice.NarrationUiState
import com.example.data.voice.UtkalVoiceNarrator
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.UUID

sealed interface AppScreen {
    data object Home : AppScreen
    data object Explore : AppScreen
    data object MyTrips : AppScreen
    data object Safety : AppScreen
    data object Profile : AppScreen

    data class DistrictDetail(val districtId: String) : AppScreen
    data class DestinationStoryDetail(val destinationId: String) : AppScreen
    data class UtkalMitraAi(val contextDistrictId: String? = null, val initialPrompt: String? = null) : AppScreen
    data class UtkalKathaLibrary(val filterDistrictId: String? = null) : AppScreen
    data object GeoMapAndTransit : AppScreen
    data object CuisineAndArtisans : AppScreen
    data object OfflineTravelPack : AppScreen
}

class UtkalViewModel(
    val traveller: SignedInTraveller,
    val repository: UtkalRepository,
    private val cloudSyncRepository: CloudSyncRepository,
    private val prefsRepo: UserPreferencesRepository,
    val narrator: UtkalVoiceNarrator,
    val liveSessionManager: GeminiLiveSessionManager,
    private val mediaScope: CoroutineScope
) : ViewModel() {

    companion object {
        private const val TAG = "UtkalViewModel"

        fun provideFactory(
            appContext: Context,
            traveller: SignedInTraveller
        ): ViewModelProvider.Factory = viewModelFactory {
            initializer {
                val context = appContext.applicationContext
                val db = UtkalDatabase.getInstance(context)
                val geminiClient = GeminiServiceClient()
                val localRepo = UtkalRepository(db, geminiClient)
                val prefsRepo = UserPreferencesRepository(context)
                val databaseId = context.getString(R.string.firestore_database_id)
                val firestore = FirebaseFirestore.getInstance(databaseId)
                val cloudRepo = CloudSyncRepository(firestore)
                val mediaScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
                val narrator = UtkalVoiceNarrator(context, geminiClient, mediaScope)
                val liveManager = GeminiLiveSessionManager(mediaScope)

                UtkalViewModel(
                    traveller = traveller,
                    repository = localRepo,
                    cloudSyncRepository = cloudRepo,
                    prefsRepo = prefsRepo,
                    narrator = narrator,
                    liveSessionManager = liveManager,
                    mediaScope = mediaScope
                )
            }
        }
    }

    private val currentUserId: String = traveller.uid

    // Navigation stack
    private val _screenStack = MutableStateFlow<List<AppScreen>>(listOf(AppScreen.Home))
    val currentScreen: StateFlow<AppScreen> = _screenStack
        .combine(MutableStateFlow(Unit)) { stack, _ -> stack.lastOrNull() ?: AppScreen.Home }
        .stateIn(viewModelScope, SharingStarted.Eagerly, AppScreen.Home)

    val userPrefs: StateFlow<UserPrefsState> = prefsRepo.prefsFlow.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        UserPrefsState()
    )

    val narrationState: StateFlow<NarrationUiState> = narrator.state
    val liveState: StateFlow<LiveSessionUiState> = liveSessionManager.state

    val allStories: StateFlow<List<StoryEntity>> = repository.allStoriesFlow.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
    )

    val kathaStats: StateFlow<KathaLibraryStats> = combine(
        repository.totalStoriesCountFlow,
        repository.reviewedCountFlow,
        repository.generatedCountFlow,
        repository.translatedCountFlow,
        repository.cachedAudioCountFlow
    ) { total, reviewed, generated, translated, cachedAudio ->
        KathaLibraryStats(
            totalDistinctStories = total,
            curatedReviewedCount = reviewed,
            aiSourceGroundedCount = generated,
            multilingualTranslatedCount = translated,
            offlineAudioCachedCount = cachedAudio
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), KathaLibraryStats())

    val savedTrips: StateFlow<List<SavedTripEntity>> = repository.savedTripsFlow.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
    )

    val hazardReports: StateFlow<List<HazardReportEntity>> = repository.hazardReportsFlow.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
    )

    val trustedContacts: StateFlow<List<TrustedContactEntity>> = repository.trustedContactsFlow.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
    )

    val offlineDistricts: StateFlow<List<OfflineDistrictEntity>> = repository.offlineDistrictsFlow.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
    )

    val listingIssues: StateFlow<List<ListingIssueReportEntity>> = repository.listingIssuesFlow.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
    )

    private val _chatMessages = MutableStateFlow<List<ChatMessage>>(
        listOf(
            ChatMessage(
                id = "welcome_mitra",
                isUser = false,
                text = "Namaskar & Jai Jagannath, ${traveller.displayName}! I am Utkal Mitra AI — powered by Firebase AI Logic across all 30 districts of Odisha. Toggle Google Search Grounding for live updates or High Thinking (gemini-4-argon) for deep historical & multi-district route reasoning.",
                modeLabel = "Firebase AI Logic • 30-District Curated RAG",
                reliabilityBadge = "Distinguishes Historical Facts, Epigraphy & Oral Legends",
                suggestedFollowUps = listOf(
                    "Compare Konark, Lingaraj & Khiching temple architecture",
                    "Hidden waterfalls & eco-camps in Koraput and Kandhamal",
                    "Tell me the history of Cuttack Bali Jatra & Rupa Tarakasi"
                )
            )
        )
    )
    val chatMessages: StateFlow<List<ChatMessage>> = _chatMessages.asStateFlow()

    private val _isMitraThinking = MutableStateFlow(false)
    val isMitraThinking: StateFlow<Boolean> = _isMitraThinking.asStateFlow()

    private val _statusToast = MutableStateFlow<String?>(null)
    val statusToast: StateFlow<String?> = _statusToast.asStateFlow()

    init {
        viewModelScope.launch {
            repository.seedInitialRecordsIfEmpty()
            syncInitialUserProfileToCloud()
        }
        startCloudListeners()
    }

    private fun startCloudListeners() {
        viewModelScope.launch {
            cloudSyncRepository.observeUserProfile(currentUserId).collect { cloudPrefs ->
                if (cloudPrefs != null) {
                    prefsRepo.applyCloudSyncedPrefs(cloudPrefs)
                    val remoteOfflineIds = cloudSyncRepository.fetchOfflineDistrictIds(currentUserId)
                    if (remoteOfflineIds.isNotEmpty()) {
                        repository.mirrorCloudOfflineDistrictsToLocal(remoteOfflineIds)
                    }
                }
            }
        }
        viewModelScope.launch {
            cloudSyncRepository.observeSavedTrips(currentUserId).collect { cloudTrips ->
                if (cloudTrips.isNotEmpty()) {
                    repository.mirrorCloudTripsToLocal(cloudTrips)
                }
            }
        }
        viewModelScope.launch {
            cloudSyncRepository.observeTrustedContacts(currentUserId).collect { cloudContacts ->
                if (cloudContacts.isNotEmpty()) {
                    repository.mirrorCloudContactsToLocal(cloudContacts)
                }
            }
        }
        viewModelScope.launch {
            cloudSyncRepository.observeUserStories(currentUserId).collect { cloudStories ->
                if (cloudStories.isNotEmpty()) {
                    repository.mirrorCloudStoriesToLocal(cloudStories)
                }
            }
        }
        viewModelScope.launch {
            cloudSyncRepository.observeUserSafetyReports(currentUserId).collect { cloudHazards ->
                if (cloudHazards.isNotEmpty()) {
                    repository.mirrorCloudHazardsToLocal(cloudHazards)
                }
            }
        }
    }

    private suspend fun syncInitialUserProfileToCloud() {
        runCloudSyncSafely {
            val localPrefs = prefsRepo.prefsFlow.first()
            val offlineIds = repository.offlineDistrictsFlow.first().map { it.districtId }
            cloudSyncRepository.ensureOrUpsertUserProfile(
                userId = currentUserId,
                displayName = traveller.displayName,
                prefs = localPrefs,
                offlineDistrictIds = offlineIds
            )
        }
    }

    private suspend fun pushCurrentProfileToCloud() {
        runCloudSyncSafely {
            val latestPrefs = prefsRepo.prefsFlow.first()
            val offlineIds = repository.offlineDistrictsFlow.first().map { it.districtId }
            cloudSyncRepository.ensureOrUpsertUserProfile(
                userId = currentUserId,
                displayName = traveller.displayName,
                prefs = latestPrefs,
                offlineDistrictIds = offlineIds
            )
        }
    }

    private suspend fun runCloudSyncSafely(block: suspend () -> Unit) {
        try {
            block()
        } catch (ce: CancellationException) {
            throw ce
        } catch (e: Exception) {
            Log.w(TAG, "Cloud sync deferred (local Room/DataStore updated): ${e.message}")
        }
    }

    fun navigateTo(screen: AppScreen, resetRoot: Boolean = false) {
        if (resetRoot) {
            _screenStack.value = listOf(screen)
        } else {
            val current = _screenStack.value
            if (current.lastOrNull() != screen) {
                _screenStack.value = current + screen
            }
        }
    }

    fun canNavigateBack(): Boolean = _screenStack.value.size > 1

    fun navigateBack(): Boolean {
        val current = _screenStack.value
        return if (current.size > 1) {
            _screenStack.value = current.dropLast(1)
            true
        } else {
            false
        }
    }

    fun selectLanguage(lang: AppLanguage) {
        viewModelScope.launch {
            prefsRepo.setLanguage(lang)
            showToast("Language switched to ${lang.label} (${lang.nativeLabel})")
            pushCurrentProfileToCloud()
        }
    }

    fun completeOnboarding() {
        viewModelScope.launch {
            prefsRepo.completeOnboarding()
            pushCurrentProfileToCloud()
        }
    }

    fun setVoiceProfile(voiceName: String) {
        viewModelScope.launch {
            prefsRepo.setVoiceProfile(voiceName)
            showToast("Narrator voice set to $voiceName")
            pushCurrentProfileToCloud()
        }
    }

    fun setSpeechSpeed(speed: Float) {
        viewModelScope.launch {
            prefsRepo.setSpeechSpeed(speed)
            narrator.updateSpeed(speed)
            pushCurrentProfileToCloud()
        }
    }

    fun recordSearch(query: String) {
        viewModelScope.launch {
            prefsRepo.recordRecentSearch(query)
            pushCurrentProfileToCloud()
        }
    }

    fun toggleFavoriteDestination(destId: String) {
        viewModelScope.launch {
            prefsRepo.toggleFavoriteDestination(destId)
            pushCurrentProfileToCloud()
        }
    }

    fun askMitraQuestion(
        query: String,
        districtId: String?,
        useHighThinking: Boolean,
        useSearchGrounding: Boolean,
        autoNarrateResponse: Boolean
    ) {
        val trimmed = query.trim()
        if (trimmed.isBlank() || _isMitraThinking.value) return

        val district = districtId?.let { OdishaDistrictCatalog.getDistrictById(it) }
        val userMsg = ChatMessage(
            id = "u_${UUID.randomUUID().toString().take(8)}",
            isUser = true,
            text = trimmed,
            districtContext = district?.nameEn
        )
        val historyPairs = _chatMessages.value.drop(1).map { it.isUser to it.text }
        _chatMessages.value = _chatMessages.value + userMsg
        _isMitraThinking.value = true

        viewModelScope.launch {
            val prefs = userPrefs.value
            val result = repository.geminiClient.askUtkalMitra(
                userQuery = trimmed,
                selectedDistrict = district,
                language = prefs.language,
                conversationHistory = historyPairs,
                useHighThinking = useHighThinking,
                useSearchGrounding = useSearchGrounding
            )
            val botMsg = ChatMessage(
                id = "m_${UUID.randomUUID().toString().take(8)}",
                isUser = false,
                text = result.text,
                districtContext = district?.nameEn,
                modeLabel = result.modeLabel,
                reliabilityBadge = result.reliabilityBadge,
                sourceCitations = result.citations,
                suggestedFollowUps = result.suggestedFollowUps
            )
            _chatMessages.value = _chatMessages.value + botMsg
            _isMitraThinking.value = false

            if (autoNarrateResponse) {
                narrator.speak(
                    cacheKey = botMsg.id,
                    title = "Utkal Mitra AI (${district?.nameEn ?: "Odisha"})",
                    text = result.text,
                    language = prefs.language,
                    voiceProfile = prefs.preferredVoiceName,
                    speed = prefs.speechSpeed
                )
            }
        }
    }

    fun narrateStory(story: StoryEntity, overrideLang: AppLanguage? = null) {
        val prefs = userPrefs.value
        val targetLang = overrideLang ?: prefs.language
        val text = when (targetLang) {
            AppLanguage.ODIA -> story.bodyOdia.ifBlank { story.bodyEn }
            AppLanguage.HINDI -> story.bodyHindi.ifBlank { story.bodyEn }
            AppLanguage.ENGLISH -> story.bodyEn
        }
        val title = when (targetLang) {
            AppLanguage.ODIA -> story.titleOdia.ifBlank { story.titleEn }
            AppLanguage.HINDI -> story.titleHindi.ifBlank { story.titleEn }
            AppLanguage.ENGLISH -> story.titleEn
        }

        narrator.speak(
            cacheKey = "story_${story.id}",
            title = title,
            text = text,
            language = targetLang,
            voiceProfile = prefs.preferredVoiceName,
            speed = prefs.speechSpeed,
            onCachedFileReady = { wavFile ->
                viewModelScope.launch {
                    repository.recordStoryPlayback(story.id, targetLang, wavFile.absolutePath)
                }
            }
        )
        viewModelScope.launch {
            repository.recordStoryPlayback(story.id, targetLang, null)
        }
    }

    fun toggleStoryFavorite(story: StoryEntity) {
        viewModelScope.launch {
            val updated = repository.toggleStoryFavorite(story)
            runCloudSyncSafely {
                cloudSyncRepository.upsertUserStory(currentUserId, updated)
            }
        }
    }

    fun toggleStoryOffline(story: StoryEntity) {
        viewModelScope.launch {
            val updated = repository.toggleStoryOffline(story)
            showToast(if (updated.isOfflineSaved) "Saved story to Offline Travel Pack & Cloud" else "Removed from Offline Pack")
            runCloudSyncSafely {
                cloudSyncRepository.upsertUserStory(currentUserId, updated)
            }
        }
    }

    fun generateAiStoriesForDistrict(district: DistrictRecord) {
        viewModelScope.launch {
            showToast("Generating verified source-grounded stories for ${district.nameEn}…")
            val res = repository.expandStoriesForDistrictWithAi(district)
            res.onSuccess { stories ->
                showToast("Added ${stories.size} distinct new story record(s) for ${district.nameEn} (synced to Cloud).")
                stories.forEach { entity ->
                    runCloudSyncSafely {
                        cloudSyncRepository.upsertUserStory(currentUserId, entity)
                    }
                }
            }.onFailure { err ->
                showToast(err.message ?: "Story generation failed")
            }
        }
    }

    fun importBatchStoriesJson(jsonPayload: String) {
        viewModelScope.launch {
            val res = repository.importStoriesBatchJson(jsonPayload)
            res.onSuccess { (addedStories, skipped) ->
                showToast("Batch import complete: ${addedStories.size} distinct stories added, $skipped duplicates skipped.")
                addedStories.forEach { entity ->
                    runCloudSyncSafely {
                        cloudSyncRepository.upsertUserStory(currentUserId, entity)
                    }
                }
            }.onFailure { err ->
                showToast("Invalid JSON array format: ${err.localizedMessage}")
            }
        }
    }

    fun createAndSaveTrip(
        startingCity: String,
        districtIds: List<String>,
        durationDays: Int,
        datesLabel: String,
        travellers: Int,
        tier: String,
        interests: List<String>
    ): SavedTripEntity {
        val (trip, slots) = repository.generateDeterministicItinerary(
            startingCity = startingCity,
            selectedDistrictIds = districtIds,
            durationDays = durationDays,
            travelDatesLabel = datesLabel,
            travellerCount = travellers,
            tier = tier,
            interests = interests
        )
        viewModelScope.launch {
            repository.saveTrip(trip)
            showToast("Saved '${trip.title}' to Cloud & Offline Pack")
            runCloudSyncSafely {
                cloudSyncRepository.upsertSavedTrip(currentUserId, trip, slots)
            }
        }
        return trip
    }

    fun updateSavedTripSlots(trip: SavedTripEntity, updatedSlots: List<DayItinerarySlot>) {
        viewModelScope.launch {
            val recomputedTotal = updatedSlots.sumOf { it.dayBudgetInr }
            val updated = trip.copy(
                totalEstimatedCostInr = recomputedTotal,
                itineraryDaysJson = repository.serializeDaySlots(updatedSlots),
                updatedAtEpochMs = System.currentTimeMillis()
            )
            repository.saveTrip(updated)
            showToast("Updated itinerary saved to Cloud.")
            runCloudSyncSafely {
                cloudSyncRepository.upsertSavedTrip(currentUserId, updated, updatedSlots)
            }
        }
    }

    fun deleteTrip(tripId: String) {
        viewModelScope.launch {
            repository.deleteTrip(tripId)
            showToast("Itinerary deleted.")
            runCloudSyncSafely {
                cloudSyncRepository.deleteSavedTrip(currentUserId, tripId)
            }
        }
    }

    fun submitHazardReport(
        districtId: String,
        location: String,
        category: String,
        description: String,
        severity: String,
        lat: Double?,
        lon: Double?
    ) {
        viewModelScope.launch {
            val created = repository.submitCommunityHazardReport(districtId, location, category, description, severity, lat, lon)
            showToast("Hazard report logged with Pending Moderation status.")
            runCloudSyncSafely {
                cloudSyncRepository.submitSafetyOrListingReport(
                    userId = currentUserId,
                    reportId = created.id,
                    reportType = "HAZARD",
                    districtId = districtId,
                    targetLabel = location,
                    category = category,
                    description = description,
                    severity = severity
                )
            }
        }
    }

    fun addTrustedContact(name: String, relation: String, phone: String) {
        viewModelScope.launch {
            val created = repository.addTrustedContact(name, relation, phone)
            showToast("Trusted contact encrypted & synced privately.")
            runCloudSyncSafely {
                cloudSyncRepository.createTrustedContact(currentUserId, created)
            }
        }
    }

    fun removeTrustedContact(id: String) {
        viewModelScope.launch {
            repository.deleteTrustedContact(id)
            runCloudSyncSafely {
                cloudSyncRepository.deleteTrustedContact(currentUserId, id)
            }
        }
    }

    fun toggleDistrictOffline(district: DistrictRecord, isSaved: Boolean) {
        viewModelScope.launch {
            repository.toggleDistrictOfflinePack(district, isSaved)
            showToast(if (!isSaved) "${district.nameEn} pinned to Offline Pack" else "${district.nameEn} removed from Offline Pack")
            pushCurrentProfileToCloud()
        }
    }

    fun submitListingCorrection(listingId: String, title: String, note: String) {
        viewModelScope.launch {
            val created = repository.reportListingIssue(listingId, title, note)
            showToast("Listing correction queued for editorial review.")
            runCloudSyncSafely {
                cloudSyncRepository.submitSafetyOrListingReport(
                    userId = currentUserId,
                    reportId = created.id,
                    reportType = "LISTING_ISSUE",
                    districtId = "odisha",
                    targetLabel = "$title ($listingId)",
                    category = "Listing Correction",
                    description = note,
                    severity = "Editorial"
                )
            }
        }
    }

    fun clearToast() {
        _statusToast.value = null
    }

    fun showToast(message: String) {
        _statusToast.value = message
    }

    override fun onCleared() {
        super.onCleared()
        narrator.release()
        liveSessionManager.disconnect()
        mediaScope.cancel()
    }
}
