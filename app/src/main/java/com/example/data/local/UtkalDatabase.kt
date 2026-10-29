package com.example.data.local

import android.content.Context
import androidx.room.Dao
import androidx.room.Database
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface StoryDao {
    @Query("SELECT * FROM katha_stories ORDER BY isFavorite DESC, updatedAtEpochMs DESC")
    fun observeAllStories(): Flow<List<StoryEntity>>

    @Query("SELECT * FROM katha_stories WHERE districtId = :districtId ORDER BY isFavorite DESC, updatedAtEpochMs DESC")
    fun observeStoriesByDistrict(districtId: String): Flow<List<StoryEntity>>

    @Query("SELECT * FROM katha_stories WHERE id = :storyId LIMIT 1")
    suspend fun getStoryById(storyId: String): StoryEntity?

    @Query("SELECT * FROM katha_stories WHERE contentHash = :hash LIMIT 1")
    suspend fun findByContentHash(hash: String): StoryEntity?

    @Query("SELECT COUNT(*) FROM katha_stories")
    fun observeTotalDistinctStories(): Flow<Int>

    @Query("SELECT COUNT(*) FROM katha_stories WHERE isAiGenerated = 0")
    fun observeReviewedCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM katha_stories WHERE isAiGenerated = 1")
    fun observeGeneratedCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM katha_stories WHERE bodyOdia != '' OR bodyHindi != ''")
    fun observeTranslatedCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM katha_stories WHERE cachedAudioPathEn IS NOT NULL OR cachedAudioPathOdia IS NOT NULL OR cachedAudioPathHindi IS NOT NULL")
    fun observeCachedAudioCount(): Flow<Int>

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertStoriesIgnoreDuplicates(stories: List<StoryEntity>): List<Long>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertStory(story: StoryEntity)

    @Query("UPDATE katha_stories SET isFavorite = :favorite WHERE id = :storyId")
    suspend fun setFavorite(storyId: String, favorite: Boolean)

    @Query("UPDATE katha_stories SET isOfflineSaved = :offlineSaved WHERE id = :storyId")
    suspend fun setOfflineSaved(storyId: String, offlineSaved: Boolean)

    @Query("UPDATE katha_stories SET lastPlayedEpochMs = :timestampMs WHERE id = :storyId")
    suspend fun markPlayed(storyId: String, timestampMs: Long)

    @Update
    suspend fun updateStory(story: StoryEntity)
}

@Dao
interface TripDao {
    @Query("SELECT * FROM saved_trips ORDER BY updatedAtEpochMs DESC")
    fun observeAllTrips(): Flow<List<SavedTripEntity>>

    @Query("SELECT * FROM saved_trips WHERE id = :tripId LIMIT 1")
    suspend fun getTripById(tripId: String): SavedTripEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertTrip(trip: SavedTripEntity)

    @Query("DELETE FROM saved_trips WHERE id = :tripId")
    suspend fun deleteTrip(tripId: String)
}

@Dao
interface SafetyDao {
    @Query("SELECT * FROM hazard_reports ORDER BY reportedAtEpochMs DESC")
    fun observeHazardReports(): Flow<List<HazardReportEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertHazardReport(report: HazardReportEntity)

    @Query("SELECT * FROM trusted_contacts ORDER BY name ASC")
    fun observeTrustedContacts(): Flow<List<TrustedContactEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertTrustedContact(contact: TrustedContactEntity)

    @Query("DELETE FROM trusted_contacts WHERE id = :contactId")
    suspend fun deleteTrustedContact(contactId: String)
}

@Dao
interface OfflinePackDao {
    @Query("SELECT * FROM offline_districts ORDER BY savedAtEpochMs DESC")
    fun observeOfflineDistricts(): Flow<List<OfflineDistrictEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveDistrictOffline(entity: OfflineDistrictEntity)

    @Query("DELETE FROM offline_districts WHERE districtId = :districtId")
    suspend fun removeDistrictOffline(districtId: String)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertListingIssue(issue: ListingIssueReportEntity)

    @Query("SELECT * FROM listing_issue_reports ORDER BY submittedAtEpochMs DESC")
    fun observeListingIssues(): Flow<List<ListingIssueReportEntity>>
}

@Database(
    entities = [
        StoryEntity::class,
        SavedTripEntity::class,
        HazardReportEntity::class,
        TrustedContactEntity::class,
        OfflineDistrictEntity::class,
        ListingIssueReportEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class UtkalDatabase : RoomDatabase() {
    abstract fun storyDao(): StoryDao
    abstract fun tripDao(): TripDao
    abstract fun safetyDao(): SafetyDao
    abstract fun offlinePackDao(): OfflinePackDao

    companion object {
        @Volatile
        private var INSTANCE: UtkalDatabase? = null

        fun getInstance(context: Context): UtkalDatabase {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    UtkalDatabase::class.java,
                    "utkal_sarathi_db"
                ).fallbackToDestructiveMigration(dropAllTables = true).build().also { INSTANCE = it }
            }
        }
    }
}
