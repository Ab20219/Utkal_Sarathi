package com.example.ui.screens

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.CloudDownload
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Warning
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
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.example.R
import com.example.data.catalog.OdishaDistrictCatalog
import com.example.data.local.HazardReportEntity
import com.example.data.local.OfflineDistrictEntity
import com.example.data.local.SavedTripEntity
import com.example.data.local.StoryEntity
import com.example.data.local.TrustedContactEntity
import com.example.data.local.UserPrefsState
import com.example.data.model.CulturalListing
import com.example.data.voice.UtkalVoiceNarrator
import com.example.ui.AppScreen
import com.example.ui.components.VerificationBadgeChip
import com.example.ui.components.buildUtkalAppInviteText
import com.example.ui.components.copyToClipboardWithToast
import com.example.ui.components.getCustomShareLink
import com.example.ui.components.launchEmergencyDial112
import com.example.ui.components.launchGeoMapsUri
import com.example.ui.components.saveCustomShareLink
import com.example.ui.components.shareOnWhatsApp
import com.example.ui.components.shareViaSystemSheet
import com.example.ui.theme.CharcoalBorder
import com.example.ui.theme.CharcoalElevated
import com.example.ui.theme.CharcoalSurface
import com.example.ui.theme.IvoryMuted
import com.example.ui.theme.IvoryText
import com.example.ui.theme.LegendAmber
import com.example.ui.theme.ObsidianBlack
import com.example.ui.theme.OdishaTeal
import com.example.ui.theme.SaffronOrange
import com.example.ui.theme.SosCrimson
import com.example.ui.theme.VerifiedEmerald
import com.example.ui.theme.WarmGold
import com.google.android.gms.location.LocationServices
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@SuppressLint("MissingPermission")
@Composable
fun UtkalSurakshaSafetyScreen(
    hazardReports: List<HazardReportEntity>,
    trustedContacts: List<TrustedContactEntity>,
    onSubmitHazard: (districtId: String, location: String, category: String, description: String, severity: String, lat: Double?, lon: Double?) -> Unit,
    onAddContact: (name: String, relation: String, phone: String) -> Unit,
    onRemoveContact: (String) -> Unit
) {
    val context = LocalContext.current
    var liveCoords by remember { mutableStateOf<Pair<Double, Double>?>(null) }
    var locationStatus by remember { mutableStateOf("Tap 'Fetch GPS Location' to locate nearest Odisha Hospital & Police HQ.") }
    var showHazardDialog by remember { mutableStateOf(false) }
    var showContactDialog by remember { mutableStateOf(false) }

    val fusedClient = remember { LocationServices.getFusedLocationProviderClient(context) }

    val fetchGps = {
        fusedClient.lastLocation.addOnSuccessListener { loc ->
            if (loc != null) {
                liveCoords = loc.latitude to loc.longitude
                locationStatus = "GPS Fixed: %.4f°N, %.4f°E".format(loc.latitude, loc.longitude)
            } else {
                locationStatus = "GPS enabled, awaiting satellite fix. Showing statewide emergency hubs below."
            }
        }.addOnFailureListener {
            locationStatus = "Unable to read GPS location (${it.localizedMessage})."
        }
    }

    val locationPermLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { result ->
        val granted = result[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
            result[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        if (granted) {
            fetchGps()
        } else {
            locationStatus = "Location permission denied. Grant permission to calculate nearest emergency hub."
        }
    }

    val emergencyHubs = remember(liveCoords) {
        val medicalAndPolice = OdishaDistrictCatalog.geoHubNodes.filter { it.type == "Hospital" || it.type == "Police HQ" }
        val coords = liveCoords
        if (coords == null) medicalAndPolice
        else medicalAndPolice.sortedBy {
            OdishaDistrictCatalog.estimateRoadDistanceKm(coords.first, coords.second, it.latitude, it.longitude)
        }
    }

    if (showHazardDialog) {
        SubmitHazardDialog(
            coords = liveCoords,
            onDismiss = { showHazardDialog = false },
            onSubmit = { distId, locLabel, cat, desc, sev ->
                onSubmitHazard(distId, locLabel, cat, desc, sev, liveCoords?.first, liveCoords?.second)
                showHazardDialog = false
            }
        )
    }

    if (showContactDialog) {
        AddTrustedContactDialog(
            onDismiss = { showContactDialog = false },
            onAdd = { name, rel, phone ->
                onAddContact(name, rel, phone)
                showContactDialog = false
            }
        )
    }

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        modifier = Modifier
            .fillMaxSize()
            .testTag("utkal_suraksha_screen")
    ) {
        // Emergency SOS 112 Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SosCrimson.copy(alpha = 0.18f)),
                border = BorderStroke(1.5.dp, SosCrimson),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("UTKALSURAKSHA • EMERGENCY RESPONSE", style = MaterialTheme.typography.labelMedium, color = Color(0xFFFFB4AB))
                    Text("Emergency SOS 112 & Ambulance 108", style = MaterialTheme.typography.headlineSmall, color = IvoryText)
                    Text(
                        text = "Opens your phone dialer immediately (works over cellular voice network even without mobile data). UtkalSarathi never claims an automated alert was delivered unless confirmed by your carrier.",
                        style = MaterialTheme.typography.bodySmall,
                        color = IvoryMuted
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Button(
                            onClick = { launchEmergencyDial112(context) },
                            colors = ButtonDefaults.buttonColors(containerColor = SosCrimson, contentColor = Color.White),
                            modifier = Modifier
                                .weight(1f)
                                .height(50.dp)
                                .testTag("safety_dial_112_button")
                        ) {
                            Icon(Icons.Filled.Call, contentDescription = null)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Dial 112 Police/SOS", fontWeight = FontWeight.Bold)
                        }
                        OutlinedButton(
                            onClick = {
                                val dial108 = Intent(Intent.ACTION_DIAL, Uri.parse("tel:108")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                runCatching { context.startActivity(dial108) }
                            },
                            border = BorderStroke(1.dp, WarmGold),
                            modifier = Modifier
                                .weight(1f)
                                .height(50.dp)
                        ) {
                            Text("Dial 108 Ambulance", color = WarmGold, fontWeight = FontWeight.SemiBold)
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Tourist Helpline (Govt. of India): 1363 • OSDMA Disaster Control: 1070 / 1077",
                        style = MaterialTheme.typography.labelSmall,
                        color = WarmGold
                    )
                }
            }
        }

        // GPS Location & Trusted Contact Sharing
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalSurface),
                border = BorderStroke(1.dp, CharcoalBorder),
                shape = RoundedCornerShape(18.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Live Location & Trusted Contacts", style = MaterialTheme.typography.titleLarge, color = IvoryText)
                    Text(locationStatus, style = MaterialTheme.typography.bodySmall, color = OdishaTeal)
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = {
                                val fine = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
                                val coarse = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
                                if (fine || coarse) fetchGps()
                                else locationPermLauncher.launch(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION))
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = OdishaTeal, contentColor = ObsidianBlack)
                        ) {
                            Icon(Icons.Filled.LocationOn, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Fetch GPS Location", fontWeight = FontWeight.Bold)
                        }
                        OutlinedButton(onClick = { showContactDialog = true }, border = BorderStroke(1.dp, WarmGold)) {
                            Text("+ Add Contact", color = WarmGold)
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedButton(
                        onClick = {
                            val coordsText = liveCoords?.let { "https://maps.google.com/?q=${it.first},${it.second}" }
                                ?: "Odisha Trip (Tap 'Fetch GPS Location' first for exact coordinates)"
                            val checkInMsg = "🛡️ *UtkalSarathi Safety Check-in*\nMy current Odisha travel location: $coordsText\nEmergency Helpline: 112"
                            shareOnWhatsApp(context, checkInMsg)
                        },
                        border = BorderStroke(1.dp, VerifiedEmerald),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .testTag("safety_whatsapp_location_button")
                    ) {
                        Icon(Icons.Filled.Share, contentDescription = null, tint = VerifiedEmerald, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Share Live Status / GPS on WhatsApp", color = VerifiedEmerald, fontWeight = FontWeight.SemiBold)
                    }

                    if (trustedContacts.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(10.dp))
                        trustedContacts.forEach { c ->
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp)
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("${c.name} (${c.relation})", style = MaterialTheme.typography.titleSmall, color = IvoryText)
                                    Text(c.phoneNumber, style = MaterialTheme.typography.bodySmall, color = IvoryMuted)
                                }
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    OutlinedButton(
                                        onClick = {
                                            val coordsText = liveCoords?.let { "https://maps.google.com/?q=${it.first},${it.second}" }
                                                ?: "Odisha Trip (GPS fix pending)"
                                            val waMsg = "🛡️ *UtkalSarathi Safety Check-in*\nHi ${c.name}, sharing my Odisha travel status/location: $coordsText"
                                            shareOnWhatsApp(context, waMsg, phoneNumber = c.phoneNumber)
                                        },
                                        border = BorderStroke(1.dp, VerifiedEmerald),
                                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                        modifier = Modifier.padding(end = 4.dp)
                                    ) {
                                        Text("WhatsApp", style = MaterialTheme.typography.labelSmall, color = VerifiedEmerald)
                                    }
                                    IconButton(
                                        onClick = {
                                            val coordsText = liveCoords?.let { "https://maps.google.com/?q=${it.first},${it.second}" }
                                                ?: "Odisha Trip (GPS fix pending)"
                                            val smsIntent = Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:${c.phoneNumber}")).apply {
                                                putExtra("sms_body", "UtkalSarathi Safety Check-in: My current travel status/location in Odisha: $coordsText")
                                                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                            }
                                            runCatching { context.startActivity(smsIntent) }
                                        }
                                    ) {
                                        Icon(Icons.Filled.Share, contentDescription = "Compose SMS to contact", tint = SaffronOrange)
                                    }
                                    IconButton(onClick = { onRemoveContact(c.id) }) {
                                        Icon(Icons.Filled.Delete, contentDescription = "Delete contact", tint = SosCrimson)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Official Advisories & Moderated Timestamped Hazard Reports
        item {
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Safety Advisories & Hazard Reports", style = MaterialTheme.typography.headlineSmall, color = IvoryText)
                OutlinedButton(onClick = { showHazardDialog = true }, border = BorderStroke(1.dp, LegendAmber)) {
                    Icon(Icons.Filled.Warning, contentDescription = null, tint = LegendAmber, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Report Hazard", color = LegendAmber, style = MaterialTheme.typography.labelMedium)
                }
            }
            Text(
                text = "For live cyclone/monsoon bulletins, verify directly at mausam.imd.gov.in & osdma.org.",
                style = MaterialTheme.typography.labelSmall,
                color = WarmGold
            )
        }

        items(hazardReports, key = { it.id }) { report ->
            val fmt = remember { SimpleDateFormat("dd MMM yyyy, HH:mm", Locale.US) }
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalSurface),
                border = BorderStroke(1.dp, CharcoalBorder),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    VerificationBadgeChip(report.verificationStatus)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("${report.category} • ${report.locationLabel}", style = MaterialTheme.typography.titleMedium, color = IvoryText)
                    Text(report.description, style = MaterialTheme.typography.bodySmall, color = IvoryMuted)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Severity: ${report.severity} • Logged: ${fmt.format(Date(report.reportedAtEpochMs))}",
                        style = MaterialTheme.typography.labelSmall,
                        color = WarmGold
                    )
                }
            }
        }

        // Nearest Tertiary Hospitals & Police Hubs
        item {
            Text("Major Odisha Hospitals & Police Hubs", style = MaterialTheme.typography.headlineSmall, color = IvoryText)
        }
        items(emergencyHubs, key = { it.id }) { hub ->
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalElevated),
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
                        Text(hub.name, style = MaterialTheme.typography.titleSmall, color = IvoryText)
                        Text("${hub.details} • ${hub.contactOrCode}", style = MaterialTheme.typography.bodySmall, color = IvoryMuted)
                    }
                    OutlinedButton(onClick = { launchGeoMapsUri(context, hub.latitude, hub.longitude, hub.name) }) {
                        Text("Map", color = OdishaTeal)
                    }
                }
            }
        }
    }
}

