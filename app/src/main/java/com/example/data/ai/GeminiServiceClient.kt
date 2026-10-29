package com.example.data.ai

import android.util.Log
import com.example.data.catalog.OdishaDistrictCatalog
import com.example.data.model.AppLanguage
import com.example.data.model.DistrictRecord
import com.google.firebase.Firebase
import com.google.firebase.ai.ai
import com.google.firebase.ai.type.Content
import com.google.firebase.ai.type.GenerativeBackend
import com.google.firebase.ai.type.InlineDataPart
import com.google.firebase.ai.type.PublicPreviewAPI
import com.google.firebase.ai.type.ResponseModality
import com.google.firebase.ai.type.Schema
import com.google.firebase.ai.type.SpeechConfig
import com.google.firebase.ai.type.ThinkingLevel
import com.google.firebase.ai.type.Tool
import com.google.firebase.ai.type.Voice
import com.google.firebase.ai.type.content
import com.google.firebase.ai.type.generationConfig
import com.google.firebase.ai.type.thinkingConfig
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import org.json.JSONArray
import java.io.File
import java.io.FileOutputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder

data class AiKnowledgeResult(
    val text: String,
    val modeLabel: String,
    val reliabilityBadge: String,
    val citations: List<Pair<String, String>>,
    val suggestedFollowUps: List<String>,
    val usedLiveApi: Boolean
)

data class GeneratedStoryDraft(
    val titleEn: String,
    val titleOdia: String,
    val titleHindi: String,
    val category: String,
    val historicalPeriod: String,
    val factClassification: String,
    val bodyEn: String,
    val bodyOdia: String,
    val bodyHindi: String,
    val sourceReferences: String
)

/**
 * Firebase AI Logic client (`Firebase.ai`) backed by Firebase App Check.
 * Does NOT require or embed any client-side `GEMINI_API_KEY`.
 */
class GeminiServiceClient {
    companion object {
        private const val TAG = "GeminiServiceClient"
        private const val AI_TIMEOUT_MS = 60_000L

        const val MODEL_SEARCH_FLASH = "gemini-3.8-flash"
        const val MODEL_SEARCH_FALLBACK = "gemini-2.5-flash"
        const val MODEL_HIGH_THINKING = "gemini-4-argon"
        const val MODEL_TTS = "gemini-3.8-flash-tts"
        const val MODEL_TTS_FALLBACK = "gemini-3.1-flash-tts-preview"
        const val MODEL_LIVE = "gemini-3.8-live"
    }

    private val aiService by lazy {
        Firebase.ai(backend = GenerativeBackend.googleAI())
    }

    private val storyBatchSchema by lazy {
        Schema.array(
            Schema.obj(
                mapOf(
                    "titleEn" to Schema.string("English title of the Odisha heritage story"),
                    "titleOdia" to Schema.string("Odia script title"),
                    "titleHindi" to Schema.string("Hindi Devanagari title"),
                    "category" to Schema.string("Category such as Sacred Architecture, Maritime History, GI Craft, Eco-Heritage"),
                    "historicalPeriod" to Schema.string("Documented historical era or dynasty"),
                    "factClassification" to Schema.enumeration(
                        listOf(
                            "Documented Historical Record",
                            "Archaeological & Epigraphic Evidence",
                            "Traditional Oral Legend & Folklore"
                        ),
                        "Epistemic classification"
                    ),
                    "bodyEn" to Schema.string("Detailed source-grounded English narrative (80-220 words)"),
                    "bodyOdia" to Schema.string("Odia narrative translation"),
                    "bodyHindi" to Schema.string("Hindi narrative translation"),
                    "sourceReferences" to Schema.string("Historical, ASI, museum, or district gazetteer citation")
                )
            )
        )
    }

    fun isFirebaseAiProvisioned(): Boolean = true

