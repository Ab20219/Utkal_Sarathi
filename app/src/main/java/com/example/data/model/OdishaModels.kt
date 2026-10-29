package com.example.data.model

enum class AppLanguage(val code: String, val label: String, val nativeLabel: String, val localeTag: String) {
    ENGLISH("en", "English", "English", "en-IN"),
    ODIA("or", "Odia", "ଓଡ଼ିଆ", "or-IN"),
    HINDI("hi", "Hindi", "हिन्दी", "hi-IN");

    companion object {
        fun fromCode(code: String): AppLanguage = entries.find { it.code == code } ?: ENGLISH
    }
}

enum class OdishaRegion(val displayName: String, val odiaName: String) {
    COASTAL("Coastal Utkal", "ଉପକୂଳ ଓଡ଼ିଶା"),
    WESTERN("Western Kosal", "ପଶ୍ଚିମ ଓଡ଼ିଶା"),
    SOUTHERN("Southern Kalinga & Koraput", "ଦକ୍ଷିଣ ଓଡ଼ିଶା"),
    NORTHERN_CENTRAL("Northern & Central", "ଉତ୍ତର ଓ କେନ୍ଦ୍ରୀୟ ଓଡ଼ିଶା")
}

data class DestinationPlace(
    val id: String,
    val districtId: String,
    val name: String,
    val odiaName: String,
    val category: String, // Temple, Beach, Waterfall, Cave, Wildlife, Monument, Craft Village, Eco-Tourism
    val isHiddenGem: Boolean,
    val latitude: Double,
    val longitude: Double,
    val shortSummary: String,
    val historicalSignificance: String,
    val bestSeason: String,
    val nearestHub: String,
    val sourceCitation: String
)

data class DistrictRecord(
    val id: String,
    val number: Int,
    val nameEn: String,
    val nameOdia: String,
    val nameHindi: String,
    val headquarters: String,
    val region: OdishaRegion,
    val latitude: Double,
    val longitude: Double,
    val tagline: String,
    val historySummary: String,
    val cultureAndFestivals: String,
    val signatureFood: List<String>,
    val craftsAndHandloom: List<String>,
    val transportHubs: String,
    val emergencyHospital: String,
    val policeControlInfo: String,
    val destinations: List<DestinationPlace>,
    val localExperiences: List<String>,
    val sourceReference: String
)

data class GeoHubNode(
    val id: String,
    val name: String,
    val districtId: String,
    val type: String, // Destination, Airport, Rail Junction, Hospital, Police HQ
    val latitude: Double,
    val longitude: Double,
    val details: String,
    val contactOrCode: String
)

data class CulturalListing(
    val id: String,
    val title: String,
    val odiaTitle: String,
    val districtId: String,
    val type: String, // GI Craft, Handloom, Cuisine, Sweet, Eco-Camp, Heritage Stay
    val giTagStatus: String, // "Registered GI Tag of Odisha", "Traditional Heritage", "OTDC / Eco-Tour Odisha Official"
    val description: String,
    val authenticLocation: String,
    val priceGuide: String,
    val officialEnquiryUrl: String,
    val verificationLabel: String
)

data class ChatMessage(
    val id: String,
    val isUser: Boolean,
    val text: String,
    val timestampMs: Long = System.currentTimeMillis(),
    val districtContext: String? = null,
    val modeLabel: String = "Grounded Knowledge", // Search Grounded, High Thinking, Stored Curated
    val reliabilityBadge: String = "Established Historical & Curated Record",
    val sourceCitations: List<Pair<String, String>> = emptyList(), // title -> url
    val suggestedFollowUps: List<String> = emptyList()
)
