package com.example.ui.screens

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.speech.RecognizerIntent
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicOff
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.AlertDialog
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
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.example.data.ai.GeminiLiveSessionManager
import com.example.data.ai.GeminiServiceClient
import com.example.data.ai.LiveSessionUiState
import com.example.data.catalog.OdishaDistrictCatalog
import com.example.data.local.StoryEntity
import com.example.data.model.AppLanguage
import com.example.data.model.ChatMessage
import com.example.data.repository.KathaLibraryStats
import com.example.ui.components.VerificationBadgeChip
import com.example.ui.components.buildShareFooterLine
import com.example.ui.components.shareOnWhatsApp
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

@Composable
fun UtkalMitraAiScreen(
    contextDistrictId: String?,
    initialPrompt: String?,
    language: AppLanguage,
    preferredVoiceName: String,
    messages: List<ChatMessage>,
    isThinking: Boolean,
    liveState: LiveSessionUiState,
    liveManager: GeminiLiveSessionManager,
    onBack: () -> Unit,
    onSendQuestion: (query: String, districtId: String?, useHighThinking: Boolean, useSearchGrounding: Boolean, autoSpeak: Boolean) -> Unit,
    onSpeakMessage: (ChatMessage) -> Unit
) {
    BackHandler { onBack() }
    val context = LocalContext.current
    var selectedDistrictId by remember(contextDistrictId) { mutableStateOf(contextDistrictId) }
    var inputQuery by remember(initialPrompt) { mutableStateOf(initialPrompt.orEmpty()) }
    var useSearchGrounding by remember { mutableStateOf(true) }
    var useHighThinking by remember { mutableStateOf(false) }
    var autoSpeakReplies by remember { mutableStateOf(false) }
    var showLiveVoicePanel by remember { mutableStateOf(false) }

    val selectedDistrict = remember(selectedDistrictId) {
        selectedDistrictId?.let { OdishaDistrictCatalog.getDistrictById(it) }
    }

    // Speech-to-Text Launcher for conversational voice questions
    val speechLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { res ->
        if (res.resultCode == Activity.RESULT_OK) {
            val matches = res.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
            val recognized = matches?.firstOrNull().orEmpty()
            if (recognized.isNotBlank()) {
                inputQuery = recognized
            }
        }
    }

    // Runtime Audio Permission Launcher for Live API & Voice Input
    val audioPermLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted && showLiveVoicePanel && liveState.isConnected) {
            liveManager.startMicStreaming()
        }
    }

    LaunchedEffect(initialPrompt) {
        if (!initialPrompt.isNullOrBlank() && messages.size <= 1) {
            onSendQuestion(initialPrompt, selectedDistrictId, useHighThinking, useSearchGrounding, autoSpeakReplies)
            inputQuery = ""
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 14.dp, vertical = 8.dp)
            .testTag("utkal_mitra_ai_screen")
    ) {
        // AI Mode Controls Card: Search Grounding, High Thinking (gemini-4-argon), Live Voice (gemini-3.8-live)
        Card(
            colors = CardDefaults.cardColors(containerColor = CharcoalSurface),
            border = BorderStroke(1.dp, CharcoalBorder),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    FilterChip(
                        selected = useSearchGrounding && !useHighThinking,
                        onClick = {
                            useSearchGrounding = !useSearchGrounding
                            if (useSearchGrounding) useHighThinking = false
                        },
                        leadingIcon = { Icon(Icons.Filled.Public, contentDescription = null, modifier = Modifier.size(16.dp)) },
                        label = { Text("Search Grounding", style = MaterialTheme.typography.labelSmall) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = OdishaTeal.copy(alpha = 0.25f),
                            selectedLabelColor = OdishaTeal
                        ),
                        modifier = Modifier.testTag("toggle_search_grounding")
                    )

                    FilterChip(
                        selected = useHighThinking,
                        onClick = {
                            useHighThinking = !useHighThinking
                            if (useHighThinking) useSearchGrounding = false
                        },
                        leadingIcon = { Icon(Icons.Filled.Psychology, contentDescription = null, modifier = Modifier.size(16.dp)) },
                        label = { Text("High Thinking", style = MaterialTheme.typography.labelSmall) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = SaffronOrange.copy(alpha = 0.25f),
                            selectedLabelColor = WarmGold
                        ),
                        modifier = Modifier.testTag("toggle_high_thinking")
                    )

                    FilterChip(
                        selected = showLiveVoicePanel,
                        onClick = { showLiveVoicePanel = !showLiveVoicePanel },
                        leadingIcon = { Icon(Icons.Filled.GraphicEq, contentDescription = null, modifier = Modifier.size(16.dp)) },
                        label = { Text("Live Voice", style = MaterialTheme.typography.labelSmall) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = WarmGold.copy(alpha = 0.25f),
                            selectedLabelColor = WarmGold
                        ),
                        modifier = Modifier.testTag("toggle_live_voice_mode")
                    )
                }

                // District Context Selector Ribbon
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.padding(top = 6.dp)
                ) {
                    item {
                        FilterChip(
                            selected = selectedDistrictId == null,
                            onClick = { selectedDistrictId = null },
                            label = { Text("All 30 Districts", style = MaterialTheme.typography.labelSmall) }
                        )
                    }
                    items(OdishaDistrictCatalog.allDistricts, key = { it.id }) { dist ->
                        FilterChip(
                            selected = selectedDistrictId == dist.id,
                            onClick = { selectedDistrictId = if (selectedDistrictId == dist.id) null else dist.id },
                            label = { Text(dist.nameEn, style = MaterialTheme.typography.labelSmall) }
                        )
                    }
                }
            }
        }

        // Real-Time Gemini Live 3.8 Voice Conversation Panel
        if (showLiveVoicePanel) {
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalElevated),
                border = BorderStroke(1.dp, WarmGold),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(
                        text = "Utkal Mitra Live Voice (${GeminiServiceClient.MODEL_LIVE})",
                        style = MaterialTheme.typography.titleSmall,
                        color = WarmGold
                    )
                    Text(
                        text = liveState.statusMessage,
                        style = MaterialTheme.typography.bodySmall,
                        color = IvoryMuted
                    )
                    if (liveState.errorBanner != null) {
                        Text(
                            text = liveState.errorBanner,
                            style = MaterialTheme.typography.labelSmall,
                            color = LegendAmber,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        if (!liveState.isConnected) {
                            Button(
                                onClick = {
                                    liveManager.connect(language, preferredVoiceName, selectedDistrict?.nameEn)
                                },
                                enabled = !liveState.isConnecting,
                                colors = ButtonDefaults.buttonColors(containerColor = SaffronOrange, contentColor = ObsidianBlack)
                            ) {
                                Text(if (liveState.isConnecting) "Connecting…" else "Connect Live Session", fontWeight = FontWeight.Bold)
                            }
                        } else {
                            Button(
                                onClick = {
                                    if (liveState.isMicStreaming) {
                                        liveManager.stopMicStreaming()
                                    } else {
                                        val hasPerm = ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED
                                        if (hasPerm) {
                                            liveManager.startMicStreaming()
                                        } else {
                                            audioPermLauncher.launch(Manifest.permission.RECORD_AUDIO)
                                        }
                                    }
                                },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (liveState.isMicStreaming) SosCrimson else OdishaTeal,
                                    contentColor = IvoryText
                                )
                            ) {
                                Icon(
                                    imageVector = if (liveState.isMicStreaming) Icons.Filled.MicOff else Icons.Filled.Mic,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(if (liveState.isMicStreaming) "Mute Mic" else "Stream Mic")
                            }
                            OutlinedButton(onClick = { liveManager.disconnect() }) {
                                Text("End Live", color = IvoryMuted)
                            }
                        }
                    }
                    if (liveState.transcriptLog.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(6.dp))
                        liveState.transcriptLog.takeLast(3).forEach { (who, line) ->
                            Text("$who: $line", style = MaterialTheme.typography.bodySmall, color = IvoryText)
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Conversation Messages List
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
        ) {
            items(messages, key = { it.id }) { msg ->
                ChatBubbleCard(
                    message = msg,
                    onSpeak = { onSpeakMessage(msg) },
                    onSuggestedPromptClick = { prompt ->
                        onSendQuestion(prompt, selectedDistrictId, useHighThinking, useSearchGrounding, autoSpeakReplies)
                    }
                )
            }
            if (isThinking) {
                item {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(12.dp)
                    ) {
                        CircularProgressIndicator(color = SaffronOrange, strokeWidth = 2.dp, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = if (useHighThinking) "Reasoning deeply with ${GeminiServiceClient.MODEL_HIGH_THINKING} (ThinkingLevel.HIGH)…" else "Retrieving Odisha records & grounding with ${GeminiServiceClient.MODEL_SEARCH_FLASH}…",
                            style = MaterialTheme.typography.bodySmall,
                            color = WarmGold
                        )
                    }
                }
            }
        }

        // Auto-speak switch & Input Composer
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp)
        ) {
            Text(
                text = "Auto-narrate AI answers (${GeminiServiceClient.MODEL_TTS})",
                style = MaterialTheme.typography.labelSmall,
                color = IvoryMuted
            )
            Switch(checked = autoSpeakReplies, onCheckedChange = { autoSpeakReplies = it })
        }

        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            IconButton(
                onClick = {
                    val sttIntent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                        putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                        putExtra(RecognizerIntent.EXTRA_LANGUAGE, language.localeTag)
                        putExtra(RecognizerIntent.EXTRA_PROMPT, "Ask Utkal Mitra in ${language.label}")
                    }
                    runCatching { speechLauncher.launch(sttIntent) }
                },
                modifier = Modifier.size(48.dp)
            ) {
                Icon(Icons.Filled.Mic, contentDescription = "Voice Input", tint = WarmGold)
            }

            OutlinedTextField(
                value = inputQuery,
                onValueChange = { inputQuery = it },
                placeholder = {
                    Text(
                        text = if (selectedDistrict != null) "Ask about ${selectedDistrict.nameEn}…" else "Ask about any of Odisha's 30 districts…",
                        style = MaterialTheme.typography.bodySmall,
                        color = IvoryMuted
                    )
                },
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
                    .weight(1f)
                    .testTag("mitra_chat_input")
            )

            Button(
                onClick = {
                    if (inputQuery.isNotBlank()) {
                        if (showLiveVoicePanel && liveState.isConnected) {
                            liveManager.sendLiveTextTurn(inputQuery)
                        } else {
                            onSendQuestion(inputQuery, selectedDistrictId, useHighThinking, useSearchGrounding, autoSpeakReplies)
                        }
                        inputQuery = ""
                    }
                },
                enabled = !isThinking && inputQuery.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = SaffronOrange, contentColor = ObsidianBlack),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier
                    .height(52.dp)
                    .testTag("mitra_send_button")
            ) {
                Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Send")
            }
        }
    }
}

