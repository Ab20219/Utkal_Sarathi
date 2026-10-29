package com.example.data.catalog

import com.example.data.model.CulturalListing
import com.example.data.model.DestinationPlace
import com.example.data.model.DistrictRecord
import com.example.data.model.GeoHubNode
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.pow
import kotlin.math.sin
import kotlin.math.sqrt

object OdishaDistrictCatalog {

    val allDistricts: List<DistrictRecord> by lazy {
        (buildCoastalAndCentralDistricts() + buildWesternAndNorthernDistricts() + buildSouthernDistricts())
            .sortedBy { it.number }
    }

    val allDestinations: List<DestinationPlace> by lazy {
        allDistricts.flatMap { it.destinations }
    }

    fun getDistrictById(id: String): DistrictRecord? =
        allDistricts.firstOrNull { it.id.equals(id, ignoreCase = true) }

    fun getDestinationById(id: String): DestinationPlace? =
        allDestinations.firstOrNull { it.id.equals(id, ignoreCase = true) }

    fun searchDistrictsAndPlaces(query: String): List<DistrictRecord> {
        val q = query.trim().lowercase()
        if (q.isEmpty()) return allDistricts
        return allDistricts.filter { d ->
            d.nameEn.lowercase().contains(q) ||
                d.nameOdia.contains(q) ||
                d.nameHindi.contains(q) ||
                d.headquarters.lowercase().contains(q) ||
                d.tagline.lowercase().contains(q) ||
                d.historySummary.lowercase().contains(q) ||
                d.signatureFood.any { it.lowercase().contains(q) } ||
                d.craftsAndHandloom.any { it.lowercase().contains(q) } ||
                d.destinations.any { p ->
                    p.name.lowercase().contains(q) ||
                        p.category.lowercase().contains(q) ||
                        p.shortSummary.lowercase().contains(q)
                }
        }
    }

    val geoHubNodes: List<GeoHubNode> by lazy {
        val transportAndEmergency = listOf(
            GeoHubNode("bbi_airport", "Biju Patnaik International Airport (BBI)", "khordha", "Airport", 20.2544, 85.8178, "Primary international & domestic air gateway to Odisha", "IATA: BBI"),
            GeoHubNode("jrg_airport", "Veer Surendra Sai Airport, Jharsuguda", "jharsuguda", "Airport", 21.9136, 84.0504, "Western Odisha air gateway serving Sambalpur & Rourkela", "IATA: JRG"),
            GeoHubNode("pyb_airport", "Jeypore Airport, Koraput", "koraput", "Airport", 18.8803, 82.5522, "Southern Odisha regional UDAN airport", "IATA: PYB"),
            GeoHubNode("rrk_airport", "Rourkela Airport", "sundargarh", "Airport", 22.2567, 84.8147, "Northern industrial & hockey hub airport", "IATA: RRK"),
            GeoHubNode("bbs_rail", "Bhubaneswar Railway Junction", "khordha", "Rail Junction", 20.2666, 85.8436, "East Coast Railway headquarters junction", "Station: BBS"),
            GeoHubNode("puri_rail", "Puri Terminal Railway Station", "puri", "Rail Junction", 19.8077, 85.8396, "Direct Vande Bharat & express rail terminal for Shree Kshetra", "Station: PURI"),
            GeoHubNode("sbp_rail", "Sambalpur Junction", "sambalpur", "Rail Junction", 21.4860, 83.9610, "Western Odisha major rail junction", "Station: SBP"),
            GeoHubNode("bam_rail", "Brahmapur (Berhampur) Station", "ganjam", "Rail Junction", 19.3025, 84.8058, "Southern Odisha rail gateway for Gopalpur & Daringbadi", "Station: BAM"),
            GeoHubNode("aiims_bbsr", "AIIMS Bhubaneswar Trauma & Emergency", "khordha", "Hospital", 20.2314, 85.7753, "24x7 National Tertiary Medical & Trauma Centre", "108 / 112"),
            GeoHubNode("scb_cuttack", "SCB Medical College & Hospital, Cuttack", "cuttack", "Hospital", 20.4728, 85.8878, "Premier State Apex Government Hospital", "108 / 112"),
            GeoHubNode("vimsar_burla", "VIMSAR Medical College, Burla", "sambalpur", "Hospital", 21.5015, 83.8832, "Western Odisha Tertiary Emergency Hospital", "108 / 112"),
            GeoHubNode("mkcg_bam", "MKCG Medical College, Berhampur", "ganjam", "Hospital", 19.3112, 84.8110, "Southern Odisha Tertiary Emergency Hospital", "108 / 112"),
            GeoHubNode("puri_tourist_police", "Puri Sea Beach & Temple Tourist Police", "puri", "Police HQ", 19.7985, 85.8245, "Dedicated 24x7 Tourist Assistance & Emergency Unit", "Dial 112"),
            GeoHubNode("commissionerate_hq", "Bhubaneswar-Cuttack Commissionerate HQ", "khordha", "Police HQ", 20.2735, 85.8401, "Central Citizen & Traveller Safety Control Room", "Dial 112")
        )
        val attractionNodes = allDestinations.map { place ->
            GeoHubNode(
                id = "dest_${place.id}",
                name = place.name,
                districtId = place.districtId,
                type = "Destination",
                latitude = place.latitude,
                longitude = place.longitude,
                details = "${place.category} • ${place.shortSummary}",
                contactOrCode = place.nearestHub
            )
        }
        transportAndEmergency + attractionNodes
    }

