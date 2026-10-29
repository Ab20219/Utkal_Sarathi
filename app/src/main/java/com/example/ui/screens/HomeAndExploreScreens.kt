package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CloudDownload
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Route
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.example.R
import com.example.data.catalog.OdishaDistrictCatalog
import com.example.data.local.StoryEntity
import com.example.data.model.AppLanguage
import com.example.data.model.DestinationPlace
import com.example.data.model.DistrictRecord
import com.example.data.model.OdishaRegion
import com.example.data.repository.KathaLibraryStats
import com.example.ui.AppScreen
import com.example.ui.theme.CharcoalBorder
import com.example.ui.theme.CharcoalElevated
import com.example.ui.theme.CharcoalSurface
import com.example.ui.theme.IvoryMuted
import com.example.ui.theme.IvoryText
import com.example.ui.theme.LegendAmber
import com.example.ui.theme.ObsidianBlack
import com.example.ui.theme.OdishaTeal
import com.example.ui.theme.SaffronOrange
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.ui.platform.LocalContext
import com.example.ui.components.buildUtkalAppInviteText
import com.example.ui.components.copyToClipboardWithToast
import com.example.ui.components.getCustomShareLink
import com.example.ui.components.shareOnWhatsApp
import com.example.ui.components.shareViaSystemSheet
import com.example.ui.theme.VerifiedEmerald
import com.example.ui.theme.WarmGold

private data class ModuleTile(
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
    val accent: androidx.compose.ui.graphics.Color,
    val target: AppScreen,
    val tag: String
)