@Composable
private fun ChatBubbleCard(
    message: ChatMessage,
    onSpeak: () -> Unit,
    onSuggestedPromptClick: (String) -> Unit
) {
    val context = LocalContext.current
    Card(
        colors = CardDefaults.cardColors(
            containerColor = if (message.isUser) SaffronOrange.copy(alpha = 0.18f) else CharcoalSurface
        ),
        border = BorderStroke(1.dp, if (message.isUser) SaffronOrange.copy(alpha = 0.5f) else CharcoalBorder),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            if (!message.isUser) {
                Row(
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "UTKAL MITRA • ${message.modeLabel}",
                        style = MaterialTheme.typography.labelSmall,
                        color = WarmGold
                    )
                    Row {
                        IconButton(
                            onClick = {
                                val waAnswer = """
                                    🤖 *Utkal Mitra AI (${message.modeLabel})*
                                    ${message.text}
                                    ${buildShareFooterLine(context)}
                                """.trimIndent()
                                shareOnWhatsApp(context, waAnswer)
                            },
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(Icons.Filled.Share, contentDescription = "Share AI answer on WhatsApp", tint = VerifiedEmerald)
                        }
                        IconButton(onClick = onSpeak, modifier = Modifier.size(36.dp)) {
                            Icon(Icons.AutoMirrored.Filled.VolumeUp, contentDescription = "Listen to answer", tint = SaffronOrange)
                        }
                    }
                }
                VerificationBadgeChip(message.reliabilityBadge)
                Spacer(modifier = Modifier.height(8.dp))
            } else {
                Text(
                    text = "You${message.districtContext?.let { " • $it" }.orEmpty()}",
                    style = MaterialTheme.typography.labelSmall,
                    color = SaffronOrange
                )
                Spacer(modifier = Modifier.height(4.dp))
            }

            Text(
                text = message.text,
                style = MaterialTheme.typography.bodyMedium,
                color = IvoryText
            )

            if (message.sourceCitations.isNotEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text("Sources & Grounding Links:", style = MaterialTheme.typography.labelSmall, color = OdishaTeal)
                message.sourceCitations.forEach { (title, url) ->
                    Text(
                        text = "↗ $title",
                        style = MaterialTheme.typography.labelSmall,
                        color = WarmGold,
                        modifier = Modifier
                            .clickable {
                                runCatching {
                                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
                                }
                            }
                            .padding(vertical = 2.dp)
                    )
                }
            }

            if (message.suggestedFollowUps.isNotEmpty()) {
                Spacer(modifier = Modifier.height(10.dp))
                message.suggestedFollowUps.forEach { followUp ->
                    Surface(
                        color = CharcoalElevated,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 3.dp)
                            .clickable { onSuggestedPromptClick(followUp) }
                    ) {
                        Text(
                            text = "→ $followUp",
                            style = MaterialTheme.typography.bodySmall,
                            color = IvoryMuted,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 7.dp)
                        )
                    }
                }
            }
        }
    }
}

