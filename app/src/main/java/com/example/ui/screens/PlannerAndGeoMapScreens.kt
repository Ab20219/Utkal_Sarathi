package com.example.ui.screens

import android.content.Intent
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Directions
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.AlertDialog
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
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.data.catalog.OdishaDistrictCatalog
import com.example.data.local.SavedTripEntity
import com.example.data.model.GeoHubNode
import com.example.data.repository.DayItinerarySlot
import com.example.data.repository.UtkalRepository
import com.example.ui.components.buildShareFooterLine
import com.example.ui.components.launchGeoMapsUri
import com.example.ui.components.shareOnWhatsApp
import com.example.ui.components.shareViaSystemSheet
import com.example.ui.theme.CharcoalBorder
import com.example.ui.theme.CharcoalElevated
import com.example.ui.theme.CharcoalSurface
import com.example.ui.theme.IvoryMuted
import com.example.ui.theme.IvoryText
import com.example.ui.theme.ObsidianBlack
import com.example.ui.theme.OdishaTeal
import com.example.ui.theme.SaffronOrange
import com.example.ui.theme.SosCrimson
import com.example.ui.theme.VerifiedEmerald
import com.example.ui.theme.WarmGold
import kotlin.math.hypot

@Composable
fun TripPlannerAndMyTripsScreen(
    savedTrips: List<SavedTripEntity>,
    repository: UtkalRepository,
    onCreateTrip: (startCity: String, districtIds: List<String>, days: Int, datesLabel: String, travellers: Int, tier: String, interests: List<String>) -> SavedTripEntity,
    onUpdateTripSlots: (SavedTripEntity, List<DayItinerarySlot>) -> Unit,
    onDeleteTrip: (String) -> Unit
) {
    val context = LocalContext.current
    var startingCity by remember { mutableStateOf("Bhubaneswar") }
    var travelDates by remember { mutableStateOf("Nov 15 – Nov 18") }
    var durationDays by remember { mutableIntStateOf(3) }
    var travellerCount by remember { mutableIntStateOf(2) }
    var selectedTier by remember { mutableStateOf("Moderate") }
    val selectedDistrictIds = remember { mutableStateListOf("khordha", "puri") }
    val selectedInterests = remember { mutableStateListOf("Temples & Heritage", "Cuisine & Crafts") }

    var activeOpenedTrip by remember { mutableStateOf<SavedTripEntity?>(null) }
    var editingSlotIndex by remember { mutableStateOf<Int?>(null) }

    val availableInterests = listOf("Temples & Heritage", "Beaches & Lagoon", "Waterfalls & Eco-Camps", "Tribal Culture", "Cuisine & Crafts", "Wildlife Safaris")

    val displayTrip = activeOpenedTrip ?: savedTrips.firstOrNull()
    val slots = remember(displayTrip?.itineraryDaysJson) {
        displayTrip?.let { repository.parseDaySlots(it.itineraryDaysJson) }.orEmpty()
    }

    if (displayTrip != null && editingSlotIndex != null && editingSlotIndex!! in slots.indices) {
        val targetSlot = slots[editingSlotIndex!!]
        EditDaySlotDialog(
            slot = targetSlot,
            onDismiss = { editingSlotIndex = null },
            onSave = { edited ->
                val mutable = slots.toMutableList()
                mutable[editingSlotIndex!!] = edited
                val updatedEntity = displayTrip.copy(
                    totalEstimatedCostInr = mutable.sumOf { it.dayBudgetInr },
                    itineraryDaysJson = repository.serializeDaySlots(mutable)
                )
                onUpdateTripSlots(displayTrip, mutable)
                activeOpenedTrip = updatedEntity
                editingSlotIndex = null
            }
        )
    }

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        modifier = Modifier
            .fillMaxSize()
            .testTag("trip_planner_screen")
    ) {
        item {
            Text("Personalized Odisha Trip Planner", style = MaterialTheme.typography.headlineMedium, color = IvoryText)
            Text(
                text = "Deterministic routing & transparent INR cost breakdowns across all 30 districts.",
                style = MaterialTheme.typography.bodySmall,
                color = WarmGold
            )
        }

        // Interactive Planner Form Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalSurface),
                border = BorderStroke(1.dp, CharcoalBorder),
                shape = RoundedCornerShape(18.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(
                            value = startingCity,
                            onValueChange = { startingCity = it },
                            label = { Text("Starting Hub") },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = SaffronOrange,
                                unfocusedBorderColor = CharcoalBorder,
                                focusedTextColor = IvoryText,
                                unfocusedTextColor = IvoryText
                            ),
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = travelDates,
                            onValueChange = { travelDates = it },
                            label = { Text("Travel Dates") },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = SaffronOrange,
                                unfocusedBorderColor = CharcoalBorder,
                                focusedTextColor = IvoryText,
                                unfocusedTextColor = IvoryText
                            ),
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Days & Travellers Steppers
                    Row(
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        StepperPill(
                            label = "Duration: $durationDays Days",
                            onMinus = { if (durationDays > 1) durationDays-- },
                            onPlus = { if (durationDays < 14) durationDays++ }
                        )
                        StepperPill(
                            label = "Travellers: $travellerCount",
                            onMinus = { if (travellerCount > 1) travellerCount-- },
                            onPlus = { if (travellerCount < 12) travellerCount++ }
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    Text("Budget Tier", style = MaterialTheme.typography.labelMedium, color = WarmGold)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("Budget", "Moderate", "Luxury").forEach { tier ->
                            FilterChip(
                                selected = selectedTier == tier,
                                onClick = { selectedTier = tier },
                                label = { Text(tier) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = SaffronOrange.copy(alpha = 0.25f),
                                    selectedLabelColor = WarmGold
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Select Districts (${selectedDistrictIds.size} chosen)", style = MaterialTheme.typography.labelMedium, color = WarmGold)
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(OdishaDistrictCatalog.allDistricts, key = { it.id }) { dist ->
                            val chosen = selectedDistrictIds.contains(dist.id)
                            FilterChip(
                                selected = chosen,
                                onClick = {
                                    if (chosen && selectedDistrictIds.size > 1) selectedDistrictIds.remove(dist.id)
                                    else if (!chosen) selectedDistrictIds.add(dist.id)
                                },
                                label = { Text(dist.nameEn, style = MaterialTheme.typography.labelSmall) }
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Interests & Experiences", style = MaterialTheme.typography.labelMedium, color = WarmGold)
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(availableInterests) { interest ->
                            val chosen = selectedInterests.contains(interest)
                            FilterChip(
                                selected = chosen,
                                onClick = {
                                    if (chosen) selectedInterests.remove(interest) else selectedInterests.add(interest)
                                },
                                label = { Text(interest, style = MaterialTheme.typography.labelSmall) }
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    Button(
                        onClick = {
                            val created = onCreateTrip(
                                startingCity,
                                selectedDistrictIds.toList(),
                                durationDays,
                                travelDates,
                                travellerCount,
                                selectedTier,
                                selectedInterests.toList()
                            )
                            activeOpenedTrip = created
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = SaffronOrange, contentColor = ObsidianBlack),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                            .testTag("generate_itinerary_button")
                    ) {
                        Icon(Icons.Filled.Add, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Generate & Save Day-by-Day Itinerary", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Active / Reopened Itinerary Viewer & Editor
        if (displayTrip != null) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = CharcoalElevated),
                    border = BorderStroke(1.dp, WarmGold),
                    shape = RoundedCornerShape(18.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("ACTIVE ITINERARY", style = MaterialTheme.typography.labelSmall, color = OdishaTeal)
                                Text(displayTrip.title, style = MaterialTheme.typography.headlineSmall, color = IvoryText)
                                Text(
                                    text = "${displayTrip.travelDatesLabel} • ${displayTrip.travellerCount} Traveller(s) • ${displayTrip.tierPreference}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = WarmGold
                                )
                            }
                            Row {
                                IconButton(
                                    onClick = {
                                        val regenerated = onCreateTrip(
                                            displayTrip.startingCity,
                                            displayTrip.selectedDistrictsCsv.split(","),
                                            displayTrip.durationDays,
                                            displayTrip.travelDatesLabel,
                                            displayTrip.travellerCount,
                                            displayTrip.tierPreference,
                                            displayTrip.interestsCsv.split(",").filter { it.isNotBlank() }
                                        )
                                        activeOpenedTrip = regenerated
                                    }
                                ) {
                                    Icon(Icons.Filled.Refresh, contentDescription = "Regenerate Trip", tint = WarmGold)
                                }
                                IconButton(
                                    onClick = {
                                        val shareBody = buildString {
                                            appendLine("🗺️ *UtkalSarathi Odisha Itinerary: ${displayTrip.title}*")
                                            appendLine("👥 ${displayTrip.travellerCount} Traveller(s) • ${displayTrip.tierPreference} • ${displayTrip.travelDatesLabel}")
                                            appendLine("💰 Total Estimated Budget: ₹${displayTrip.totalEstimatedCostInr}")
                                            appendLine()
                                            slots.forEach { s ->
                                                appendLine("• *Day ${s.dayNumber} (${s.districtName}):* ${s.primaryStop} & ${s.secondaryStop} | Stay: ${s.staySuggestion} | Est: ₹${s.dayBudgetInr}")
                                            }
                                            appendLine()
                                            appendLine(buildShareFooterLine(context))
                                        }
                                        shareViaSystemSheet(context, shareBody, "Share Odisha Trip")
                                    }
                                ) {
                                    Icon(Icons.Filled.Share, contentDescription = "Share Itinerary", tint = OdishaTeal)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Estimated Total Budget: ₹${displayTrip.totalEstimatedCostInr}",
                            style = MaterialTheme.typography.titleLarge,
                            color = SaffronOrange
                        )
                        Text(
                            text = displayTrip.costAssumptionsNote,
                            style = MaterialTheme.typography.labelSmall,
                            color = IvoryMuted
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Button(
                            onClick = {
                                val waTripMessage = buildString {
                                    appendLine("🗺️ *UtkalSarathi Odisha Itinerary: ${displayTrip.title}*")
                                    appendLine("👥 ${displayTrip.travellerCount} Traveller(s) • ${displayTrip.tierPreference} • ${displayTrip.travelDatesLabel}")
                                    appendLine("💰 *Total Estimated Cost:* ₹${displayTrip.totalEstimatedCostInr}")
                                    appendLine()
                                    slots.forEach { s ->
                                        appendLine("*Day ${s.dayNumber} — ${s.districtName}*")
                                        appendLine("  • Stops: ${s.primaryStop} & ${s.secondaryStop}")
                                        appendLine("  • Stay: ${s.staySuggestion} | Food: ${s.foodHighlight}")
                                        if (s.userCustomNotes.isNotBlank()) {
                                            appendLine("  • Note: ${s.userCustomNotes}")
                                        }
                                        appendLine("  • Day Est: ₹${s.dayBudgetInr}")
                                    }
                                    appendLine()
                                    appendLine(buildShareFooterLine(context))
                                }
                                shareOnWhatsApp(context, waTripMessage)
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = VerifiedEmerald,
                                contentColor = ObsidianBlack
                            ),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp)
                                .testTag("trip_share_whatsapp_button")
                        ) {
                            Icon(Icons.Filled.Share, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Share Itinerary on WhatsApp", fontWeight = FontWeight.Bold)
                        }
                        Spacer(modifier = Modifier.height(12.dp))

                        slots.forEachIndexed { idx, slot ->
                            Surface(
                                color = CharcoalSurface,
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 8.dp)
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Row(
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically,
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Text(
                                            text = "Day ${slot.dayNumber} • ${slot.districtName}",
                                            style = MaterialTheme.typography.titleMedium,
                                            color = WarmGold
                                        )
                                        IconButton(onClick = { editingSlotIndex = idx }, modifier = Modifier.size(36.dp)) {
                                            Icon(Icons.Filled.Edit, contentDescription = "Edit Day ${slot.dayNumber}", tint = IvoryMuted)
                                        }
                                    }
                                    Text("• Primary: ${slot.primaryStop}", style = MaterialTheme.typography.bodyMedium, color = IvoryText)
                                    Text("• Afternoon/Cultural: ${slot.secondaryStop}", style = MaterialTheme.typography.bodySmall, color = IvoryText)
                                    Text("• Transit (~${slot.estimatedTravelKm} km, ~${slot.estimatedDriveMinutes} min): ${slot.transportRecommendation}", style = MaterialTheme.typography.bodySmall, color = IvoryMuted)
                                    Text("• Stay: ${slot.staySuggestion}", style = MaterialTheme.typography.bodySmall, color = IvoryMuted)
                                    Text("• Cuisine: ${slot.foodHighlight}", style = MaterialTheme.typography.bodySmall, color = OdishaTeal)
                                    if (slot.userCustomNotes.isNotBlank()) {
                                        Text("• Notes: ${slot.userCustomNotes}", style = MaterialTheme.typography.labelSmall, color = SaffronOrange)
                                    }
                                    Text("Day Estimate: ₹${slot.dayBudgetInr}", style = MaterialTheme.typography.labelMedium, color = WarmGold)
                                }
                            }
                        }
                    }
                }
            }
        }

        // Saved Trips History
        if (savedTrips.size > 1) {
            item {
                Text("Saved Odisha Trips (${savedTrips.size})", style = MaterialTheme.typography.headlineSmall, color = IvoryText)
            }
            items(savedTrips, key = { it.id }) { trip ->
                Card(
                    onClick = { activeOpenedTrip = trip },
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
                            Text(trip.title, style = MaterialTheme.typography.titleSmall, color = IvoryText)
                            Text("₹${trip.totalEstimatedCostInr} • ${trip.tierPreference} • ${trip.travelDatesLabel}", style = MaterialTheme.typography.bodySmall, color = WarmGold)
                        }
                        IconButton(onClick = { onDeleteTrip(trip.id) }) {
                            Icon(Icons.Filled.Delete, contentDescription = "Delete trip", tint = SosCrimson)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun StepperPill(label: String, onMinus: () -> Unit, onPlus: () -> Unit) {
    Surface(
        color = CharcoalElevated,
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
            TextButton(onClick = onMinus) { Text("−", color = WarmGold, style = MaterialTheme.typography.titleMedium) }
            Text(label, style = MaterialTheme.typography.labelMedium, color = IvoryText)
            TextButton(onClick = onPlus) { Text("+", color = SaffronOrange, style = MaterialTheme.typography.titleMedium) }
        }
    }
}

@Composable
private fun EditDaySlotDialog(
    slot: DayItinerarySlot,
    onDismiss: () -> Unit,
    onSave: (DayItinerarySlot) -> Unit
) {
    var primary by remember { mutableStateOf(slot.primaryStop) }
    var secondary by remember { mutableStateOf(slot.secondaryStop) }
    var notes by remember { mutableStateOf(slot.userCustomNotes) }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = CharcoalElevated,
        title = { Text("Edit Day ${slot.dayNumber} (${slot.districtName})", color = IvoryText) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = primary, onValueChange = { primary = it }, label = { Text("Primary Stop") })
                OutlinedTextField(value = secondary, onValueChange = { secondary = it }, label = { Text("Secondary Experience") })
                OutlinedTextField(value = notes, onValueChange = { notes = it }, label = { Text("Personal Notes") })
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onSave(slot.copy(primaryStop = primary, secondaryStop = secondary, userCustomNotes = notes))
                },
                colors = ButtonDefaults.buttonColors(containerColor = SaffronOrange, contentColor = ObsidianBlack)
            ) {
                Text("Save Changes", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel", color = IvoryMuted) }
        }
    )
}

/**
 * Odisha Geo-Map & Fair Transit Fares Screen (Master Prompt Section 10).
 * Plots accurate lat/lon coordinates of all 30 Odisha districts + airports/rail/hospitals/police
 * onto an interactive vector coordinate canvas (17.7°N–22.6°N, 81.3°E–87.5°E), calculates
 * deterministic Haversine road distances & benchmark fare ranges, and launches external Google Maps navigation.
 */
@Composable
fun OdishaGeoMapAndTransitScreen(
    onBack: () -> Unit,
    onOpenDistrict: (String) -> Unit
) {
    BackHandler { onBack() }
    val context = LocalContext.current
    var selectedFilter by remember { mutableStateOf("All") }
    var originDistrictId by remember { mutableStateOf("khordha") }
    var destDistrictId by remember { mutableStateOf("puri") }
    var selectedHubNode by remember { mutableStateOf<GeoHubNode?>(OdishaDistrictCatalog.geoHubNodes.first()) }

    val visibleNodes = remember(selectedFilter) {
        if (selectedFilter == "All") OdishaDistrictCatalog.geoHubNodes
        else OdishaDistrictCatalog.geoHubNodes.filter { it.type == selectedFilter }
    }

    val originDist = OdishaDistrictCatalog.getDistrictById(originDistrictId)!!
    val targetDist = OdishaDistrictCatalog.getDistrictById(destDistrictId)!!
    val roadKm = remember(originDistrictId, destDistrictId) {
        if (originDistrictId == destDistrictId) 12
        else OdishaDistrictCatalog.estimateRoadDistanceKm(
            originDist.latitude,
            originDist.longitude,
            targetDist.latitude,
            targetDist.longitude,
            isGhatTerrain = targetDist.region.name == "SOUTHERN"
        )
    }

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        modifier = Modifier
            .fillMaxSize()
            .testTag("geomap_transit_screen")
    ) {
        item {
            Text("Odisha Geo-Map & Fair Transit Estimator", style = MaterialTheme.typography.headlineMedium, color = IvoryText)
            Text(
                text = "Tap any plotted GPS node across Odisha (17.7°N–22.6°N, 81.3°E–87.5°E) or launch turn-by-turn navigation.",
                style = MaterialTheme.typography.bodySmall,
                color = WarmGold
            )
            Spacer(modifier = Modifier.height(8.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(listOf("All", "Destination", "Airport", "Rail Junction", "Hospital", "Police HQ")) { type ->
                    FilterChip(
                        selected = selectedFilter == type,
                        onClick = { selectedFilter = type },
                        label = { Text(type, style = MaterialTheme.typography.labelSmall) }
                    )
                }
            }
        }

        // Interactive Coordinate Geo-Canvas
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(260.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(CharcoalSurface)
            ) {
                Canvas(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp)
                        .pointerInput(visibleNodes) {
                            detectTapGestures { tapOffset ->
                                val w = size.width.toFloat()
                                val h = size.height.toFloat()
                                val nearest = visibleNodes.minByOrNull { node ->
                                    val nx = ((node.longitude - 81.3) / (87.6 - 81.3)).toFloat() * w
                                    val ny = (1f - ((node.latitude - 17.7) / (22.6 - 17.7)).toFloat()) * h
                                    hypot(tapOffset.x - nx, tapOffset.y - ny)
                                }
                                if (nearest != null) {
                                    selectedHubNode = nearest
                                }
                            }
                        }
                ) {
                    val w = size.width
                    val h = size.height

                    // Subtle Lat/Lon Grid lines
                    for (i in 1..4) {
                        val y = (h / 5f) * i
                        val x = (w / 5f) * i
                        drawLine(CharcoalBorder, Offset(0f, y), Offset(w, y), strokeWidth = 1f)
                        drawLine(CharcoalBorder, Offset(x, 0f), Offset(x, h), strokeWidth = 1f)
                    }

                    // Route line between selected Origin and Destination districts
                    val ox = ((originDist.longitude - 81.3) / (87.6 - 81.3)).toFloat() * w
                    val oy = (1f - ((originDist.latitude - 17.7) / (22.6 - 17.7)).toFloat()) * h
                    val dx = ((targetDist.longitude - 81.3) / (87.6 - 81.3)).toFloat() * w
                    val dy = (1f - ((targetDist.latitude - 17.7) / (22.6 - 17.7)).toFloat()) * h
                    drawLine(
                        color = WarmGold,
                        start = Offset(ox, oy),
                        end = Offset(dx, dy),
                        strokeWidth = 4f,
                        pathEffect = PathEffect.dashPathEffect(floatArrayOf(12f, 8f), 0f)
                    )

                    // Plot nodes
                    visibleNodes.forEach { node ->
                        val nx = ((node.longitude - 81.3) / (87.6 - 81.3)).toFloat() * w
                        val ny = (1f - ((node.latitude - 17.7) / (22.6 - 17.7)).toFloat()) * h
                        val dotColor = when (node.type) {
                            "Hospital", "Police HQ" -> SosCrimson
                            "Airport", "Rail Junction" -> OdishaTeal
                            else -> SaffronOrange
                        }
                        val isSelected = selectedHubNode?.id == node.id
                        if (isSelected) {
                            drawCircle(WarmGold.copy(alpha = 0.35f), radius = 18f, center = Offset(nx, ny))
                        }
                        drawCircle(dotColor, radius = if (isSelected) 10f else 6.5f, center = Offset(nx, ny))
                    }
                }
            }
        }

        // Selected Node Inspector
        selectedHubNode?.let { node ->
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = CharcoalElevated),
                    border = BorderStroke(1.dp, WarmGold.copy(alpha = 0.5f)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text("${node.type.uppercase()} • ${node.contactOrCode}", style = MaterialTheme.typography.labelSmall, color = OdishaTeal)
                        Text(node.name, style = MaterialTheme.typography.titleMedium, color = IvoryText)
                        Text(node.details, style = MaterialTheme.typography.bodySmall, color = IvoryMuted)
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                onClick = { launchGeoMapsUri(context, node.latitude, node.longitude, node.name) },
                                colors = ButtonDefaults.buttonColors(containerColor = SaffronOrange, contentColor = ObsidianBlack)
                            ) {
                                Icon(Icons.Filled.Directions, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Navigate in Maps", fontWeight = FontWeight.Bold)
                            }
                            OutlinedButton(onClick = { onOpenDistrict(node.districtId) }) {
                                Text("Open District", color = WarmGold)
                            }
                        }
                    }
                }
            }
        }

        // Fair Transit & Last-Mile Fare Calculator
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalSurface),
                border = BorderStroke(1.dp, CharcoalBorder),
                shape = RoundedCornerShape(18.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Fair Fare & Inter-District Distance Estimator", style = MaterialTheme.typography.titleLarge, color = IvoryText)
                    Text(
                        text = "Benchmark Reference Estimates (Never presented as live confirmed ticket availability). Verify live rail seats on IRCTC & Mo Bus / OSRTC counters.",
                        style = MaterialTheme.typography.labelSmall,
                        color = WarmGold
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Text("From District: ${originDist.nameEn}", style = MaterialTheme.typography.labelMedium, color = IvoryMuted)
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(OdishaDistrictCatalog.allDistricts, key = { "orig_${it.id}" }) { d ->
                            FilterChip(
                                selected = originDistrictId == d.id,
                                onClick = { originDistrictId = d.id },
                                label = { Text(d.nameEn, style = MaterialTheme.typography.labelSmall) }
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("To District: ${targetDist.nameEn}", style = MaterialTheme.typography.labelMedium, color = IvoryMuted)
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(OdishaDistrictCatalog.allDistricts, key = { "dest_${it.id}" }) { d ->
                            FilterChip(
                                selected = destDistrictId == d.id,
                                onClick = { destDistrictId = d.id },
                                label = { Text(d.nameEn, style = MaterialTheme.typography.labelSmall) }
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))
                    val osrtcEst = (roadKm * 1.45).toInt().coerceAtLeast(30)
                    val acBusEst = (roadKm * 2.35).toInt().coerceAtLeast(60)
                    val acSedanEst = (roadKm * 14).coerceAtLeast(600)
                    val autoLocalBase = "₹40–₹60 first 2 km + ₹15–₹18/km (Prepaid/App Auto recommended)"

                    Text("Estimated Highway Distance: ~$roadKm km (~${(roadKm / 46.0 * 60).toInt()} mins)", style = MaterialTheme.typography.titleMedium, color = SaffronOrange)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("• OSRTC / Express Bus Benchmark: ₹$osrtcEst – ₹$acBusEst per passenger", style = MaterialTheme.typography.bodySmall, color = IvoryText)
                    Text("• Outstation AC Sedan Taxi Benchmark: ₹$acSedanEst – ₹${(acSedanEst * 1.2).toInt()} one-way", style = MaterialTheme.typography.bodySmall, color = IvoryText)
                    Text("• Last-Mile Auto-Rickshaw / CRUT Mo Bus Guide: $autoLocalBase", style = MaterialTheme.typography.bodySmall, color = OdishaTeal)
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedButton(
                        onClick = { launchGeoMapsUri(context, targetDist.latitude, targetDist.longitude, "${targetDist.nameEn}, Odisha") },
                        border = BorderStroke(1.dp, OdishaTeal)
                    ) {
                        Text("Open Live Route Directions in Maps App", color = OdishaTeal)
                    }
                }
            }
        }
    }
}
