package com.example.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.CloudDownload
import androidx.compose.material.icons.filled.Directions
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.R
import com.example.data.catalog.OdishaDistrictCatalog
import com.example.data.local.StoryEntity
import com.example.data.model.AppLanguage
import com.example.ui.AppScreen
import com.example.ui.components.VerificationBadgeChip
import com.example.ui.components.buildShareFooterLine
import com.example.ui.components.launchGeoMapsUri
import com.example.ui.components.shareOnWhatsApp
import com.example.ui.theme.CharcoalBorder
import com.example.ui.theme.CharcoalElevated
import com.example.ui.theme.CharcoalSurface
import com.example.ui.theme.IvoryMuted
import com.example.ui.theme.IvoryText
import com.example.ui.theme.ObsidianBlack
import com.example.ui.theme.OdishaTeal
import com.example.ui.theme.SaffronOrange
import com.example.ui.theme.VerifiedEmerald
import com.example.ui.theme.WarmGold

@Composable
fun DistrictDetailScreen(
    districtId: String,
    language: AppLanguage,
    stories: List<StoryEntity>,
    isOfflineSaved: Boolean,
    onBack: () -> Unit,
    onNavigate: (AppScreen) -> Unit,
    onToggleOffline: (Boolean) -> Unit,
    onPlayStory: (StoryEntity, AppLanguage) -> Unit,
    onGenerateMoreStories: () -> Unit
) {
    BackHandler { onBack() }
    val context = LocalContext.current
    val district = remember(districtId) {
        OdishaDistrictCatalog.getDistrictById(districtId) ?: OdishaDistrictCatalog.allDistricts.first()
    }
    val districtStories = remember(stories, district.id) {
        stories.filter { it.districtId == district.id }
    }

    val bannerImg = when (district.region.name) {
        "COASTAL" -> R.drawable.img_hero_puri_konark_1793266424187
        "WESTERN" -> R.drawable.img_crafts_cuisine_1793266426716
        else -> R.drawable.img_nature_ecotourism_1793266426113
    }

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        modifier = Modifier
            .fillMaxSize()
            .testTag("district_detail_screen")
    ) {
        item {
            Image(
                painter = painterResource(id = bannerImg),
                contentDescription = district.nameEn,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(190.dp)
                    .clip(RoundedCornerShape(20.dp))
            )
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "DISTRICT #${district.number} • ${district.region.displayName}",
                        style = MaterialTheme.typography.labelMedium,
                        color = OdishaTeal
                    )
                    Text(
                        text = "${district.nameEn} (${district.nameOdia} • ${district.nameHindi})",
                        style = MaterialTheme.typography.headlineMedium,
                        color = IvoryText
                    )
                    Text(
                        text = "Headquarters: ${district.headquarters}",
                        style = MaterialTheme.typography.titleSmall,
                        color = WarmGold
                    )
                }
            }
            Spacer(modifier = Modifier.height(10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = { onNavigate(AppScreen.UtkalMitraAi(contextDistrictId = district.id)) },
                    colors = ButtonDefaults.buttonColors(containerColor = SaffronOrange, contentColor = ObsidianBlack),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Filled.AutoAwesome, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Ask Mitra AI", fontWeight = FontWeight.Bold)
                }
                OutlinedButton(
                    onClick = { onToggleOffline(isOfflineSaved) },
                    border = BorderStroke(1.dp, WarmGold),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Filled.CloudDownload, contentDescription = null, tint = WarmGold, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(if (isOfflineSaved) "Offline Saved" else "Save Offline", color = WarmGold)
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedButton(
                onClick = {
                    val topPlaces = district.destinations.take(3).joinToString(", ") { it.name }
                    val msg = """
                        🏛️ *${district.nameEn} District (${district.nameOdia}) — Odisha #${district.number}*
                        📍 HQ: ${district.headquarters} (${district.region.displayName})
                        ✨ Highlights: $topPlaces
                        🍛 Cuisine: ${district.signatureFood.take(3).joinToString(", ")}
                        🎨 Crafts: ${district.craftsAndHandloom.take(2).joinToString(", ")}
                        ${buildShareFooterLine(context)}
                    """.trimIndent()
                    shareOnWhatsApp(context, msg)
                },
                border = BorderStroke(1.dp, VerifiedEmerald),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .testTag("district_share_whatsapp_button")
            ) {
                Icon(Icons.Filled.Share, contentDescription = null, tint = VerifiedEmerald, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Share ${district.nameEn} Guide on WhatsApp", color = VerifiedEmerald, fontWeight = FontWeight.SemiBold)
            }
        }

        // Verified History & Culture Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalSurface),
                border = BorderStroke(1.dp, CharcoalBorder),
                shape = RoundedCornerShape(18.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    VerificationBadgeChip("Documented District Record")
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Historical Overview", style = MaterialTheme.typography.titleMedium, color = WarmGold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(district.historySummary, style = MaterialTheme.typography.bodyMedium, color = IvoryText)
                    Spacer(modifier = Modifier.height(10.dp))
                    Text("Festivals & Living Culture", style = MaterialTheme.typography.titleMedium, color = WarmGold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(district.cultureAndFestivals, style = MaterialTheme.typography.bodyMedium, color = IvoryMuted)
                    Spacer(modifier = Modifier.height(10.dp))
                    Text("Signature Cuisine: ${district.signatureFood.joinToString(" • ")}", style = MaterialTheme.typography.bodySmall, color = IvoryText)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Crafts & Handloom: ${district.craftsAndHandloom.joinToString(" • ")}", style = MaterialTheme.typography.bodySmall, color = OdishaTeal)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("Source: ${district.sourceReference}", style = MaterialTheme.typography.labelSmall, color = IvoryMuted)
                }
            }
        }

        // Destinations in District
        item {
            Text(
                text = "Key Destinations & Hidden Gems in ${district.nameEn}",
                style = MaterialTheme.typography.headlineSmall,
                color = IvoryText
            )
        }
        items(district.destinations, key = { it.id }) { place ->
            Card(
                onClick = { onNavigate(AppScreen.DestinationStoryDetail(place.id)) },
                colors = CardDefaults.cardColors(containerColor = CharcoalElevated),
                border = BorderStroke(1.dp, CharcoalBorder),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "${place.category.uppercase()}${if (place.isHiddenGem) " • HIDDEN GEM" else ""}",
                            style = MaterialTheme.typography.labelSmall,
                            color = if (place.isHiddenGem) OdishaTeal else SaffronOrange
                        )
                        Text(
                            text = "Best: ${place.bestSeason}",
                            style = MaterialTheme.typography.labelSmall,
                            color = WarmGold
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("${place.name} (${place.odiaName})", style = MaterialTheme.typography.titleMedium, color = IvoryText)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(place.shortSummary, style = MaterialTheme.typography.bodyMedium, color = IvoryMuted)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedButton(
                            onClick = { onNavigate(AppScreen.DestinationStoryDetail(place.id)) },
                            border = BorderStroke(1.dp, SaffronOrange)
                        ) {
                            Text("Open Historical Audio Experience", color = SaffronOrange, style = MaterialTheme.typography.labelMedium)
                        }
                        IconButton(onClick = { launchGeoMapsUri(context, place.latitude, place.longitude, place.name) }) {
                            Icon(Icons.Filled.Directions, contentDescription = "Open in Maps", tint = OdishaTeal)
                        }
                    }
                }
            }
        }

        // Transit, Hospital & Emergency Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalSurface),
                border = BorderStroke(1.dp, CharcoalBorder),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text("Transit Hubs & Emergency Directory", style = MaterialTheme.typography.titleMedium, color = WarmGold)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("• Transit: ${district.transportHubs}", style = MaterialTheme.typography.bodySmall, color = IvoryText)
                    Text("• Medical: ${district.emergencyHospital}", style = MaterialTheme.typography.bodySmall, color = IvoryText)
                    Text("• Police: ${district.policeControlInfo}", style = MaterialTheme.typography.bodySmall, color = IvoryText)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("• Local Experiences: ${district.localExperiences.joinToString(" | ")}", style = MaterialTheme.typography.bodySmall, color = OdishaTeal)
                }
            }
        }

        // District Katha Stories
        item {
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Utkal Katha Stories (${districtStories.size})", style = MaterialTheme.typography.headlineSmall, color = IvoryText)
                OutlinedButton(onClick = onGenerateMoreStories, border = BorderStroke(1.dp, WarmGold)) {
                    Text("+ AI Expand", color = WarmGold, style = MaterialTheme.typography.labelMedium)
                }
            }
        }
        items(districtStories, key = { it.id }) { story ->
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalSurface),
                border = BorderStroke(1.dp, CharcoalBorder),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    VerificationBadgeChip("${story.factClassification} • ${story.editorialStatus}")
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(story.titleEn, style = MaterialTheme.typography.titleMedium, color = IvoryText)
                    if (story.titleOdia.isNotBlank()) {
                        Text(story.titleOdia, style = MaterialTheme.typography.labelMedium, color = WarmGold)
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(story.bodyEn, style = MaterialTheme.typography.bodySmall, color = IvoryMuted, maxLines = 4)
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(
                        onClick = { onPlayStory(story, language) },
                        colors = ButtonDefaults.buttonColors(containerColor = SaffronOrange, contentColor = ObsidianBlack)
                    ) {
                        Icon(Icons.AutoMirrored.Filled.VolumeUp, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Narrate in ${language.label}", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

/**
 * Full 10-step Historical Story Experience required by Master Prompt Section 8.
 */
@Composable
fun DestinationStoryExperienceScreen(
    destinationId: String,
    defaultLanguage: AppLanguage,
    allStories: List<StoryEntity>,
    isFavoriteDestination: Boolean,
    onBack: () -> Unit,
    onToggleFavoriteDestination: () -> Unit,
    onPlayStory: (StoryEntity, AppLanguage) -> Unit,
    onToggleStoryOffline: (StoryEntity) -> Unit,
    onToggleStoryFavorite: (StoryEntity) -> Unit,
    onAskFollowUpMitra: (districtId: String, prompt: String) -> Unit,
    onOpenRelatedDestination: (String) -> Unit
) {
    BackHandler { onBack() }
    val context = LocalContext.current
    val destination = remember(destinationId) {
        OdishaDistrictCatalog.getDestinationById(destinationId) ?: OdishaDistrictCatalog.allDestinations.first()
    }
    val parentDistrict = remember(destination.districtId) {
        OdishaDistrictCatalog.getDistrictById(destination.districtId)!!
    }
    var storyLang by remember(defaultLanguage) { mutableStateOf(defaultLanguage) }

    val matchingStories = remember(allStories, destination.id, parentDistrict.id) {
        val exact = allStories.filter { it.destinationId == destination.id }
        exact.ifEmpty { allStories.filter { it.districtId == parentDistrict.id } }
    }
    val relatedPlaces = remember(destination.id) {
        OdishaDistrictCatalog.allDestinations
            .filter { it.id != destination.id && (it.districtId == destination.districtId || it.category == destination.category) }
            .take(4)
    }

    val heroImg = when (destination.category) {
        "Craft Village" -> R.drawable.img_crafts_cuisine_1793266426716
        "Temple", "Archaeology", "Monument" -> R.drawable.img_hero_puri_konark_1793266424187
        else -> R.drawable.img_nature_ecotourism_1793266426113
    }

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        modifier = Modifier
            .fillMaxSize()
            .testTag("destination_story_experience_screen")
    ) {
        // 1. Name, district, image, verified metadata
        item {
            Image(
                painter = painterResource(id = heroImg),
                contentDescription = destination.name,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(210.dp)
                    .clip(RoundedCornerShape(22.dp))
            )
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "${parentDistrict.nameEn.uppercase()} DISTRICT • ${destination.category.uppercase()}",
                        style = MaterialTheme.typography.labelMedium,
                        color = OdishaTeal
                    )
                    Text(
                        text = destination.name,
                        style = MaterialTheme.typography.headlineMedium,
                        color = IvoryText
                    )
                    Text(
                        text = destination.odiaName,
                        style = MaterialTheme.typography.titleMedium,
                        color = WarmGold
                    )
                }
                Row {
                    IconButton(
                        onClick = {
                            val msg = """
                                ✨ *${destination.name} (${destination.odiaName})* — ${parentDistrict.nameEn} District, Odisha
                                ${destination.shortSummary}
                                🗓️ Best Season: ${destination.bestSeason} | Nearest Hub: ${destination.nearestHub}
                                📍 Maps: https://maps.google.com/?q=${destination.latitude},${destination.longitude}
                                ${buildShareFooterLine(context)}
                            """.trimIndent()
                            shareOnWhatsApp(context, msg)
                        },
                        modifier = Modifier
                            .size(48.dp)
                            .testTag("destination_share_whatsapp_button")
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Share,
                            contentDescription = "Share destination on WhatsApp",
                            tint = VerifiedEmerald
                        )
                    }
                    IconButton(onClick = onToggleFavoriteDestination, modifier = Modifier.size(48.dp)) {
                        Icon(
                            imageVector = if (isFavoriteDestination) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                            contentDescription = "Save favourite destination",
                            tint = if (isFavoriteDestination) SaffronOrange else IvoryMuted
                        )
                    }
                }
            }
        }

        // 2. Historical & Cultural Significance + Source Citation
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalSurface),
                border = BorderStroke(1.dp, CharcoalBorder),
                shape = RoundedCornerShape(18.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    VerificationBadgeChip("Verified Historical & Tourism Source")
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(destination.shortSummary, style = MaterialTheme.typography.bodyLarge, color = IvoryText)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Historical & Cultural Significance",
                        style = MaterialTheme.typography.titleSmall,
                        color = WarmGold
                    )
                    Text(destination.historicalSignificance, style = MaterialTheme.typography.bodyMedium, color = IvoryMuted)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Nearest Hub: ${destination.nearestHub} • Best Season: ${destination.bestSeason}", style = MaterialTheme.typography.labelMedium, color = OdishaTeal)
                    Text("Source Reference: ${destination.sourceCitation}", style = MaterialTheme.typography.labelSmall, color = IvoryMuted)
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(
                            onClick = { launchGeoMapsUri(context, destination.latitude, destination.longitude, destination.name) },
                            border = BorderStroke(1.dp, OdishaTeal)
                        ) {
                            Icon(Icons.Filled.Directions, contentDescription = null, tint = OdishaTeal, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Open Route in Maps", color = OdishaTeal)
                        }
                        Button(
                            onClick = {
                                onAskFollowUpMitra(
                                    parentDistrict.id,
                                    "Tell me deeper architectural, historical, and visitor details about ${destination.name} in ${parentDistrict.nameEn} district."
                                )
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = SaffronOrange, contentColor = ObsidianBlack)
                        ) {
                            Text("Ask Utkal Mitra AI", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // 3 & 4. Language Selector for Narration + Audio Guides & Full Transcript
        item {
            Text("Audio Guides & Story Transcript", style = MaterialTheme.typography.headlineSmall, color = IvoryText)
            Spacer(modifier = Modifier.height(6.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                AppLanguage.entries.forEach { lang ->
                    FilterChip(
                        selected = storyLang == lang,
                        onClick = { storyLang = lang },
                        label = { Text("${lang.label} (${lang.nativeLabel})") },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = SaffronOrange.copy(alpha = 0.25f),
                            selectedLabelColor = WarmGold
                        )
                    )
                }
            }
        }

        items(matchingStories, key = { it.id }) { story ->
            val displayTitle = when (storyLang) {
                AppLanguage.ODIA -> story.titleOdia.ifBlank { story.titleEn }
                AppLanguage.HINDI -> story.titleHindi.ifBlank { story.titleEn }
                AppLanguage.ENGLISH -> story.titleEn
            }
            val displayBody = when (storyLang) {
                AppLanguage.ODIA -> story.bodyOdia.ifBlank { story.bodyEn }
                AppLanguage.HINDI -> story.bodyHindi.ifBlank { story.bodyEn }
                AppLanguage.ENGLISH -> story.bodyEn
            }

            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalElevated),
                border = BorderStroke(1.dp, WarmGold.copy(alpha = 0.35f)),
                shape = RoundedCornerShape(18.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        VerificationBadgeChip(story.factClassification)
                        Row {
                            IconButton(onClick = { onToggleStoryFavorite(story) }) {
                                Icon(
                                    imageVector = if (story.isFavorite) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                                    contentDescription = "Favourite story",
                                    tint = if (story.isFavorite) SaffronOrange else IvoryMuted
                                )
                            }
                            IconButton(onClick = { onToggleStoryOffline(story) }) {
                                Icon(
                                    imageVector = if (story.isOfflineSaved) Icons.Filled.Bookmark else Icons.Filled.BookmarkBorder,
                                    contentDescription = "Save story offline",
                                    tint = if (story.isOfflineSaved) WarmGold else IvoryMuted
                                )
                            }
                        }
                    }
                    Text(displayTitle, style = MaterialTheme.typography.titleLarge, color = IvoryText)
                    Text(
                        text = "${story.historicalPeriod} • ${story.editorialStatus} • ~${story.estimatedDurationSec / 60} min listen",
                        style = MaterialTheme.typography.labelSmall,
                        color = WarmGold
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Surface(
                        color = ObsidianBlack.copy(alpha = 0.6f),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = displayBody,
                            style = MaterialTheme.typography.bodyMedium,
                            color = IvoryText,
                            modifier = Modifier.padding(12.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Sources: ${story.sourceReferences}", style = MaterialTheme.typography.labelSmall, color = IvoryMuted)
                    Spacer(modifier = Modifier.height(10.dp))
                    Button(
                        onClick = { onPlayStory(story, storyLang) },
                        colors = ButtonDefaults.buttonColors(containerColor = SaffronOrange, contentColor = ObsidianBlack),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.AutoMirrored.Filled.VolumeUp, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Play Deep-Voice Narration (${storyLang.label})", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // 8. Related Places & Stories
        item {
            Text("Related Places Across Odisha", style = MaterialTheme.typography.headlineSmall, color = IvoryText)
        }
        items(relatedPlaces, key = { it.id }) { rel ->
            Card(
                onClick = { onOpenRelatedDestination(rel.id) },
                colors = CardDefaults.cardColors(containerColor = CharcoalSurface),
                border = BorderStroke(1.dp, CharcoalBorder),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.padding(14.dp)
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(rel.name, style = MaterialTheme.typography.titleSmall, color = IvoryText)
                        Text("${rel.category} • ${rel.nearestHub}", style = MaterialTheme.typography.bodySmall, color = IvoryMuted)
                    }
                    Text("Explore →", color = WarmGold, style = MaterialTheme.typography.labelMedium)
                }
            }
        }
    }
}