/**
 * Utkal Katha Scalable 10,000+ Story Platform UI with transparent actual story counts,
 * deduplication guarantees, category/district filters, AI story expansion, and JSON batch importer.
 */
@Composable
fun UtkalKathaLibraryScreen(
    initialDistrictFilter: String?,
    language: AppLanguage,
    stories: List<StoryEntity>,
    stats: KathaLibraryStats,
    onBack: () -> Unit,
    onPlayStory: (StoryEntity) -> Unit,
    onToggleFavorite: (StoryEntity) -> Unit,
    onToggleOffline: (StoryEntity) -> Unit,
    onGenerateAiBatchForDistrict: (String) -> Unit,
    onImportBatchJson: (String) -> Unit
) {
    BackHandler { onBack() }
    val context = LocalContext.current
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("All") }
    var selectedDistrictId by remember(initialDistrictFilter) { mutableStateOf(initialDistrictFilter) }
    var showBatchImportDialog by remember { mutableStateOf(false) }

    val categories = listOf("All", "Sacred Architecture", "Ancient Kingdoms", "Archaeology", "Freedom Movement", "Tribal Heritage", "Folk Legend", "Nature & Eco", "Crafts & Cuisine")

    val filteredStories = remember(stories, searchQuery, selectedCategory, selectedDistrictId) {
        val q = searchQuery.trim().lowercase()
        stories.filter { s ->
            val matchesDistrict = selectedDistrictId == null || s.districtId == selectedDistrictId
            val matchesCategory = selectedCategory == "All" || s.category.equals(selectedCategory, ignoreCase = true)
            val matchesSearch = q.isEmpty() ||
                s.titleEn.lowercase().contains(q) ||
                s.titleOdia.contains(q) ||
                s.destinationName.lowercase().contains(q) ||
                s.bodyEn.lowercase().contains(q)
            matchesDistrict && matchesCategory && matchesSearch
        }
    }

    if (showBatchImportDialog) {
        BatchStoryImportDialog(
            onDismiss = { showBatchImportDialog = false },
            onImportJson = { payload ->
                onImportBatchJson(payload)
                showBatchImportDialog = false
            }
        )
    }

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier
            .fillMaxSize()
            .testTag("utkal_katha_library_screen")
    ) {
        // Honest Transparent Story Count Telemetry Card (Master Prompt Section 6)
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalSurface),
                border = BorderStroke(1.dp, WarmGold.copy(alpha = 0.45f)),
                shape = RoundedCornerShape(18.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Utkal Katha • Scalable Heritage Story Engine",
                        style = MaterialTheme.typography.headlineSmall,
                        color = IvoryText
                    )
                    Text(
                        text = "Indexed SQLite + SHA-256 & Jaccard Near-Duplicate Guard (Ready for 10,000+ distinct records; translations stored inside canonical IDs, never double-counted).",
                        style = MaterialTheme.typography.bodySmall,
                        color = IvoryMuted
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        StatMetricPill("Distinct", "${stats.totalDistinctStories}")
                        StatMetricPill("Reviewed", "${stats.curatedReviewedCount}")
                        StatMetricPill("AI Grounded", "${stats.aiSourceGroundedCount}")
                        StatMetricPill("Multilingual", "${stats.multilingualTranslatedCount}")
                        StatMetricPill("Audio Cached", "${stats.offlineAudioCachedCount}")
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = {
                                val target = selectedDistrictId ?: OdishaDistrictCatalog.allDistricts.random().id
                                onGenerateAiBatchForDistrict(target)
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = SaffronOrange, contentColor = ObsidianBlack),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Filled.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("AI Generate Stories", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                        }
                        OutlinedButton(
                            onClick = { showBatchImportDialog = true },
                            border = BorderStroke(1.dp, OdishaTeal),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Batch JSON Import", color = OdishaTeal, style = MaterialTheme.typography.labelMedium)
                        }
                    }
                }
            }
        }

        // Search & Filters
        item {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search stories by temple, ruler, freedom fighter, craft…", color = IvoryMuted) },
                leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null, tint = WarmGold) },
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
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(8.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(categories) { cat ->
                    FilterChip(
                        selected = selectedCategory == cat,
                        onClick = { selectedCategory = cat },
                        label = { Text(cat, style = MaterialTheme.typography.labelSmall) }
                    )
                }
            }
        }

        items(filteredStories, key = { it.id }) { story ->
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalSurface),
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
                        VerificationBadgeChip(story.factClassification)
                        Row {
                            IconButton(onClick = { onToggleFavorite(story) }) {
                                Icon(
                                    imageVector = if (story.isFavorite) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                                    contentDescription = "Favourite",
                                    tint = if (story.isFavorite) SaffronOrange else IvoryMuted
                                )
                            }
                            IconButton(onClick = { onToggleOffline(story) }) {
                                Icon(
                                    imageVector = if (story.isOfflineSaved) Icons.Filled.Bookmark else Icons.Filled.BookmarkBorder,
                                    contentDescription = "Offline Pack",
                                    tint = if (story.isOfflineSaved) WarmGold else IvoryMuted
                                )
                            }
                        }
                    }
                    Text(
                        text = when (language) {
                            AppLanguage.ODIA -> story.titleOdia.ifBlank { story.titleEn }
                            AppLanguage.HINDI -> story.titleHindi.ifBlank { story.titleEn }
                            AppLanguage.ENGLISH -> story.titleEn
                        },
                        style = MaterialTheme.typography.titleMedium,
                        color = IvoryText
                    )
                    Text(
                        text = "ID: ${story.id} • ${story.destinationName} (${story.districtId.uppercase()}) • ${story.editorialStatus}",
                        style = MaterialTheme.typography.labelSmall,
                        color = WarmGold
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = when (language) {
                            AppLanguage.ODIA -> story.bodyOdia.ifBlank { story.bodyEn }
                            AppLanguage.HINDI -> story.bodyHindi.ifBlank { story.bodyEn }
                            AppLanguage.ENGLISH -> story.bodyEn
                        },
                        style = MaterialTheme.typography.bodySmall,
                        color = IvoryMuted
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("Sources: ${story.sourceReferences}", style = MaterialTheme.typography.labelSmall, color = OdishaTeal)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = { onPlayStory(story) },
                            colors = ButtonDefaults.buttonColors(containerColor = SaffronOrange, contentColor = ObsidianBlack),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.AutoMirrored.Filled.VolumeUp, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Listen (~${story.estimatedDurationSec / 60}m) in ${language.label}", fontWeight = FontWeight.Bold)
                        }
                        OutlinedButton(
                            onClick = {
                                val title = when (language) {
                                    AppLanguage.ODIA -> story.titleOdia.ifBlank { story.titleEn }
                                    AppLanguage.HINDI -> story.titleHindi.ifBlank { story.titleEn }
                                    AppLanguage.ENGLISH -> story.titleEn
                                }
                                val body = when (language) {
                                    AppLanguage.ODIA -> story.bodyOdia.ifBlank { story.bodyEn }
                                    AppLanguage.HINDI -> story.bodyHindi.ifBlank { story.bodyEn }
                                    AppLanguage.ENGLISH -> story.bodyEn
                                }
                                val storyShare = """
                                    📜 *Utkal Katha: $title*
                                    📍 ${story.destinationName} (${story.districtId.uppercase()} District) • ${story.factClassification}
                                    
                                    $body
                                    
                                    📚 Source: ${story.sourceReferences}
                                    ${buildShareFooterLine(context)}
                                """.trimIndent()
                                shareOnWhatsApp(context, storyShare)
                            },
                            border = BorderStroke(1.dp, VerifiedEmerald)
                        ) {
                            Icon(Icons.Filled.Share, contentDescription = "Share story on WhatsApp", tint = VerifiedEmerald, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("WhatsApp", color = VerifiedEmerald)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun StatMetricPill(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, style = MaterialTheme.typography.titleMedium, color = SaffronOrange, fontWeight = FontWeight.Bold)
        Text(label, style = MaterialTheme.typography.labelSmall, color = IvoryMuted)
    }
}

