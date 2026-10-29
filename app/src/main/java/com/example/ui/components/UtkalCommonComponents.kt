package com.example.ui.components

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Replay
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.example.R
import com.example.data.model.AppLanguage
import com.example.data.voice.NarrationUiState
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

import android.content.ClipData
import android.content.ClipboardManager
import android.widget.Toast
import androidx.compose.material.icons.filled.Share

private const val SHARE_LINK_PREFS = "utkal_share_prefs"
private const val KEY_CUSTOM_SHARE_URL = "custom_public_url"

fun getCustomShareLink(context: Context): String {
    return context.getSharedPreferences(SHARE_LINK_PREFS, Context.MODE_PRIVATE)
        .getString(KEY_CUSTOM_SHARE_URL, "")
        ?.trim()
        .orEmpty()
}

fun saveCustomShareLink(context: Context, url: String) {
    context.getSharedPreferences(SHARE_LINK_PREFS, Context.MODE_PRIVATE)
        .edit()
        .putString(KEY_CUSTOM_SHARE_URL, url.trim())
        .apply()
}

fun buildShareFooterLine(context: Context): String {
    val custom = getCustomShareLink(context)
    return if (custom.isNotBlank()) {
        "🔗 Explore on UtkalSarathi: $custom"
    } else {
        "✨ Shared via *UtkalSarathi — Discover Odisha, Your Way.*"
    }
}

fun buildUtkalAppInviteText(
    language: AppLanguage = AppLanguage.ENGLISH,
    customUrl: String = ""
): String {
    val linkLine = if (customUrl.isNotBlank()) "\n🔗 $customUrl" else ""
    return when (language) {
        AppLanguage.ODIA -> """
            ✨ *ଉତ୍କଳ ସାରଥୀ (UtkalSarathi) — ଓଡ଼ିଶା ସ୍ମାର୍ଟ ପର୍ଯ୍ୟଟନ ଓ ସୁରକ୍ଷା*
            ଓଡ଼ିଶାର ୩୦ଟି ଜିଲ୍ଲା, ଉତ୍କଳ ମିତ୍ର AI, ଉତ୍କଳ କଥା ଅଡିଓ କାହାଣୀ, ଯାତ୍ରା ଯୋଜନା ଏବଂ SOS 112 ସୁରକ୍ଷା ଆପ୍।$linkLine
        """.trimIndent()
        AppLanguage.HINDI -> """
            ✨ *UtkalSarathi (उत्कल सारथी) — ओडिशा स्मार्ट पर्यटन और सुरक्षा*
            ओडिशा के सभी 30 जिले, Utkal Mitra AI, Utkal Katha वॉइस कहानियाँ, यात्रा प्लानर और SOS 112 सुरक्षा ऐप।$linkLine
        """.trimIndent()
        AppLanguage.ENGLISH -> """
            ✨ *UtkalSarathi — Smart Tourism & Safety for Odisha*
            Discover all 30 districts of Odisha with Utkal Mitra AI, deep-voice Utkal Katha stories, deterministic trip budgets, fair transit estimates & SOS 112 traveller safety.$linkLine
        """.trimIndent()
    }
}

/**
 * Shares text directly to WhatsApp / WhatsApp Business if installed, or via `wa.me` deep link
 * (including optional direct phone number targeting), with graceful fallback to the Android Share Sheet.
 */
