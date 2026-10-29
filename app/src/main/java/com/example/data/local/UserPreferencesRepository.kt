package com.example.data.local

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.floatPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.example.data.model.AppLanguage
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "utkal_user_prefs")

data class UserPrefsState(
    val language: AppLanguage = AppLanguage.ENGLISH,
    val hasCompletedOnboarding: Boolean = false,
    val preferredVoiceName: String = "Charon", // Charon (Deep Authoritative), Orus (Warm Baritone), Kore (Clear Expressive)
    val speechSpeed: Float = 1.0f,
    val recentSearches: List<String> = emptyList(),
    val favoriteDestinationIds: Set<String> = emptySet()
)

class UserPreferencesRepository(private val context: Context) {
    private val keyLang = stringPreferencesKey("app_language")
    private val keyOnboarding = booleanPreferencesKey("completed_onboarding")
    private val keyVoice = stringPreferencesKey("preferred_voice")
    private val keySpeed = floatPreferencesKey("speech_speed")
    private val keyRecentSearches = stringPreferencesKey("recent_searches_pipe")
    private val keyFavDestinations = stringPreferencesKey("fav_destinations_pipe")

    val prefsFlow: Flow<UserPrefsState> = context.dataStore.data.map { prefs ->
        val searchesRaw = prefs[keyRecentSearches].orEmpty()
        val favsRaw = prefs[keyFavDestinations].orEmpty()
        UserPrefsState(
            language = AppLanguage.fromCode(prefs[keyLang] ?: "en"),
            hasCompletedOnboarding = prefs[keyOnboarding] ?: false,
            preferredVoiceName = prefs[keyVoice] ?: "Charon",
            speechSpeed = prefs[keySpeed] ?: 1.0f,
            recentSearches = if (searchesRaw.isBlank()) emptyList() else searchesRaw.split("|").filter { it.isNotBlank() },
            favoriteDestinationIds = if (favsRaw.isBlank()) emptySet() else favsRaw.split("|").filter { it.isNotBlank() }.toSet()
        )
    }

    suspend fun setLanguage(language: AppLanguage) {
        context.dataStore.edit { it[keyLang] = language.code }
    }

    suspend fun completeOnboarding() {
        context.dataStore.edit { it[keyOnboarding] = true }
    }

    suspend fun setVoiceProfile(voiceName: String) {
        context.dataStore.edit { it[keyVoice] = voiceName }
    }

    suspend fun setSpeechSpeed(speed: Float) {
        context.dataStore.edit { it[keySpeed] = speed.coerceIn(0.75f, 1.5f) }
    }

    suspend fun recordRecentSearch(query: String) {
        val trimmed = query.trim()
        if (trimmed.length < 2) return
        context.dataStore.edit { prefs ->
            val existing = prefs[keyRecentSearches].orEmpty().split("|").filter { it.isNotBlank() }
            val updated = (listOf(trimmed) + existing.filterNot { it.equals(trimmed, ignoreCase = true) }).take(8)
            prefs[keyRecentSearches] = updated.joinToString("|")
        }
    }

    suspend fun toggleFavoriteDestination(destinationId: String) {
        context.dataStore.edit { prefs ->
            val current = prefs[keyFavDestinations].orEmpty().split("|").filter { it.isNotBlank() }.toMutableSet()
            if (current.contains(destinationId)) current.remove(destinationId) else current.add(destinationId)
            prefs[keyFavDestinations] = current.joinToString("|")
        }
    }

    suspend fun applyCloudSyncedPrefs(cloud: UserPrefsState) {
        context.dataStore.edit { prefs ->
            prefs[keyLang] = cloud.language.code
            prefs[keyOnboarding] = cloud.hasCompletedOnboarding
            prefs[keyVoice] = cloud.preferredVoiceName
            prefs[keySpeed] = cloud.speechSpeed.coerceIn(0.75f, 1.5f)
            prefs[keyRecentSearches] = cloud.recentSearches.take(8).joinToString("|")
            prefs[keyFavDestinations] = cloud.favoriteDestinationIds.take(100).joinToString("|")
        }
    }
}