@Composable
private fun BatchStoryImportDialog(
    onDismiss: () -> Unit,
    onImportJson: (String) -> Unit
) {
    val samplePayload = """
[
  {
    "titleEn": "Chausathi Yogini Hypaethral Geometry of Hirapur",
    "titleOdia": "ହୀରାପୁର ଚଉଷଠି ଯୋଗିନୀ ମନ୍ଦିରର ସ୍ଥାପତ୍ୟ",
    "districtId": "khordha",
    "destinationName": "Hirapur Yogini Shrine",
    "category": "Sacred Architecture",
    "factClassification": "Archaeological & Epigraphic Evidence",
    "bodyEn": "Built by Bhaumakara Queen Hiradevi in the 9th century CE, the circular roofless sandstone enclosure at Hirapur houses 64 carved chlorite Yogini icons surrounding a central Chandi Mandapa.",
    "sourceReferences": "ASI Bhubaneswar Circle & K.N. Mahapatra Monograph"
  }
]
    """.trimIndent()
    var jsonText by remember { mutableStateOf(samplePayload) }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = CharcoalElevated,
        title = { Text("Scalable Batch Story JSON Importer", color = IvoryText) },
        text = {
            Column {
                Text(
                    text = "Paste a JSON array of story records. Duplicate & near-duplicate records (>80% Jaccard overlap or matching SHA-256 content hash) are automatically rejected.",
                    style = MaterialTheme.typography.bodySmall,
                    color = IvoryMuted
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = jsonText,
                    onValueChange = { jsonText = it },
                    minLines = 6,
                    maxLines = 10,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onImportJson(jsonText) },
                colors = ButtonDefaults.buttonColors(containerColor = SaffronOrange, contentColor = ObsidianBlack)
            ) {
                Text("Validate & Import", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = IvoryMuted)
            }
        }
    )
}