fun shareOnWhatsApp(
    context: Context,
    message: String,
    phoneNumber: String? = null
) {
    val pm = context.packageManager
    val whatsAppPackages = listOf("com.whatsapp", "com.whatsapp.w4b")

    if (!phoneNumber.isNullOrBlank()) {
        val digits = phoneNumber.filter { it.isDigit() }.let { raw ->
            if (raw.length == 10) "91$raw" else raw
        }
        if (digits.isNotEmpty()) {
            val waUri = Uri.parse("https://api.whatsapp.com/send?phone=$digits&text=${Uri.encode(message)}")
            for (pkg in whatsAppPackages) {
                val directChatIntent = Intent(Intent.ACTION_VIEW, waUri).apply {
                    setPackage(pkg)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                if (directChatIntent.resolveActivity(pm) != null) {
                    runCatching {
                        context.startActivity(directChatIntent)
                        return
                    }
                }
            }
            val webWaIntent = Intent(Intent.ACTION_VIEW, waUri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            if (webWaIntent.resolveActivity(pm) != null) {
                runCatching {
                    context.startActivity(webWaIntent)
                    return
                }
            }
        }
    }

    for (pkg in whatsAppPackages) {
        val sendIntent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            setPackage(pkg)
            putExtra(Intent.EXTRA_TEXT, message)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        if (sendIntent.resolveActivity(pm) != null) {
            runCatching {
                context.startActivity(sendIntent)
                return
            }
        }
    }

    // Fallback when WhatsApp APK is not installed (e.g., streaming browser emulator):
    // open system chooser and also copy to clipboard for instant pasting into WhatsApp Web.
    copyToClipboardWithToast(context, message, showToast = false)
    val waWebUri = Uri.parse("https://wa.me/?text=${Uri.encode(message)}")
    val waWebIntent = Intent(Intent.ACTION_VIEW, waWebUri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    if (waWebIntent.resolveActivity(pm) != null) {
        runCatching {
            context.startActivity(waWebIntent)
            return
        }
    }
    shareViaSystemSheet(context, message, "Share via WhatsApp or Apps")
}

fun shareViaSystemSheet(context: Context, message: String, chooserTitle: String = "Share UtkalSarathi") {
    copyToClipboardWithToast(context, message, showToast = false)
    val send = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_TEXT, message)
    }
    val chooser = Intent.createChooser(send, chooserTitle).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    runCatching { context.startActivity(chooser) }
}

fun copyToClipboardWithToast(context: Context, text: String, showToast: Boolean = true) {
    runCatching {
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
        clipboard?.setPrimaryClip(ClipData.newPlainText("UtkalSarathi Share", text))
        if (showToast) {
            Toast.makeText(context, "Share link copied to clipboard!", Toast.LENGTH_SHORT).show()
        }
    }
}

fun launchEmergencyDial112(context: Context) {
    val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:112")).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    runCatching { context.startActivity(intent) }
}

fun launchGeoMapsUri(context: Context, lat: Double, lon: Double, label: String) {
    val encoded = Uri.encode(label)
    val uri = Uri.parse("geo:$lat,$lon?q=$lat,$lon($encoded)")
    val intent = Intent(Intent.ACTION_VIEW, uri).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    if (intent.resolveActivity(context.packageManager) != null) {
        context.startActivity(intent)
    } else {
        val webUri = Uri.parse("https://www.google.com/maps/search/?api=1&query=$lat,$lon")
        runCatching {
            context.startActivity(Intent(Intent.ACTION_VIEW, webUri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        }
    }
}

@Composable
fun UtkalTopHeader(
    selectedLanguage: AppLanguage,
    onLanguageSelected: (AppLanguage) -> Unit,
    showBackButton: Boolean = false,
    titleOverride: String? = null,
    onBackClick: () -> Unit = {}
) {
    val context = LocalContext.current
    Surface(
        color = ObsidianBlack.copy(alpha = 0.96f),
        tonalElevation = 4.dp,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 10.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    if (showBackButton) {
                        IconButton(
                            onClick = onBackClick,
                            modifier = Modifier
                                .size(48.dp)
                                .testTag("back_nav_button")
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = stringResource(R.string.content_desc_back),
                                tint = WarmGold
                            )
                        }
                    } else {
                        Image(
                            painter = painterResource(id = R.drawable.img_app_logo_emblem_1793266422316),
                            contentDescription = stringResource(R.string.content_desc_logo),
                            contentScale = ContentScale.Crop,
                            modifier = Modifier
                                .size(42.dp)
                                .clip(CircleShape)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                    }
                    Column {
                        Text(
                            text = titleOverride ?: stringResource(R.string.app_name),
                            style = MaterialTheme.typography.headlineSmall,
                            color = IvoryText,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = stringResource(R.string.app_tagline),
                            style = MaterialTheme.typography.labelSmall,
                            color = WarmGold
                        )
                    }
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    IconButton(
                        onClick = {
                            shareOnWhatsApp(
                                context,
                                buildUtkalAppInviteText(selectedLanguage, getCustomShareLink(context))
                            )
                        },
                        modifier = Modifier
                            .size(48.dp)
                            .testTag("header_whatsapp_share_button")
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Share,
                            contentDescription = stringResource(R.string.content_desc_share_whatsapp),
                            tint = VerifiedEmerald
                        )
                    }

                    // SOS 112 Emergency Shortcut Button (>= 48dp accessible touch target)
                    Button(
                        onClick = { launchEmergencyDial112(context) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = SosCrimson,
                            contentColor = Color.White
                        ),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier
                            .defaultMinSize(minWidth = 88.dp, minHeight = 48.dp)
                            .testTag("sos_112_header_button")
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Call,
                            contentDescription = stringResource(R.string.content_desc_sos),
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = stringResource(R.string.sos_label),
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Compact English / Odia / Hindi Language Switcher Bar
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                AppLanguage.entries.forEach { lang ->
                    val isSelected = selectedLanguage == lang
                    FilterChip(
                        selected = isSelected,
                        onClick = { onLanguageSelected(lang) },
                        label = {
                            Text(
                                text = "${lang.nativeLabel} (${lang.code.uppercase()})",
                                style = MaterialTheme.typography.labelMedium
                            )
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = SaffronOrange.copy(alpha = 0.22f),
                            selectedLabelColor = WarmGold,
                            containerColor = CharcoalSurface,
                            labelColor = IvoryMuted
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            enabled = true,
                            selected = isSelected,
                            borderColor = CharcoalBorder,
                            selectedBorderColor = SaffronOrange
                        ),
                        modifier = Modifier.testTag("lang_chip_${lang.code}")
                    )
                }
            }
        }
    }
}

@Composable
fun FloatingNarrationBar(
    state: NarrationUiState,
    onPause: () -> Unit,
    onResume: () -> Unit,
    onReplay: () -> Unit,
    onStop: () -> Unit,
    onCycleSpeed: () -> Unit
) {
    val visible = state.isSynthesizing || state.isPlaying || state.isPaused || state.errorNote != null
    var showTranscriptExpanded by remember { mutableStateOf(false) }

    AnimatedVisibility(visible = visible) {
        Card(
            colors = CardDefaults.cardColors(containerColor = CharcoalElevated),
            border = BorderStroke(1.dp, WarmGold.copy(alpha = 0.55f)),
            shape = RoundedCornerShape(18.dp),
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 6.dp)
                .testTag("floating_narration_bar")
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .weight(1f)
                            .clickable { showTranscriptExpanded = !showTranscriptExpanded }
                    ) {
                        if (state.isSynthesizing) {
                            CircularProgressIndicator(
                                color = SaffronOrange,
                                strokeWidth = 2.dp,
                                modifier = Modifier.size(22.dp)
                            )
                        } else {
                            Icon(
                                imageVector = if (state.isPlaying) Icons.Filled.GraphicEq else Icons.AutoMirrored.Filled.VolumeUp,
                                contentDescription = "Voice Narrator Status",
                                tint = SaffronOrange,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = state.activeTitle.ifBlank { "Utkal Deep-Voice Narrator" },
                                style = MaterialTheme.typography.titleSmall,
                                color = IvoryText,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Text(
                                text = "${state.activeEngineLabel} • ${state.playbackSpeed}x • Tap for transcript",
                                style = MaterialTheme.typography.labelSmall,
                                color = WarmGold,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            color = CharcoalSurface,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .clickable { onCycleSpeed() }
                                .padding(end = 4.dp)
                        ) {
                            Text(
                                text = "${state.playbackSpeed}x",
                                style = MaterialTheme.typography.labelMedium,
                                color = OdishaTeal,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                            )
                        }
                        if (state.isPlaying) {
                            IconButton(onClick = onPause, modifier = Modifier.size(44.dp)) {
                                Icon(Icons.Filled.Pause, contentDescription = "Pause narration", tint = IvoryText)
                            }
                        } else if (state.isPaused) {
                            IconButton(onClick = onResume, modifier = Modifier.size(44.dp)) {
                                Icon(Icons.Filled.PlayArrow, contentDescription = "Resume narration", tint = SaffronOrange)
                            }
                        }
                        IconButton(onClick = onReplay, modifier = Modifier.size(44.dp)) {
                            Icon(Icons.Filled.Replay, contentDescription = "Replay narration", tint = WarmGold)
                        }
                        IconButton(onClick = onStop, modifier = Modifier.size(44.dp)) {
                            Icon(Icons.Filled.Close, contentDescription = "Close narrator", tint = IvoryMuted)
                        }
                    }
                }

                if (state.errorNote != null) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = state.errorNote,
                        style = MaterialTheme.typography.bodySmall,
                        color = LegendAmber
                    )
                }

                if (showTranscriptExpanded && state.activeTranscript.isNotBlank()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Surface(
                        color = ObsidianBlack.copy(alpha = 0.7f),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = state.activeTranscript,
                            style = MaterialTheme.typography.bodySmall,
                            color = IvoryText,
                            modifier = Modifier.padding(10.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun VerificationBadgeChip(label: String) {
    val isLegend = label.contains("Legend", ignoreCase = true) || label.contains("Unverified", ignoreCase = true) || label.contains("Pending", ignoreCase = true)
    val badgeColor = if (isLegend) LegendAmber else VerifiedEmerald
    Surface(
        color = badgeColor.copy(alpha = 0.15f),
        border = BorderStroke(1.dp, badgeColor.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(8.dp)
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = badgeColor,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}

@Composable
fun OnboardingOverlayScreen(onContinue: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(ObsidianBlack)
            .testTag("onboarding_screen")
    ) {
        Image(
            painter = painterResource(id = R.drawable.img_hero_puri_konark_1793266424187),
            contentDescription = "Konark Sun Chariot & Odisha Coastline",
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            ObsidianBlack.copy(alpha = 0.55f),
                            ObsidianBlack.copy(alpha = 0.85f),
                            ObsidianBlack
                        )
                    )
                )
        )

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Bottom,
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
        ) {
            Image(
                painter = painterResource(id = R.drawable.img_app_logo_emblem_1793266422316),
                contentDescription = "UtkalSarathi Emblem",
                modifier = Modifier
                    .size(96.dp)
                    .clip(CircleShape)
            )
            Spacer(modifier = Modifier.height(18.dp))
            Text(
                text = "UtkalSarathi",
                style = MaterialTheme.typography.displayLarge,
                color = IvoryText
            )
            Text(
                text = "Discover Odisha, Your Way • ଉତ୍କଳ ସାରଥୀ",
                style = MaterialTheme.typography.titleMedium,
                color = WarmGold
            )
            Spacer(modifier = Modifier.height(14.dp))
            Text(
                text = "Explore all 30 districts of Odisha with source-grounded Utkal Mitra AI, multilingual deep-voice Utkal Katha heritage audio, deterministic trip planning, fair transit estimates, and SOS 112 UtkalSuraksha traveller safety.",
                style = MaterialTheme.typography.bodyLarge,
                color = IvoryMuted
            )
            Spacer(modifier = Modifier.height(24.dp))
            Button(
                onClick = onContinue,
                colors = ButtonDefaults.buttonColors(
                    containerColor = SaffronOrange,
                    contentColor = ObsidianBlack
                ),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp)
                    .testTag("enter_utkalsarathi_button")
            ) {
                Text(
                    text = "Begin Exploring All 30 Districts",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