    /**
     * Answers natural-language questions about all 30 districts of Odisha via Firebase AI Logic:
     * - `gemini-4-argon` with `ThinkingLevel.HIGH` (and NO `maxOutputTokens`) when `useHighThinking = true`
     * - `gemini-3.8-flash` with `Tool.googleSearch()` grounding when `useSearchGrounding = true`
     * - Curated OdishaDistrictCatalog RAG context + graceful offline fallback on network unavailability.
     */
    suspend fun askUtkalMitra(
        userQuery: String,
        selectedDistrict: DistrictRecord?,
        language: AppLanguage,
        conversationHistory: List<Pair<Boolean, String>>,
        useHighThinking: Boolean,
        useSearchGrounding: Boolean
    ): AiKnowledgeResult = withContext(Dispatchers.IO) {
        val retrievedContext = buildRetrievedOdishaContext(userQuery, selectedDistrict)
        val systemPrompt = """
            You are Utkal Mitra AI, the authoritative, culturally respectful multilingual tourism, history, and safety scholar for all 30 districts of Odisha inside UtkalSarathi.
            Respond in ${language.label} (${language.nativeLabel}).
            CRITICAL EPISTEMIC RULES:
            1. Clearly distinguish between: [Established Historical Fact], [Archaeological/Epigraphic Evidence], [Traditional Legend/Folklore], and [Estimated Practical Guidance].
            2. Never invent non-existent temples, entry fees, live train timings, or emergency phone numbers. Always mention 112 for emergency police/medical dispatch in Odisha.
            3. Use the curated Odisha reference context below alongside verified knowledge:
            $retrievedContext
        """.trimIndent()

        val historyContents: List<Content> = buildList {
            conversationHistory.takeLast(6).forEach { (isUser, msgText) ->
                add(
                    content(role = if (isUser) "user" else "model") {
                        text(msgText)
                    }
                )
            }
            add(
                content(role = "user") {
                    text(userQuery)
                }
            )
        }

        val primaryModelName = if (useHighThinking) MODEL_HIGH_THINKING else MODEL_SEARCH_FLASH

        try {
            val response = withTimeout(AI_TIMEOUT_MS) {
                val model = buildMitraGenerativeModel(
                    modelName = primaryModelName,
                    systemPrompt = systemPrompt,
                    useHighThinking = useHighThinking,
                    useSearchGrounding = useSearchGrounding
                )
                model.generateContent(historyContents)
            }

            val answerText = response.text?.trim().orEmpty()
            if (answerText.isBlank()) {
                return@withContext buildCuratedOfflineFallback(
                    query = userQuery,
                    district = selectedDistrict,
                    language = language,
                    reason = "Empty model response; showing stored verified Odisha record."
                )
            }

            val citations = mutableListOf<Pair<String, String>>()
            val groundingChunks = response.candidates.firstOrNull()?.groundingMetadata?.groundingChunks
            groundingChunks?.forEach { chunk ->
                val uri = chunk.web?.uri.orEmpty()
                val title = chunk.web?.title.orEmpty()
                if (uri.isNotBlank()) {
                    citations.add((title.ifBlank { "Google Search Source" }) to uri)
                }
            }

            val districtLabel = selectedDistrict?.nameEn ?: "Odisha"
            AiKnowledgeResult(
                text = answerText,
                modeLabel = when {
                    useHighThinking -> "High Thinking ($primaryModelName)"
                    useSearchGrounding -> "Google Search Grounded ($primaryModelName)"
                    else -> "Firebase AI RAG ($primaryModelName)"
                },
                reliabilityBadge = if (citations.isNotEmpty()) {
                    "Live Web Grounded + Curated District Record"
                } else {
                    "Firebase AI Logic • Source-Grounded Odisha Knowledge"
                },
                citations = citations.distinctBy { it.second }.take(5),
                suggestedFollowUps = listOf(
                    "What are lesser-known hidden gems in $districtLabel?",
                    "Tell me a documented historical story from $districtLabel",
                    "Best season, transit hub & hospital info for $districtLabel"
                ),
                usedLiveApi = true
            )
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Log.w(TAG, "Primary Firebase AI call ($primaryModelName) failed, checking fallback: ${e.message}")
            if (!useHighThinking) {
                val fallbackTry = runCatching {
                    withTimeout(AI_TIMEOUT_MS) {
                        val fbModel = buildMitraGenerativeModel(
                            modelName = MODEL_SEARCH_FALLBACK,
                            systemPrompt = systemPrompt,
                            useHighThinking = false,
                            useSearchGrounding = useSearchGrounding
                        )
                        fbModel.generateContent(historyContents)
                    }
                }
                fallbackTry.getOrNull()?.text?.trim()?.takeIf { it.isNotBlank() }?.let { fbText ->
                    val districtLabel = selectedDistrict?.nameEn ?: "Odisha"
                    return@withContext AiKnowledgeResult(
                        text = fbText,
                        modeLabel = "Firebase AI ($MODEL_SEARCH_FALLBACK)",
                        reliabilityBadge = "Firebase AI Logic • Source-Grounded Odisha Knowledge",
                        citations = emptyList(),
                        suggestedFollowUps = listOf(
                            "What are lesser-known hidden gems in $districtLabel?",
                            "Tell me a documented historical story from $districtLabel"
                        ),
                        usedLiveApi = true
                    )
                }
            }

            buildCuratedOfflineFallback(
                query = userQuery,
                district = selectedDistrict,
                language = language,
                reason = "Offline or AI service unavailable (${e.javaClass.simpleName}); showing stored verified Odisha record."
            )
        }
    }