@Composable
fun HomeDashboardScreen(
    language: AppLanguage,
    kathaStats: KathaLibraryStats,
    featuredStories: List<StoryEntity>,
    onNavigate: (AppScreen) -> Unit,
    onPlayStory: (StoryEntity) -> Unit,
    onSearchSubmitted: (String) -> Unit
) {
    val context = LocalContext.current
    var quickQuery by remember { mutableStateOf("") }
    val hiddenGems = remember { OdishaDistrictCatalog.allDestinations.filter { it.isHiddenGem }.take(8) }
    val quickDistricts = remember { OdishaDistrictCatalog.searchDistrictsAndPlaces("") }

    val modules = remember(kathaStats.totalDistinctStories) {
        listOf(
            ModuleTile("Utkal Mitra AI", "Search Grounding • High Thinking • Live Voice", Icons.Filled.AutoAwesome, SaffronOrange, AppScreen.UtkalMitraAi(), "module_mitra_ai"),
            ModuleTile("Utkal Katha", "${kathaStats.totalDistinctStories} Distinct Verified Stories • Deep TTS", Icons.AutoMirrored.Filled.VolumeUp, WarmGold, AppScreen.UtkalKathaLibrary(), "module_katha"),
            ModuleTile("Trip Planner", "Deterministic Day-by-Day Odisha Routes & Costs", Icons.Filled.Route, OdishaTeal, AppScreen.MyTrips, "module_planner"),
            ModuleTile("Geo-Map & Fares", "30 Districts, Hubs, Distances & Fair Transit", Icons.Filled.Map, SaffronOrange, AppScreen.GeoMapAndTransit, "module_geomap"),
            ModuleTile("UtkalSuraksha", "SOS 112, Hospitals, Police & Moderated Alerts", Icons.Filled.Shield, LegendAmber, AppScreen.Safety, "module_suraksha"),
            ModuleTile("Cuisine & GI Crafts", "Pattachitra, Tarakasi, Ikat, Rasabali & Eco-Camps", Icons.Filled.Palette, WarmGold, AppScreen.CuisineAndArtisans, "module_cuisine"),
            ModuleTile("Offline Travel Pack", "Zero-Signal Districts, Audio & Emergency Cache", Icons.Filled.CloudDownload, OdishaTeal, AppScreen.OfflineTravelPack, "module_offline"),
            ModuleTile("All 30 Districts", "Searchable Encyclopedia from Angul to Sundargarh", Icons.Filled.Explore, SaffronOrange, AppScreen.Explore, "module_30_districts")
        )
    }

    LazyColumn(
        contentPadding = PaddingValues(bottom = 28.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
        modifier = Modifier
            .fillMaxSize()
            .testTag("home_dashboard_list")
    ) {
        // Hero Banner
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp)
                    .height(220.dp)
                    .clip(RoundedCornerShape(24.dp))
            ) {
                Image(
                    painter = painterResource(id = R.drawable.img_hero_puri_konark_1793266424187),
                    contentDescription = "Konark Sun Temple Chariot Wheel at Sunset",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                listOf(
                                    ObsidianBlack.copy(alpha = 0.25f),
                                    ObsidianBlack.copy(alpha = 0.88f)
                                )
                            )
                        )
                )
                Column(
                    verticalArrangement = Arrangement.Bottom,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(18.dp)
                ) {
                    Surface(
                        color = SaffronOrange.copy(alpha = 0.22f),
                        border = BorderStroke(1.dp, SaffronOrange),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = when (language) {
                                AppLanguage.ODIA -> "୩୦ଟି ଜିଲ୍ଲା • AI ଐତିହ୍ୟ ଓ ସୁରକ୍ଷା"
                                AppLanguage.HINDI -> "३० जिले • स्मार्ट पर्यटन और सुरक्षा"
                                AppLanguage.ENGLISH -> "ALL 30 DISTRICTS • AI HERITAGE & SAFETY"
                            },
                            style = MaterialTheme.typography.labelSmall,
                            color = WarmGold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = when (language) {
                            AppLanguage.ODIA -> "ଓଡ଼ିଶାର ଆତ୍ମାକୁ ଅନୁଭବ କରନ୍ତୁ"
                            AppLanguage.HINDI -> "ओडिशा की गौरवशाली धरोहर खोजें"
                            AppLanguage.ENGLISH -> "Sacred Temples, Misty Ghats & Maritime Legacy"
                        },
                        style = MaterialTheme.typography.headlineMedium,
                        color = IvoryText
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Converse live with Utkal Mitra AI or listen to deep-voice Utkal Katha chronicles.",
                        style = MaterialTheme.typography.bodySmall,
                        color = IvoryMuted
                    )
                }
            }
        }

        // Global 30-District Instant Search Bar
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                OutlinedTextField(
                    value = quickQuery,
                    onValueChange = { quickQuery = it },
                    placeholder = {
                        Text(
                            text = stringResource(R.string.search_districts_hint),
                            style = MaterialTheme.typography.bodyMedium,
                            color = IvoryMuted
                        )
                    },
                    leadingIcon = {
                        Icon(Icons.Filled.Search, contentDescription = "Search", tint = WarmGold)
                    },
                    trailingIcon = {
                        Icon(
                            imageVector = Icons.Filled.Mic,
                            contentDescription = "Ask Utkal Mitra Voice",
                            tint = SaffronOrange,
                            modifier = Modifier
                                .size(24.dp)
                                .clickable {
                                    onNavigate(AppScreen.UtkalMitraAi(initialPrompt = quickQuery.takeIf { it.isNotBlank() }))
                                }
                        )
                    },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = SaffronOrange,
                        unfocusedBorderColor = CharcoalBorder,
                        focusedContainerColor = CharcoalSurface,
                        unfocusedContainerColor = CharcoalSurface,
                        focusedTextColor = IvoryText,
                        unfocusedTextColor = IvoryText
                    ),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("home_district_search_input")
                )

                if (quickQuery.trim().isNotEmpty()) {
                    val matches = OdishaDistrictCatalog.searchDistrictsAndPlaces(quickQuery).take(5)
                    Spacer(modifier = Modifier.height(8.dp))
                    Card(
                        colors = CardDefaults.cardColors(containerColor = CharcoalElevated),
                        border = BorderStroke(1.dp, CharcoalBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            if (matches.isEmpty()) {
                                Text(
                                    text = "No stored district matched '$quickQuery'. Tap to ask Utkal Mitra AI with Google Search Grounding →",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = SaffronOrange,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable {
                                            onSearchSubmitted(quickQuery)
                                            onNavigate(AppScreen.UtkalMitraAi(initialPrompt = quickQuery))
                                        }
                                        .padding(8.dp)
                                )
                            } else {
                                matches.forEach { d ->
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clickable {
                                                onSearchSubmitted(quickQuery)
                                                onNavigate(AppScreen.DistrictDetail(d.id))
                                            }
                                            .padding(vertical = 8.dp, horizontal = 6.dp)
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = "#${d.number} ${d.nameEn} (${d.nameOdia})",
                                                style = MaterialTheme.typography.titleSmall,
                                                color = IvoryText
                                            )
                                            Text(
                                                text = d.tagline,
                                                style = MaterialTheme.typography.bodySmall,
                                                color = IvoryMuted,
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                        }
                                        Text(
                                            text = "Open →",
                                            style = MaterialTheme.typography.labelMedium,
                                            color = WarmGold
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Core Modules 2-Column Responsive Grid
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                Text(
                    text = "Smart Tourism & Safety Modules",
                    style = MaterialTheme.typography.headlineSmall,
                    color = IvoryText
                )
                Spacer(modifier = Modifier.height(10.dp))
                modules.chunked(2).forEach { pair ->
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 12.dp)
                    ) {
                        pair.forEach { tile ->
                            Card(
                                onClick = { onNavigate(tile.target) },
                                colors = CardDefaults.cardColors(containerColor = CharcoalSurface),
                                border = BorderStroke(1.dp, CharcoalBorder),
                                shape = RoundedCornerShape(18.dp),
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag(tile.tag)
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Surface(
                                        color = tile.accent.copy(alpha = 0.16f),
                                        shape = RoundedCornerShape(12.dp),
                                        modifier = Modifier.size(40.dp)
                                    ) {
                                        Box(contentAlignment = Alignment.Center) {
                                            Icon(
                                                imageVector = tile.icon,
                                                contentDescription = tile.title,
                                                tint = tile.accent,
                                                modifier = Modifier.size(22.dp)
                                            )
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Text(
                                        text = tile.title,
                                        style = MaterialTheme.typography.titleMedium,
                                        color = IvoryText,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Spacer(modifier = Modifier.height(3.dp))
                                    Text(
                                        text = tile.subtitle,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = IvoryMuted,
                                        minLines = 2,
                                        maxLines = 2,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Quick Ribbon for All 30 Districts
        item {
            Column {
                Row(
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                ) {
                    Text(
                        text = "All 30 Districts of Odisha",
                        style = MaterialTheme.typography.headlineSmall,
                        color = IvoryText
                    )
                    Text(
                        text = "View Directory →",
                        style = MaterialTheme.typography.labelLarge,
                        color = SaffronOrange,
                        modifier = Modifier.clickable { onNavigate(AppScreen.Explore) }
                    )
                }
                Spacer(modifier = Modifier.height(10.dp))
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(quickDistricts, key = { it.id }) { district ->
                        Card(
                            onClick = { onNavigate(AppScreen.DistrictDetail(district.id)) },
                            colors = CardDefaults.cardColors(containerColor = CharcoalElevated),
                            border = BorderStroke(1.dp, CharcoalBorder),
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier.width(176.dp)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(
                                    text = "DISTRICT #${district.number}",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = OdishaTeal
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = district.nameEn,
                                    style = MaterialTheme.typography.titleMedium,
                                    color = IvoryText
                                )
                                Text(
                                    text = district.nameOdia,
                                    style = MaterialTheme.typography.labelMedium,
                                    color = WarmGold
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = district.tagline,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = IvoryMuted,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    }
                }
            }
        }

        // Hidden Gems & Eco-Retreats Carousel
        item {
            Column {
                Text(
                    text = "Hidden Gems & Uncrowded Sanctuaries",
                    style = MaterialTheme.typography.headlineSmall,
                    color = IvoryText,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
                Spacer(modifier = Modifier.height(10.dp))
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(hiddenGems, key = { it.id }) { gem ->
                        HiddenGemCard(
                            place = gem,
                            onClick = { onNavigate(AppScreen.DestinationStoryDetail(gem.id)) }
                        )
                    }
                }
            }
        }

        // Featured Utkal Katha Voice Stories
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                Row(
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Utkal Katha • Deep-Voice Audio",
                        style = MaterialTheme.typography.headlineSmall,
                        color = IvoryText
                    )
                    Text(
                        text = "Library (${kathaStats.totalDistinctStories}) →",
                        style = MaterialTheme.typography.labelLarge,
                        color = WarmGold,
                        modifier = Modifier.clickable { onNavigate(AppScreen.UtkalKathaLibrary()) }
                    )
                }
                Spacer(modifier = Modifier.height(10.dp))
                featuredStories.take(3).forEach { story ->
                    Card(
                        onClick = { onPlayStory(story) },
                        colors = CardDefaults.cardColors(containerColor = CharcoalSurface),
                        border = BorderStroke(1.dp, CharcoalBorder),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 10.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(14.dp)
                        ) {
                            Surface(
                                color = SaffronOrange.copy(alpha = 0.18f),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.size(48.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(
                                        imageVector = Icons.AutoMirrored.Filled.VolumeUp,
                                        contentDescription = "Narrate story",
                                        tint = SaffronOrange
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = when (language) {
                                        AppLanguage.ODIA -> story.titleOdia.ifBlank { story.titleEn }
                                        AppLanguage.HINDI -> story.titleHindi.ifBlank { story.titleEn }
                                        AppLanguage.ENGLISH -> story.titleEn
                                    },
                                    style = MaterialTheme.typography.titleSmall,
                                    color = IvoryText
                                )
                                Text(
                                    text = "${story.destinationName} • ${story.factClassification} • ~${story.estimatedDurationSec / 60} min",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = WarmGold
                                )
                            }
                        }
                    }
                }
            }
        }

        // Invite & Share UtkalSarathi on WhatsApp Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalElevated),
                border = BorderStroke(1.dp, VerifiedEmerald.copy(alpha = 0.6f)),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .testTag("home_whatsapp_invite_card")
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "SHARE WITH FELLOW TRAVELLERS",
                        style = MaterialTheme.typography.labelSmall,
                        color = VerifiedEmerald
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Invite Friends & Family on WhatsApp",
                        style = MaterialTheme.typography.titleLarge,
                        color = IvoryText
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Share UtkalSarathi across WhatsApp chats or groups so fellow travellers can explore all 30 Odisha districts, Utkal Mitra AI, and SOS 112 safety tools.",
                        style = MaterialTheme.typography.bodySmall,
                        color = IvoryMuted
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Button(
                            onClick = {
                                val invite = buildUtkalAppInviteText(language, getCustomShareLink(context))
                                shareOnWhatsApp(context, invite)
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = VerifiedEmerald,
                                contentColor = ObsidianBlack
                            ),
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier
                                .weight(1f)
                                .height(48.dp)
                                .testTag("home_share_whatsapp_button")
                        ) {
                            Icon(Icons.Filled.Share, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = stringResource(R.string.share_whatsapp_cta),
                                style = MaterialTheme.typography.labelLarge,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        OutlinedButton(
                            onClick = {
                                val invite = buildUtkalAppInviteText(language, getCustomShareLink(context))
                                copyToClipboardWithToast(context, invite, showToast = true)
                                shareViaSystemSheet(context, invite)
                            },
                            border = BorderStroke(1.dp, WarmGold),
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier
                                .height(48.dp)
                                .testTag("home_share_more_button")
                        ) {
                            Text(
                                text = stringResource(R.string.share_more_apps_cta),
                                style = MaterialTheme.typography.labelMedium,
                                color = WarmGold
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun HiddenGemCard(place: DestinationPlace, onClick: () -> Unit) {
    val artRes = when (place.category) {
        "Craft Village" -> R.drawable.img_crafts_cuisine_1793266426716
        "Temple", "Archaeology", "Monument" -> R.drawable.img_hero_puri_konark_1793266424187
        else -> R.drawable.img_nature_ecotourism_1793266426113
    }
    Card(
        onClick = onClick,
        colors = CardDefaults.cardColors(containerColor = CharcoalSurface),
        border = BorderStroke(1.dp, CharcoalBorder),
        shape = RoundedCornerShape(18.dp),
        modifier = Modifier.width(265.dp)
    ) {
        Column {
            Image(
                painter = painterResource(id = artRes),
                contentDescription = place.name,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp)
            )
            Column(modifier = Modifier.padding(12.dp)) {
                Text(
                    text = "HIDDEN GEM • ${place.category.uppercase()}",
                    style = MaterialTheme.typography.labelSmall,
                    color = OdishaTeal
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = place.name,
                    style = MaterialTheme.typography.titleMedium,
                    color = IvoryText,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = place.shortSummary,
                    style = MaterialTheme.typography.bodySmall,
                    color = IvoryMuted,
                    minLines = 2,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

@Composable
fun ExploreDistrictsScreen(
    language: AppLanguage,
    offlineDistrictIds: Set<String>,
    favoriteDestinationIds: Set<String>,
    onOpenDistrict: (String) -> Unit,
    onOpenDestination: (String) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedRegion by remember { mutableStateOf<OdishaRegion?>(null) }

    val filteredDistricts = remember(searchQuery, selectedRegion) {
        OdishaDistrictCatalog.searchDistrictsAndPlaces(searchQuery).filter { d ->
            selectedRegion == null || d.region == selectedRegion
        }
    }

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier
            .fillMaxSize()
            .testTag("explore_30_districts_screen")
    ) {
        item {
            Text(
                text = "30 Districts Cultural & Tourism Encyclopedia",
                style = MaterialTheme.typography.headlineMedium,
                color = IvoryText
            )
            Text(
                text = "Showing ${filteredDistricts.size} of ${OdishaDistrictCatalog.allDistricts.size} official districts of Odisha",
                style = MaterialTheme.typography.bodySmall,
                color = WarmGold
            )
            Spacer(modifier = Modifier.height(10.dp))
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Filter by district, HQ, temple, waterfall, GI craft…", color = IvoryMuted) },
                leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null, tint = SaffronOrange) },
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = SaffronOrange,
                    unfocusedBorderColor = CharcoalBorder,
                    focusedContainerColor = CharcoalSurface,
                    unfocusedContainerColor = CharcoalSurface,
                    focusedTextColor = IvoryText,
                    unfocusedTextColor = IvoryText
                ),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("explore_search_input")
            )
            Spacer(modifier = Modifier.height(8.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                item {
                    FilterChip(
                        selected = selectedRegion == null,
                        onClick = { selectedRegion = null },
                        label = { Text("All Regions (30)") },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = SaffronOrange.copy(alpha = 0.25f),
                            selectedLabelColor = WarmGold
                        )
                    )
                }
                items(OdishaRegion.entries) { region ->
                    FilterChip(
                        selected = selectedRegion == region,
                        onClick = { selectedRegion = if (selectedRegion == region) null else region },
                        label = { Text(region.displayName) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = SaffronOrange.copy(alpha = 0.25f),
                            selectedLabelColor = WarmGold
                        )
                    )
                }
            }
        }

        items(filteredDistricts, key = { it.id }) { district ->
            DistrictSummaryCard(
                district = district,
                language = language,
                isSavedOffline = offlineDistrictIds.contains(district.id),
                onOpenDistrict = { onOpenDistrict(district.id) },
                onOpenDestination = onOpenDestination
            )
        }
    }
}

@Composable
private fun DistrictSummaryCard(
    district: DistrictRecord,
    language: AppLanguage,
    isSavedOffline: Boolean,
    onOpenDistrict: () -> Unit,
    onOpenDestination: (String) -> Unit
) {
    Card(
        onClick = onOpenDistrict,
        colors = CardDefaults.cardColors(containerColor = CharcoalSurface),
        border = BorderStroke(1.dp, CharcoalBorder),
        shape = RoundedCornerShape(18.dp),
        modifier = Modifier
            .fillMaxWidth()
            .testTag("district_card_${district.id}")
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "#${district.number} • ${district.region.displayName}",
                    style = MaterialTheme.typography.labelSmall,
                    color = OdishaTeal
                )
                if (isSavedOffline) {
                    Text(
                        text = "Offline Ready",
                        style = MaterialTheme.typography.labelSmall,
                        color = WarmGold
                    )
                }
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = when (language) {
                    AppLanguage.ODIA -> "${district.nameOdia} (${district.nameEn})"
                    AppLanguage.HINDI -> "${district.nameHindi} (${district.nameEn})"
                    AppLanguage.ENGLISH -> "${district.nameEn} • ${district.nameOdia}"
                },
                style = MaterialTheme.typography.headlineSmall,
                color = IvoryText
            )
            Text(
                text = "HQ: ${district.headquarters} • ${district.tagline}",
                style = MaterialTheme.typography.bodySmall,
                color = WarmGold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = district.historySummary,
                style = MaterialTheme.typography.bodyMedium,
                color = IvoryMuted,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
            Spacer(modifier = Modifier.height(10.dp))
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                district.destinations.take(2).forEach { dest ->
                    Surface(
                        color = CharcoalElevated,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .weight(1f)
                            .clickable { onOpenDestination(dest.id) }
                    ) {
                        Text(
                            text = "★ ${dest.name}",
                            style = MaterialTheme.typography.labelSmall,
                            color = IvoryText,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        )
                    }
                }
            }
        }
    }
}