    val culturalListings: List<CulturalListing> = listOf(
        CulturalListing(
            id = "gi_pattachitra",
            title = "Odisha Pattachitra & Tala Pattachitra",
            odiaTitle = "ଓଡ଼ିଶା ପଟ୍ଟଚିତ୍ର ଓ ତାଳପତ୍ର ଖୋଦେଇ",
            districtId = "puri",
            type = "GI Craft",
            giTagStatus = "Registered GI Tag of Odisha",
            description = "Cloth-canvas scroll paintings prepared with tamarind-seed gum, chalk stone coating, and natural mineral pigments (conch shell white, lampblack, hingula red, haritala yellow) by Chitrakar families.",
            authenticLocation = "Raghurajpur Heritage Crafts Village, Chandanpur, Puri",
            priceGuide = "₹800 – ₹25,000+ (depends on natural mineral detail & scroll size; buy directly from Chitrakar households or Boyanika/Utkalika)",
            officialEnquiryUrl = "https://utkalikaodisha.com",
            verificationLabel = "GI Registry Verified Heritage Cluster"
        ),
        CulturalListing(
            id = "gi_tarakasi",
            title = "Cuttack Rupa Tarakasi (Silver Filigree)",
            odiaTitle = "କଟକ ରୂପା ତାରକସି",
            districtId = "cuttack",
            type = "GI Craft",
            giTagStatus = "Registered GI Tag of Odisha (2024)",
            description = "500-year-old delicate silver wire artistry drawing 90%+ pure silver through fine gauges and soldering hair-thin motifs of Konark wheels, peacocks, and jewellery.",
            authenticLocation = "Nayasarak, Balu Bazar & Mansinghpatna, Cuttack",
            priceGuide = "₹1,500 – ₹45,000+ (priced by silver gram weight + craft workmanship)",
            officialEnquiryUrl = "https://cuttack.odisha.gov.in",
            verificationLabel = "GI Registry Verified Craft"
        ),
        CulturalListing(
            id = "gi_sambalpuri_bandha",
            title = "Sambalpuri Bandha Ikat Handloom",
            odiaTitle = "ସମ୍ବଲପୁରୀ ବାନ୍ଧ ଶାଢ଼ୀ",
            districtId = "sambalpur",
            type = "Handloom",
            giTagStatus = "Registered GI Tag of Odisha",
            description = "Intricate warp-and-weft resist tie-dye weaving (Shankha, Chakra, Phula motifs) crafted by Bhulia weavers across Sambalpur, Bargarh (Barpali), and Subarnapur.",
            authenticLocation = "Bargarh, Barpali & Boyanika State Handloom Showrooms",
            priceGuide = "₹2,200 (cotton) – ₹35,000+ (pure mulberry/tussar silk)",
            officialEnquiryUrl = "https://boyanika.com",
            verificationLabel = "State Cooperative (Boyanika / Sambalpuri Bastralaya)"
        ),
        CulturalListing(
            id = "gi_kotpad_fabric",
            title = "Kotpad Natural Aal-Dyed Handloom",
            odiaTitle = "କୋଟପାଡ଼ ପ୍ରାକୃତିକ ରଙ୍ଗ ହସ୍ତତନ୍ତ",
            districtId = "koraput",
            type = "Handloom",
            giTagStatus = "First GI Tag of Odisha (2005)",
            description = "Unbleached pit-loom cotton dyed in earthybrick-red and coffee-brown using Indian madder (Aal) root bark by Mirgan tribal weavers.",
            authenticLocation = "Kotpad Weavers Cooperative Society, Koraput",
            priceGuide = "₹1,800 – ₹12,000",
            officialEnquiryUrl = "https://boyanika.com",
            verificationLabel = "GI Registry Verified Tribal Weave"
        ),
        CulturalListing(
            id = "gi_kapadaganda",
            title = "Dongria Kondh Kapadaganda Shawl",
            odiaTitle = "ଡଙ୍ଗରିଆ କନ୍ଧ କପଡ଼ାଗଣ୍ଡା ଶାଲ୍",
            districtId = "rayagada",
            type = "Handloom",
            giTagStatus = "Registered GI Tag of Odisha (2024)",
            description = "Off-white coarse cotton shawl hand-embroidered by Dongria Kondh women in Niyamgiri using green (mountains/crops), yellow (peace/turmeric), and red (ancestral vitality) geometric triangles.",
            authenticLocation = "Chatikona Weekly Haat & DKDA Bissamcuttack, Rayagada",
            priceGuide = "₹2,500 – ₹6,500",
            officialEnquiryUrl = "https://rayagada.odisha.gov.in",
            verificationLabel = "GI Registry Verified Indigenous Craft"
        ),
        CulturalListing(
            id = "gi_odisha_rasagola_rasabali",
            title = "Odisha Rasagola & Kendrapara Rasabali",
            odiaTitle = "ଓଡ଼ିଶା ରସଗୋଲା ଓ କେନ୍ଦ୍ରାପଡ଼ା ରସାବଳି",
            districtId = "khordha",
            type = "Sweet",
            giTagStatus = "Registered GI Tags of Odisha",
            description = "Soft caramel-tinted Pahala chhena dumplings linked to Niladri Bije ritual of Shree Jagannath, alongside Kendrapara's cardamom-spiced flattened chhena patties soaked in thickened milk.",
            authenticLocation = "Pahala (NH-16 Bhubaneswar-Cuttack) & Ichhapur (Kendrapara)",
            priceGuide = "₹15 – ₹35 per piece / ₹280 – ₹450 per kg",
            officialEnquiryUrl = "https://odishatourism.gov.in",
            verificationLabel = "GI Registry Culinary Heritage"
        ),
        CulturalListing(
            id = "cuisine_pakhala_chhenapoda",
            title = "Odia Pakhala Thali, Dalma & Nayagarh Chhena Poda",
            odiaTitle = "ଓଡ଼ିଆ ପଖାଳ କଂସା, ଡାଲମା ଓ ଛେନାପୋଡ଼",
            districtId = "nayagarh",
            type = "Cuisine",
            giTagStatus = "Traditional Culinary Heritage",
            description = "Lightly fermented water-rice tempered with curd, curry leaves & roasted cumin served with temple-style root-vegetable Dalma, badi chura, and sal-leaf baked caramelized cottage cheese cake.",
            authenticLocation = "OTDC Nimantran Restaurants (Bhubaneswar, Puri, Sambalpur) & Nayagarh Town",
            priceGuide = "₹220 – ₹550 per traditional thali; ₹380/kg Chhena Poda",
            officialEnquiryUrl = "https://otdc.odisha.gov.in",
            verificationLabel = "OTDC Official Culinary Benchmark"
        ),
        CulturalListing(
            id = "gi_kai_haladi_kalajeera",
            title = "Kandhamal Haladi, Koraput Kalajeera Rice & Mayurbhanj Kai",
            odiaTitle = "କନ୍ଧମାଳ ହଳଦୀ, କୋରାପୁଟ କଳାଜିରା ଚାଉଳ ଓ ମୟୂରଭଞ୍ଜ କାଇ ଚଟଣୀ",
            districtId = "kandhamal",
            type = "Cuisine",
            giTagStatus = "Registered GI Agro-Food Products",
            description = "High-curcumin organic golden turmeric of Kandhamal, aromatic tiny black heirloom rice conserved by Koraput tribal farmers, and protein-rich traditional weaver-ant chutney of Mayurbhanj.",
            authenticLocation = "KASAM Outlets (Phulbani), ORMAS Stalls & Koraput Agro Cooperatives",
            priceGuide = "₹180 – ₹350 per pack",
            officialEnquiryUrl = "https://ormas.odisha.gov.in",
            verificationLabel = "GI & ORMAS Verified Cooperative"
        ),
        CulturalListing(
            id = "ecocamp_odisha_forest",
            title = "Eco-Tour Odisha Official Nature Camps (Satkosia, Debrigarh, Daringbadi, Similipal)",
            odiaTitle = "ଇକୋ-ଟୁର୍ ଓଡ଼ିଶା ପ୍ରକୃତି ନିବାସ",
            districtId = "angul",
            type = "Eco-Camp",
            giTagStatus = "Odisha Forest & Environment Dept Official",
            description = "Community-operated Swiss tents and forest cottages where 85%+ revenue supports local forest-fringe communities and conservation.",
            authenticLocation = "50+ official camps across Satkosia, Bhitarkanika, Debrigarh, Mangalajodi, Daringbadi & Deomali",
            priceGuide = "₹3,000 – ₹6,500 per double cottage/tent (inclusive of meals at most camps)",
            officialEnquiryUrl = "https://www.ecotourodisha.com",
            verificationLabel = "Official Dept. of Forest, Env. & Climate Change Portal"
        ),
        CulturalListing(
            id = "otdc_panthanivas",
            title = "OTDC Panthanivas Heritage & Tourist Lodges",
            odiaTitle = "ଓଟିଡିସି ପାନ୍ଥନିବାସ",
            districtId = "puri",
            type = "Heritage Stay",
            giTagStatus = "Odisha Tourism Development Corp (Govt. of Odisha)",
            description = "Government-operated tourist lodges at prime locations including Puri Beach, Konark, Rambha/Barkul (Chilika), Cuttack, Sambalpur, Chandipur, and Gopalpur.",
            authenticLocation = "Statewide across key tourism circuits",
            priceGuide = "₹1,800 – ₹5,200 per night (standard govt tariff)",
            officialEnquiryUrl = "https://panthanivas.com",
            verificationLabel = "Official OTDC Portal"
        )
    )

    /**
     * Deterministic Haversine great-circle distance in kilometres, multiplied by an Eastern Ghats /
     * NH road winding factor (1.28x coastal/highway, 1.42x highland ghats) for realistic road estimates.
     */
    fun estimateRoadDistanceKm(
        lat1: Double,
        lon1: Double,
        lat2: Double,
        lon2: Double,
        isGhatTerrain: Boolean = false
    ): Int {
        val r = 6371.0
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = sin(dLat / 2).pow(2) +
            cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) * sin(dLon / 2).pow(2)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        val straightKm = r * c
        val factor = if (isGhatTerrain) 1.42 else 1.28
        return (straightKm * factor).toInt().coerceAtLeast(4)
    }
}