@Composable
private fun SubmitHazardDialog(
    coords: Pair<Double, Double>?,
    onDismiss: () -> Unit,
    onSubmit: (String, String, String, String, String) -> Unit
) {
    var locationLabel by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("Road Disruption") }
    var description by remember { mutableStateOf("") }
    var severity by remember { mutableStateOf("Caution") }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = CharcoalElevated,
        title = { Text("Report Travel Hazard", color = IvoryText) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = "Community reports are clearly marked 'Pending Moderation' until verified against official authorities.",
                    style = MaterialTheme.typography.labelSmall,
                    color = LegendAmber
                )
                OutlinedTextField(value = locationLabel, onValueChange = { locationLabel = it }, label = { Text("Road / Ghat / Beach Location") })
                OutlinedTextField(value = category, onValueChange = { category = it }, label = { Text("Category (Road, Weather, Tide, Wildlife)") })
                OutlinedTextField(value = description, onValueChange = { description = it }, label = { Text("Observed Condition") })
                if (coords != null) {
                    Text("Attached GPS: %.4f, %.4f".format(coords.first, coords.second), style = MaterialTheme.typography.labelSmall, color = OdishaTeal)
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (locationLabel.isNotBlank() && description.isNotBlank()) {
                        onSubmit("khordha", locationLabel, category, description, severity)
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = SaffronOrange, contentColor = ObsidianBlack)
            ) {
                Text("Submit Report", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel", color = IvoryMuted) } }
    )
}

