package com.example.data.local

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "katha_stories",
    indices = [
        Index(value = ["districtId"]),
        Index(value = ["category"]),
        Index(value = ["contentHash"], unique = true)
    ]
)
data class StoryEntity(
    @PrimaryKey val id: String, // Canonical unique story ID (translations live inside same record)
    val titleEn: String,
    val titleOdia: String,
    val titleHindi: String,
    val districtId: String,
    val destinationId: String,
    val destinationName: String,
    val category: String, // Sacred Architecture, Ancient Kingdoms, Archaeology, Tribal Heritage, Freedom Movement, Folk Legend, Crafts & Cuisine, Nature & Eco
    val historicalPeriod: String,
    val narrativeFormat: String, // "Short Story", "Detailed Narrative", "Extended Audio Guide"
    val originalLanguage: String, // "en", "or", "hi"
    val bodyEn: String,
    val bodyOdia: String, // Empty if not yet translated
    val bodyHindi: String, // Empty if not yet translated
    val factClassification: String, // "Documented Historical Record", "Archaeological & Epigraphic Evidence", "Traditional Oral Legend & Folklore"
    val sourceReferences: String,
    val editorialStatus: String, // "Curated & Verified", "AI Source-Grounded (Pending Review)", "Imported Batch Record"
    val isAiGenerated: Boolean = false,
    val estimatedDurationSec: Int = 180,
    val isFavorite: Boolean = false,
    val isOfflineSaved: Boolean = false,
    val cachedAudioPathEn: String? = null,
    val cachedAudioPathOdia: String? = null,
    val cachedAudioPathHindi: String? = null,
    val lastPlayedEpochMs: Long = 0L,
    val contentHash: String, // Normalized SHA-256 hash for duplicate/near-duplicate detection
    val updatedAtEpochMs: Long = System.currentTimeMillis()
)

@Entity(tableName = "saved_trips")
data class SavedTripEntity(
    @PrimaryKey val id: String,
    val title: String,
    val startingCity: String,
    val selectedDistrictsCsv: String,
    val durationDays: Int,
    val travelDatesLabel: String,
    val travellerCount: Int,
    val tierPreference: String, // "Budget", "Moderate", "Luxury"
    val interestsCsv: String,
    val totalEstimatedCostInr: Int,
    val costAssumptionsNote: String,
    val itineraryDaysJson: String, // Serialized JSON array of DayPlan objects
    val isOfflinePackIncluded: Boolean = true,
    val createdAtEpochMs: Long = System.currentTimeMillis(),
    val updatedAtEpochMs: Long = System.currentTimeMillis()
)

@Entity(tableName = "hazard_reports")
data class HazardReportEntity(
    @PrimaryKey val id: String,
    val districtId: String,
    val locationLabel: String,
    val category: String, // Weather Warning, Road Disruption, Coastal Tide Advisory, Wildlife Crossing
    val description: String,
    val severity: String, // Advisory, Caution, Urgent
    val verificationStatus: String, // "Official IMD / OSDMA Reference", "User Submitted — Pending Moderation"
    val latitude: Double?,
    val longitude: Double?,
    val reportedAtEpochMs: Long = System.currentTimeMillis()
)

@Entity(tableName = "trusted_contacts")
data class TrustedContactEntity(
    @PrimaryKey val id: String,
    val name: String,
    val relation: String,
    val phoneNumber: String
)

@Entity(tableName = "offline_districts")
data class OfflineDistrictEntity(
    @PrimaryKey val districtId: String,
    val districtName: String,
    val savedAtEpochMs: Long = System.currentTimeMillis(),
    val includesEmergencyDirectory: Boolean = true,
    val includesAttractions: Boolean = true
)

@Entity(tableName = "listing_issue_reports")
data class ListingIssueReportEntity(
    @PrimaryKey val id: String,
    val listingId: String,
    val listingTitle: String,
    val issueDescription: String,
    val submittedAtEpochMs: Long = System.currentTimeMillis(),
    val status: String = "Queued for Editorial Verification"
)