    private fun buildMitraGenerativeModel(
        modelName: String,
        systemPrompt: String,
        useHighThinking: Boolean,
        useSearchGrounding: Boolean
    ) = when {
        useHighThinking -> {
            // MANDATED: gemini-4-argon with ThinkingLevel.HIGH and NO maxOutputTokens
            aiService.generativeModel(
                modelName = modelName,
                generationConfig = generationConfig {
                    thinkingConfig = thinkingConfig {
                        thinkingLevel = ThinkingLevel.HIGH
                    }
                },
                systemInstruction = content { text(systemPrompt) }
            )
        }
        useSearchGrounding -> {
            // MANDATED: gemini-3.8-flash with Google Search grounding tool
            aiService.generativeModel(
                modelName = modelName,
                tools = listOf(Tool.googleSearch()),
                systemInstruction = content { text(systemPrompt) }
            )
        }
        else -> {
            aiService.generativeModel(
                modelName = modelName,
                systemInstruction = content { text(systemPrompt) }
            )
        }
    }

    /**
     * Synthesizes warm, deep, natural speech via Firebase AI Logic TTS (`gemini-3.8-flash-tts` /
     * fallback `gemini-3.1-flash-tts-preview`) and writes a playable RIFF `.wav` file for offline cache.
     */
    @OptIn(PublicPreviewAPI::class)
    suspend fun synthesizeDeepVoiceTtsToWav(
        textToSpeak: String,
        language: AppLanguage,
        voiceName: String,
        outputFile: File
    ): Result<File> = withContext(Dispatchers.IO) {
        val narrationPrompt = when (language) {
            AppLanguage.ODIA -> "Speak clearly, warmly, and authoritatively in Odia with natural pauses and authentic Odisha place-name pronunciation:\n${textToSpeak.take(3400)}"
            AppLanguage.HINDI -> "Speak clearly, warmly, and authoritatively in Hindi with natural pauses and authentic Odisha place-name pronunciation:\n${textToSpeak.take(3400)}"
            AppLanguage.ENGLISH -> "Narrate in a warm, mature, resonant documentary storyteller voice with natural pauses and authentic Indian/Odia pronunciation of Odisha place names:\n${textToSpeak.take(3400)}"
        }

        val ttsConfig = generationConfig {
            responseModalities = listOf(ResponseModality.AUDIO)
            speechConfig = SpeechConfig(
                voice = Voice(voiceName),
                languageCode = language.localeTag
            )
        }

        for (candidateModel in listOf(MODEL_TTS, MODEL_TTS_FALLBACK)) {
            try {
                val response = withTimeout(AI_TIMEOUT_MS) {
                    val ttsModel = aiService.generativeModel(
                        modelName = candidateModel,
                        generationConfig = ttsConfig
                    )
                    ttsModel.generateContent(narrationPrompt)
                }

                val audioPart = response.candidates
                    .firstOrNull()
                    ?.content
                    ?.parts
                    ?.filterIsInstance<InlineDataPart>()
                    ?.firstOrNull()

                if (audioPart != null && audioPart.inlineData.isNotEmpty()) {
                    val rawBytes = audioPart.inlineData
                    val mimeType = audioPart.mimeType
                    outputFile.parentFile?.mkdirs()

                    if (mimeType.contains("wav", ignoreCase = true) || mimeType.contains("mp3", ignoreCase = true)) {
                        FileOutputStream(outputFile).use { it.write(rawBytes) }
                    } else {
                        val sampleRate = Regex("rate=(\\d+)").find(mimeType)?.groupValues?.getOrNull(1)?.toIntOrNull() ?: 24000
                        writePcm16MonoToWav(rawBytes, sampleRate, outputFile)
                    }
                    return@withContext Result.success(outputFile)
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.w(TAG, "Firebase AI TTS attempt ($candidateModel) failed: ${e.message}")
            }
        }

        Result.failure(IllegalStateException("Neural TTS audio synthesis unavailable; falling back to verified local/transcript mode."))
    }

    /**
     * Generates new source-grounded cultural/historical stories for Utkal Katha's scalable library
     * using Firebase AI Logic structured JSON output (`Schema.array`).
     */
    suspend fun generateSourceGroundedStoriesForDistrict(
        district: DistrictRecord,
        existingTitles: List<String>,
        count: Int = 2
    ): Result<List<GeneratedStoryDraft>> = withContext(Dispatchers.IO) {
        val avoidList = existingTitles.take(15).joinToString("; ")
        val prompt = """
            Generate $count distinct, historically accurate Odisha cultural/heritage audio-guide stories for ${district.nameEn} district (HQ: ${district.headquarters}).
            Reference facts: ${district.historySummary} | Attractions: ${district.destinations.joinToString { "${it.name}: ${it.historicalSignificance}" }} | Crafts: ${district.craftsAndHandloom.joinToString()}
            Do NOT repeat these existing titles: [$avoidList].
            Clearly label whether each story is "Documented Historical Record", "Archaeological & Epigraphic Evidence", or "Traditional Oral Legend & Folklore".
        """.trimIndent()

        try {
            val response = withTimeout(AI_TIMEOUT_MS) {
                val structuredModel = aiService.generativeModel(
                    modelName = MODEL_SEARCH_FLASH,
                    generationConfig = generationConfig {
                        responseMimeType = "application/json"
                        responseSchema = storyBatchSchema
                    }
                )
                structuredModel.generateContent(prompt)
            }

            val rawJson = response.text?.trim() ?: "[]"
            val arr = JSONArray(rawJson)
            val drafts = mutableListOf<GeneratedStoryDraft>()
            for (i in 0 until arr.length()) {
                val obj = arr.optJSONObject(i) ?: continue
                val titleEn = obj.optString("titleEn").trim()
                val bodyEn = obj.optString("bodyEn").trim()
                if (titleEn.isNotBlank() && bodyEn.length > 60) {
                    drafts.add(
                        GeneratedStoryDraft(
                            titleEn = titleEn,
                            titleOdia = obj.optString("titleOdia", district.nameOdia),
                            titleHindi = obj.optString("titleHindi", district.nameHindi),
                            category = obj.optString("category", "Sacred Architecture"),
                            historicalPeriod = obj.optString("historicalPeriod", "Historical Odisha"),
                            factClassification = obj.optString("factClassification", "Documented Historical Record"),
                            bodyEn = bodyEn,
                            bodyOdia = obj.optString("bodyOdia", ""),
                            bodyHindi = obj.optString("bodyHindi", ""),
                            sourceReferences = obj.optString("sourceReferences", district.sourceReference)
                        )
                    )
                }
            }
            Result.success(drafts)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Log.e(TAG, "Failed to generate Katha stories via Firebase AI Logic", e)
            Result.failure(e)
        }
    }

    private fun buildRetrievedOdishaContext(query: String, explicitDistrict: DistrictRecord?): String {
        val matches = mutableListOf<DistrictRecord>()
        if (explicitDistrict != null) matches.add(explicitDistrict)
        matches.addAll(
            OdishaDistrictCatalog.searchDistrictsAndPlaces(query)
                .filterNot { d -> matches.any { it.id == d.id } }
                .take(3)
        )
        if (matches.isEmpty()) {
            matches.addAll(
                listOfNotNull(
                    OdishaDistrictCatalog.getDistrictById("puri"),
                    OdishaDistrictCatalog.getDistrictById("khordha"),
                    OdishaDistrictCatalog.getDistrictById("koraput")
                )
            )
        }
        return matches.joinToString("\n---\n") { d ->
            "District #${d.number}: ${d.nameEn} (${d.nameOdia}) | HQ: ${d.headquarters} | Region: ${d.region.displayName}\n" +
                "History: ${d.historySummary}\n" +
                "Culture: ${d.cultureAndFestivals}\n" +
                "Attractions: ${d.destinations.joinToString { "${it.name} (${it.category}) - ${it.shortSummary}; ${it.historicalSignificance}" }}\n" +
                "Food: ${d.signatureFood.joinToString()} | Crafts: ${d.craftsAndHandloom.joinToString()}\n" +
                "Transit: ${d.transportHubs} | Hospital: ${d.emergencyHospital} | Source: ${d.sourceReference}"
        }
    }

    private fun buildCuratedOfflineFallback(
        query: String,
        district: DistrictRecord?,
        language: AppLanguage,
        reason: String
    ): AiKnowledgeResult {
        val target = district
            ?: OdishaDistrictCatalog.searchDistrictsAndPlaces(query).firstOrNull()
            ?: OdishaDistrictCatalog.getDistrictById("puri")!!

        val responseText = when (language) {
            AppLanguage.ODIA -> """
                [ସଂରକ୍ଷିତ ପ୍ରମାଣିତ ଓଡ଼ିଶା ତଥ୍ୟ — $reason]

                • ଜିଲ୍ଲା: ${target.nameOdia} (${target.nameEn}) | ମୁଖ୍ୟାଳୟ: ${target.headquarters}
                • ଐତିହାସିକ ପୃଷ୍ଠଭୂମି (ପ୍ରମାଣିତ ତଥ୍ୟ): ${target.historySummary}
                • ପ୍ରମୁଖ ଦର୍ଶନୀୟ ସ୍ଥାନ: ${target.destinations.joinToString(" | ") { "${it.odiaName} (${it.name}): ${it.shortSummary}" }}
                • ସଂସ୍କୃତି ଓ ହସ୍ତଶିଳ୍ପ: ${target.craftsAndHandloom.joinToString(", ")}
                • ଖାଦ୍ୟ ପରମ୍ପରା: ${target.signatureFood.joinToString(", ")}
                • ଗମନାଗମନ ଓ ଜରୁରୀକାଳୀନ ସେବା: ${target.transportHubs} | ଚିକିତ୍ସାଳୟ: ${target.emergencyHospital} (SOS 112)।
            """.trimIndent()
            AppLanguage.HINDI -> """
                [संग्रहीत प्रमाणित ओडिशा रिकॉर्ड — $reason]

                • जिला: ${target.nameHindi} (${target.nameEn}) | मुख्यालय: ${target.headquarters}
                • ऐतिहासिक तथ्य: ${target.historySummary}
                • प्रमुख दर्शनीय स्थल: ${target.destinations.joinToString(" | ") { "${it.name}: ${it.shortSummary}" }}
                • शिल्प और संस्कृति: ${target.craftsAndHandloom.joinToString(", ")} | पर्व: ${target.cultureAndFestivals}
                • प्रसिद्ध व्यंजन: ${target.signatureFood.joinToString(", ")}
                • यातायात व आपातकालीन सेवा: ${target.transportHubs} | अस्पताल: ${target.emergencyHospital} (आपातकाल 112)।
            """.trimIndent()
            AppLanguage.ENGLISH -> """
                [Stored Curated Odisha Record — $reason]

                • District: ${target.nameEn} (${target.nameOdia}) — HQ: ${target.headquarters} (${target.region.displayName})
                • Established Historical Context: ${target.historySummary}
                • Verified Destinations:
                ${target.destinations.joinToString("\n") { "  - ${it.name} (${it.category}): ${it.shortSummary} [Source: ${it.sourceCitation}]" }}
                • Culture & Festivals: ${target.cultureAndFestivals}
                • GI Crafts & Handloom: ${target.craftsAndHandloom.joinToString(", ")}
                • Regional Cuisine: ${target.signatureFood.joinToString(", ")}
                • Transit & Safety: ${target.transportHubs} | Medical: ${target.emergencyHospital}
            """.trimIndent()
        }

        return AiKnowledgeResult(
            text = responseText,
            modeLabel = "Stored Verified Catalog (Offline Ready)",
            reliabilityBadge = "Curated Historical & Official District Gazetteer Record",
            citations = listOf(target.sourceReference to "https://odishatourism.gov.in"),
            suggestedFollowUps = listOf(
                "Explore ${target.nameEn} audio stories in Utkal Katha",
                "Plan a 3-day itinerary including ${target.nameEn}",
                "Check transit distance & fair fares to ${target.headquarters}"
            ),
            usedLiveApi = false
        )
    }

    private fun writePcm16MonoToWav(pcmData: ByteArray, sampleRate: Int, outFile: File) {
        val channels = 1
        val bitsPerSample = 16
        val byteRate = sampleRate * channels * bitsPerSample / 8
        val totalDataLen = pcmData.size + 36

        val header = ByteBuffer.allocate(44).order(ByteOrder.LITTLE_ENDIAN).apply {
            put("RIFF".toByteArray(Charsets.US_ASCII))
            putInt(totalDataLen)
            put("WAVE".toByteArray(Charsets.US_ASCII))
            put("fmt ".toByteArray(Charsets.US_ASCII))
            putInt(16)
            putShort(1.toShort())
            putShort(channels.toShort())
            putInt(sampleRate)
            putInt(byteRate)
            putShort((channels * bitsPerSample / 8).toShort())
            putShort(bitsPerSample.toShort())
            put("data".toByteArray(Charsets.US_ASCII))
            putInt(pcmData.size)
        }.array()

        FileOutputStream(outFile).use { fos ->
            fos.write(header)
            fos.write(pcmData)
        }
    }
}