@Composable
private fun AddTrustedContactDialog(
    onDismiss: () -> Unit,
    onAdd: (String, String, String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var relation by remember { mutableStateOf("Family") }
    var phone by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = CharcoalElevated,
        title = { Text("Add Trusted Emergency Contact", color = IvoryText) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Full Name") })
                OutlinedTextField(value = relation, onValueChange = { relation = it }, label = { Text("Relation") })
                OutlinedTextField(value = phone, onValueChange = { phone = it }, label = { Text("Phone Number") })
            }
        },
        confirmButton = {
            Button(
                onClick = { if (name.isNotBlank() && phone.isNotBlank()) onAdd(name, relation, phone) },
                colors = ButtonDefaults.buttonColors(containerColor = SaffronOrange, contentColor = ObsidianBlack)
            ) {
                Text("Save", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel", color = IvoryMuted) } }
    )
}

/**
 * Cuisine, GI-Tagged Products, Handloom, Artisans & Official Eco-Camps Screen (Section 12).
 */
@Composable
fun CuisineAndArtisansScreen(
    onBack: () -> Unit,
    onReportListingIssue: (listingId: String, title: String, note: String) -> Unit
) {
    BackHandler { onBack() }
    val context = LocalContext.current
    var selectedType by remember { mutableStateOf("All") }
    var reportingListing by remember { mutableStateOf<CulturalListing?>(null) }

    val types = listOf("All", "GI Craft", "Handloom", "Cuisine", "Sweet", "Eco-Camp", "Heritage Stay")
    val listings = remember(selectedType) {
        if (selectedType == "All") OdishaDistrictCatalog.culturalListings
        else OdishaDistrictCatalog.culturalListings.filter { it.type == selectedType }
    }

    reportingListing?.let { target ->
        var issueNote by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { reportingListing = null },
            containerColor = CharcoalElevated,
            title = { Text("Report Listing Update: ${target.title}", color = IvoryText) },
            text = {
                OutlinedTextField(
                    value = issueNote,
                    onValueChange = { issueNote = it },
                    label = { Text("Describe outdated price, address, or detail") },
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (issueNote.isNotBlank()) {
                            onReportListingIssue(target.id, target.title, issueNote)
                            reportingListing = null
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SaffronOrange, contentColor = ObsidianBlack)
                ) {
                    Text("Submit Correction", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = { TextButton(onClick = { reportingListing = null }) { Text("Cancel", color = IvoryMuted) } }
        )
    }

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        modifier = Modifier
            .fillMaxSize()
            .testTag("cuisine_artisans_screen")
    ) {
        item {
            Image(
                painter = painterResource(id = R.drawable.img_crafts_cuisine_1793266426716),
                contentDescription = "Odisha Pattachitra, Silver Filigree, Sambalpuri Ikat & Chhena Poda",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(175.dp)
                    .clip(RoundedCornerShape(20.dp))
            )
            Spacer(modifier = Modifier.height(10.dp))
            Text("Cuisine, GI Crafts & Authentic Stays", style = MaterialTheme.typography.headlineMedium, color = IvoryText)
            Text(
                text = "Verified Geographical Indication (GI) heritage clusters, state handloom cooperatives, and official OTDC / Eco-Tour Odisha portals.",
                style = MaterialTheme.typography.bodySmall,
                color = WarmGold
            )
            Spacer(modifier = Modifier.height(8.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(types) { t ->
                    FilterChip(
                        selected = selectedType == t,
                        onClick = { selectedType = t },
                        label = { Text(t, style = MaterialTheme.typography.labelSmall) }
                    )
                }
            }
        }

        items(listings, key = { it.id }) { item ->
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalSurface),
                border = BorderStroke(1.dp, CharcoalBorder),
                shape = RoundedCornerShape(18.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        VerificationBadgeChip(item.verificationLabel)
                        IconButton(onClick = { reportingListing = item }, modifier = Modifier.size(36.dp)) {
                            Icon(Icons.Filled.Flag, contentDescription = "Report listing issue", tint = IvoryMuted)
                        }
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(item.title, style = MaterialTheme.typography.titleLarge, color = IvoryText)
                    Text("${item.odiaTitle} • ${item.giTagStatus}", style = MaterialTheme.typography.labelMedium, color = WarmGold)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(item.description, style = MaterialTheme.typography.bodyMedium, color = IvoryMuted)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("Authentic Hub: ${item.authenticLocation}", style = MaterialTheme.typography.bodySmall, color = IvoryText)
                    Text("Price Guide: ${item.priceGuide}", style = MaterialTheme.typography.bodySmall, color = OdishaTeal)
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedButton(
                        onClick = {
                            runCatching {
                                context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(item.officialEnquiryUrl)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
                            }
                        },
                        border = BorderStroke(1.dp, SaffronOrange)
                    ) {
                        Text("Open Official Portal (${item.officialEnquiryUrl.removePrefix("https://")})", color = SaffronOrange, style = MaterialTheme.typography.labelMedium)
                    }
                }
            }
        }
    }
}

/**
 * Offline Travel Pack & User Profile Dashboard (Section 13).
 */
@Composable
fun OfflineAndProfileDashboardScreen(
    isStandaloneOfflineScreen: Boolean,
    travellerName: String,
    travellerEmail: String?,
    prefs: UserPrefsState,
    offlineDistricts: List<OfflineDistrictEntity>,
    savedTrips: List<SavedTripEntity>,
    allStories: List<StoryEntity>,
    trustedContacts: List<TrustedContactEntity>,
    onBack: () -> Unit,
    onSignOut: () -> Unit,
    onVoiceSelected: (String) -> Unit,
    onSpeedChanged: (Float) -> Unit,
    onToggleDistrictOffline: (String, Boolean) -> Unit,
    onNavigate: (AppScreen) -> Unit
) {
    if (isStandaloneOfflineScreen) {
        BackHandler { onBack() }
    }
    val offlineStories = remember(allStories) { allStories.filter { it.isOfflineSaved || it.cachedAudioPathEn != null || it.cachedAudioPathOdia != null } }
    val favStories = remember(allStories) { allStories.filter { it.isFavorite } }
    val offlineDistrictSet = remember(offlineDistricts) { offlineDistricts.map { it.districtId }.toSet() }

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        modifier = Modifier
            .fillMaxSize()
            .testTag("profile_offline_dashboard_screen")
    ) {
        item {
            Text(
                text = if (isStandaloneOfflineScreen) "Offline Travel Pack Manager" else "Traveller Dashboard & Voice Preferences",
                style = MaterialTheme.typography.headlineMedium,
                color = IvoryText
            )
            Text(
                text = "Cloud Firestore Sync + Local Room SQLite & DataStore — survives device switches & zero-network ghat zones.",
                style = MaterialTheme.typography.bodySmall,
                color = WarmGold
            )
        }

        if (!isStandaloneOfflineScreen) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = CharcoalElevated),
                    border = BorderStroke(1.dp, SaffronOrange.copy(alpha = 0.55f)),
                    shape = RoundedCornerShape(18.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = travellerName,
                                style = MaterialTheme.typography.titleLarge,
                                color = IvoryText,
                                fontWeight = FontWeight.Bold
                            )
                            if (!travellerEmail.isNullOrBlank()) {
                                Text(
                                    text = travellerEmail,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = IvoryMuted
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "✓ Google Account Authenticated • Cloud Firestore Active",
                                style = MaterialTheme.typography.labelSmall,
                                color = OdishaTeal
                            )
                        }
                        OutlinedButton(
                            onClick = onSignOut,
                            border = BorderStroke(1.dp, SosCrimson),
                            modifier = Modifier.testTag("sign_out_button")
                        ) {
                            Text("Sign Out", color = SosCrimson, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            item {
                val shareContext = LocalContext.current
                var customShareUrl by remember { mutableStateOf(getCustomShareLink(shareContext)) }
                Card(
                    colors = CardDefaults.cardColors(containerColor = CharcoalSurface),
                    border = BorderStroke(1.dp, VerifiedEmerald.copy(alpha = 0.6f)),
                    shape = RoundedCornerShape(18.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Share UtkalSarathi on WhatsApp",
                            style = MaterialTheme.typography.titleMedium,
                            color = VerifiedEmerald
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Optional: Paste your public Firebase Hosting URL (https://gen-lang-client-0544007391.web.app) or AI Studio Share link to attach it to all WhatsApp invites.",
                            style = MaterialTheme.typography.bodySmall,
                            color = IvoryMuted
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = customShareUrl,
                            onValueChange = {
                                customShareUrl = it
                                saveCustomShareLink(shareContext, it)
                            },
                            placeholder = { Text("https://utkalsarathi.vercel.app", color = IvoryMuted) },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Button(
                                onClick = {
                                    shareOnWhatsApp(
                                        shareContext,
                                        buildUtkalAppInviteText(prefs.language, customShareUrl.trim())
                                    )
                                },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = VerifiedEmerald,
                                    contentColor = ObsidianBlack
                                ),
                                modifier = Modifier
                                    .weight(1f)
                                    .height(48.dp)
                                    .testTag("profile_share_whatsapp_button")
                            ) {
                                Icon(Icons.Filled.Share, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Share on WhatsApp", fontWeight = FontWeight.Bold)
                            }
                            OutlinedButton(
                                onClick = {
                                    val invite = buildUtkalAppInviteText(prefs.language, customShareUrl.trim())
                                    copyToClipboardWithToast(shareContext, invite, showToast = true)
                                    shareViaSystemSheet(shareContext, invite)
                                },
                                border = BorderStroke(1.dp, WarmGold),
                                modifier = Modifier.height(48.dp)
                            ) {
                                Text("Copy / More", color = WarmGold)
                            }
                        }
                    }
                }
            }
        }

        // Offline vs Internet Matrix Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalSurface),
                border = BorderStroke(1.dp, OdishaTeal.copy(alpha = 0.5f)),
                shape = RoundedCornerShape(18.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Offline vs Live Connectivity Matrix", style = MaterialTheme.typography.titleMedium, color = OdishaTeal)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("✓ Available 100% Offline: All 30 district profiles, saved day-by-day itineraries (${savedTrips.size}), saved Katha transcripts (${offlineStories.size}), cached .wav voice narrations, emergency hospitals & SOS 112 dialer.", style = MaterialTheme.typography.bodySmall, color = IvoryText)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("⚡ Powered by Firebase AI Logic + Cloud Firestore: Live Google Search grounding, High Thinking (gemini-4-argon), Live bidirectional voice (gemini-3.8-live), neural TTS synthesis (gemini-3.8-flash-tts), and cross-device itinerary/contact sync.", style = MaterialTheme.typography.bodySmall, color = WarmGold)
                }
            }
        }

        // Deep-Voice Narrator Configuration
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalSurface),
                border = BorderStroke(1.dp, CharcoalBorder),
                shape = RoundedCornerShape(18.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Deep-Voice Narrator Settings (${UtkalVoiceNarrator.VOICE_PROFILES.size} Profiles)", style = MaterialTheme.typography.titleMedium, color = IvoryText)
                    Spacer(modifier = Modifier.height(8.dp))
                    UtkalVoiceNarrator.VOICE_PROFILES.forEach { profile ->
                        val chosen = prefs.preferredVoiceName == profile.id
                        FilterChip(
                            selected = chosen,
                            onClick = { onVoiceSelected(profile.id) },
                            label = { Text("${profile.displayName} — ${profile.subtitle}", style = MaterialTheme.typography.labelSmall) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = SaffronOrange.copy(alpha = 0.24f),
                                selectedLabelColor = WarmGold
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Narration Speed: ${"%.2f".format(prefs.speechSpeed)}x (Natural pitch preserved)", style = MaterialTheme.typography.labelMedium, color = WarmGold)
                    Slider(
                        value = prefs.speechSpeed,
                        onValueChange = onSpeedChanged,
                        valueRange = 0.75f..1.5f
                    )
                }
            }
        }

        // Quick Summary Counts
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalElevated),
                border = BorderStroke(1.dp, CharcoalBorder),
                shape = RoundedCornerShape(18.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Your Saved Odisha Vault", style = MaterialTheme.typography.titleMedium, color = IvoryText)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("• Saved Trips: ${savedTrips.size}  |  Favourite Stories: ${favStories.size}", style = MaterialTheme.typography.bodySmall, color = IvoryText)
                    Text("• Offline District Packs: ${offlineDistricts.size}  |  Trusted Contacts: ${trustedContacts.size}", style = MaterialTheme.typography.bodySmall, color = IvoryText)
                    if (prefs.recentSearches.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("• Recent Searches: ${prefs.recentSearches.joinToString(", ")}", style = MaterialTheme.typography.labelSmall, color = WarmGold)
                    }
                }
            }
        }

        // Offline District Pack Toggles
        item {
            Text("Pin Districts to Offline Travel Pack", style = MaterialTheme.typography.headlineSmall, color = IvoryText)
        }
        items(OdishaDistrictCatalog.allDistricts, key = { "pack_${it.id}" }) { dist ->
            val saved = offlineDistrictSet.contains(dist.id)
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalSurface),
                border = BorderStroke(1.dp, if (saved) WarmGold else CharcoalBorder),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.padding(12.dp)
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("${dist.nameEn} (${dist.nameOdia})", style = MaterialTheme.typography.titleSmall, color = IvoryText)
                        Text("Attractions + Emergency Directory", style = MaterialTheme.typography.labelSmall, color = IvoryMuted)
                    }
                    OutlinedButton(
                        onClick = { onToggleDistrictOffline(dist.id, saved) },
                        border = BorderStroke(1.dp, if (saved) OdishaTeal else SaffronOrange)
                    ) {
                        Icon(Icons.Filled.CloudDownload, contentDescription = null, tint = if (saved) OdishaTeal else SaffronOrange, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(if (saved) "Pinned" else "Pin Pack", color = if (saved) OdishaTeal else SaffronOrange)
                    }
                }
            }
        }
    }
}
