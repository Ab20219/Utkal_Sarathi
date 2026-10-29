package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Route
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.NavigationRailItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.catalog.OdishaDistrictCatalog
import com.example.data.firebase.AppCheckConfigurator
import com.example.data.firebase.AuthManager
import com.example.data.firebase.SignedInTraveller
import com.example.ui.AppScreen
import com.example.ui.UtkalViewModel
import com.example.ui.components.FloatingNarrationBar
import com.example.ui.components.OnboardingOverlayScreen
import com.example.ui.components.UtkalSignInGateScreen
import com.example.ui.components.UtkalTopHeader
import com.example.ui.screens.CuisineAndArtisansScreen
import com.example.ui.screens.DestinationStoryExperienceScreen
import com.example.ui.screens.DistrictDetailScreen
import com.example.ui.screens.ExploreDistrictsScreen
import com.example.ui.screens.HomeDashboardScreen
import com.example.ui.screens.OdishaGeoMapAndTransitScreen
import com.example.ui.screens.OfflineAndProfileDashboardScreen
import com.example.ui.screens.TripPlannerAndMyTripsScreen
import com.example.ui.screens.UtkalKathaLibraryScreen
import com.example.ui.screens.UtkalMitraAiScreen
import com.example.ui.screens.UtkalSurakshaSafetyScreen
import com.example.ui.theme.CharcoalSurface
import com.example.ui.theme.IvoryMuted
import com.example.ui.theme.ObsidianBlack
import com.example.ui.theme.SaffronOrange
import com.example.ui.theme.UtkalSarathiTheme
import com.example.ui.theme.WarmGold
import kotlinx.coroutines.launch

private data class NavTab(
    val label: String,
    val icon: ImageVector,
    val screen: AppScreen,
    val tag: String
)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // CRITICAL: Configure Firebase App Check synchronously before any ViewModel or Firebase call
        AppCheckConfigurator.configureAppCheck(this, intent)
        enableEdgeToEdge()
        setContent {
            UtkalSarathiTheme {
                AuthNavigationGate()
            }
        }
    }
}

@Composable
fun AuthNavigationGate() {
    val currentTraveller by AuthManager.observeAuthState()
        .collectAsStateWithLifecycle(initialValue = AuthManager.currentTravellerOrNull())

    val traveller = currentTraveller
    if (traveller == null) {
        UtkalSignInGateScreen()
    } else {
        val context = LocalContext.current
        val vm: UtkalViewModel = viewModel(
            key = traveller.uid,
            factory = UtkalViewModel.provideFactory(context.applicationContext, traveller)
        )
        UtkalSarathiAppRoot(traveller = traveller, vm = vm)
    }
}

@Composable
fun UtkalSarathiAppRoot(
    traveller: SignedInTraveller,
    vm: UtkalViewModel
) {
    val context = LocalContext.current
    val uiScope = rememberCoroutineScope()
    val prefs by vm.userPrefs.collectAsStateWithLifecycle()
    val currentScreen by vm.currentScreen.collectAsStateWithLifecycle()
    val narrationState by vm.narrationState.collectAsStateWithLifecycle()
    val liveState by vm.liveState.collectAsStateWithLifecycle()
    val allStories by vm.allStories.collectAsStateWithLifecycle()
    val kathaStats by vm.kathaStats.collectAsStateWithLifecycle()
    val savedTrips by vm.savedTrips.collectAsStateWithLifecycle()
    val hazardReports by vm.hazardReports.collectAsStateWithLifecycle()
    val trustedContacts by vm.trustedContacts.collectAsStateWithLifecycle()
    val offlineDistricts by vm.offlineDistricts.collectAsStateWithLifecycle()
    val chatMessages by vm.chatMessages.collectAsStateWithLifecycle()
    val isMitraThinking by vm.isMitraThinking.collectAsStateWithLifecycle()
    val toastMsg by vm.statusToast.collectAsStateWithLifecycle()

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(toastMsg) {
        if (!toastMsg.isNullOrBlank()) {
            snackbarHostState.showSnackbar(toastMsg!!)
            vm.clearToast()
        }
    }

    if (!prefs.hasCompletedOnboarding) {
        OnboardingOverlayScreen(onContinue = { vm.completeOnboarding() })
        return
    }

    val navTabs = remember {
        listOf(
            NavTab("Home", Icons.Filled.Home, AppScreen.Home, "nav_tab_home"),
            NavTab("Explore", Icons.Filled.Explore, AppScreen.Explore, "nav_tab_explore"),
            NavTab("My Trips", Icons.Filled.Route, AppScreen.MyTrips, "nav_tab_trips"),
            NavTab("Safety", Icons.Filled.Shield, AppScreen.Safety, "nav_tab_safety"),
            NavTab("Profile", Icons.Filled.Person, AppScreen.Profile, "nav_tab_profile")
        )
    }

    val isSubScreen = currentScreen !in setOf(
        AppScreen.Home,
        AppScreen.Explore,
        AppScreen.MyTrips,
        AppScreen.Safety,
        AppScreen.Profile
    )

    val headerTitleOverride = when (val s = currentScreen) {
        is AppScreen.DistrictDetail -> OdishaDistrictCatalog.getDistrictById(s.districtId)?.nameEn
        is AppScreen.DestinationStoryDetail -> "Historical Story Guide"
        is AppScreen.UtkalMitraAi -> "Utkal Mitra AI"
        is AppScreen.UtkalKathaLibrary -> "Utkal Katha Library"
        AppScreen.GeoMapAndTransit -> "Odisha Geo-Map & Fares"
        AppScreen.CuisineAndArtisans -> "Cuisine & GI Artisans"
        AppScreen.OfflineTravelPack -> "Offline Travel Pack"
        else -> null
    }

    BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
        val isWideTablet = maxWidth >= 700.dp

        Scaffold(
            containerColor = ObsidianBlack,
            contentWindowInsets = WindowInsets.safeDrawing,
            snackbarHost = { SnackbarHost(snackbarHostState) },
            topBar = {
                UtkalTopHeader(
                    selectedLanguage = prefs.language,
                    onLanguageSelected = { vm.selectLanguage(it) },
                    showBackButton = isSubScreen && vm.canNavigateBack(),
                    titleOverride = headerTitleOverride,
                    onBackClick = { vm.navigateBack() }
                )
            },
            bottomBar = {
                Column {
                    FloatingNarrationBar(
                        state = narrationState,
                        onPause = { vm.narrator.pause() },
                        onResume = { vm.narrator.resume() },
                        onReplay = { vm.narrator.replay() },
                        onStop = { vm.narrator.stop() },
                        onCycleSpeed = {
                            val next = when {
                                prefs.speechSpeed < 0.95f -> 1.0f
                                prefs.speechSpeed < 1.2f -> 1.25f
                                else -> 0.85f
                            }
                            vm.setSpeechSpeed(next)
                        }
                    )

                    if (!isWideTablet) {
                        NavigationBar(
                            containerColor = CharcoalSurface,
                            tonalElevation = 8.dp
                        ) {
                            navTabs.forEach { tab ->
                                val selected = isTabActive(currentScreen, tab.screen)
                                NavigationBarItem(
                                    selected = selected,
                                    onClick = { vm.navigateTo(tab.screen, resetRoot = true) },
                                    icon = { Icon(tab.icon, contentDescription = tab.label) },
                                    label = { Text(tab.label) },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = ObsidianBlack,
                                        selectedTextColor = WarmGold,
                                        indicatorColor = SaffronOrange,
                                        unselectedIconColor = IvoryMuted,
                                        unselectedTextColor = IvoryMuted
                                    ),
                                    modifier = Modifier.testTag(tab.tag)
                                )
                            }
                        }
                    }
                }
            }
        ) { innerPadding ->
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
            ) {
                if (isWideTablet) {
                    NavigationRail(
                        containerColor = CharcoalSurface,
                        modifier = Modifier.fillMaxHeight()
                    ) {
                        navTabs.forEach { tab ->
                            val selected = isTabActive(currentScreen, tab.screen)
                            NavigationRailItem(
                                selected = selected,
                                onClick = { vm.navigateTo(tab.screen, resetRoot = true) },
                                icon = { Icon(tab.icon, contentDescription = tab.label) },
                                label = { Text(tab.label) },
                                colors = NavigationRailItemDefaults.colors(
                                    selectedIconColor = ObsidianBlack,
                                    selectedTextColor = WarmGold,
                                    indicatorColor = SaffronOrange,
                                    unselectedIconColor = IvoryMuted,
                                    unselectedTextColor = IvoryMuted
                                ),
                                modifier = Modifier.testTag(tab.tag)
                            )
                        }
                    }
                }

                Box(modifier = Modifier.weight(1f)) {
                    val offlineSet = remember(offlineDistricts) { offlineDistricts.map { it.districtId }.toSet() }

                    when (val screen = currentScreen) {
                        AppScreen.Home -> HomeDashboardScreen(
                            language = prefs.language,
                            kathaStats = kathaStats,
                            featuredStories = allStories,
                            onNavigate = { vm.navigateTo(it) },
                            onPlayStory = { vm.narrateStory(it) },
                            onSearchSubmitted = { vm.recordSearch(it) }
                        )

                        AppScreen.Explore -> ExploreDistrictsScreen(
                            language = prefs.language,
                            offlineDistrictIds = offlineSet,
                            favoriteDestinationIds = prefs.favoriteDestinationIds,
                            onOpenDistrict = { vm.navigateTo(AppScreen.DistrictDetail(it)) },
                            onOpenDestination = { vm.navigateTo(AppScreen.DestinationStoryDetail(it)) }
                        )

                        AppScreen.MyTrips -> TripPlannerAndMyTripsScreen(
                            savedTrips = savedTrips,
                            repository = vm.repository,
                            onCreateTrip = { start, dists, days, dates, pax, tier, interests ->
                                vm.createAndSaveTrip(start, dists, days, dates, pax, tier, interests)
                            },
                            onUpdateTripSlots = { trip, slots -> vm.updateSavedTripSlots(trip, slots) },
                            onDeleteTrip = { vm.deleteTrip(it) }
                        )

                        AppScreen.Safety -> UtkalSurakshaSafetyScreen(
                            hazardReports = hazardReports,
                            trustedContacts = trustedContacts,
                            onSubmitHazard = { distId, loc, cat, desc, sev, lat, lon ->
                                vm.submitHazardReport(distId, loc, cat, desc, sev, lat, lon)
                            },
                            onAddContact = { name, rel, phone -> vm.addTrustedContact(name, rel, phone) },
                            onRemoveContact = { vm.removeTrustedContact(it) }
                        )

                        AppScreen.Profile -> OfflineAndProfileDashboardScreen(
                            isStandaloneOfflineScreen = false,
                            travellerName = traveller.displayName,
                            travellerEmail = traveller.email,
                            prefs = prefs,
                            offlineDistricts = offlineDistricts,
                            savedTrips = savedTrips,
                            allStories = allStories,
                            trustedContacts = trustedContacts,
                            onBack = { vm.navigateBack() },
                            onSignOut = {
                                uiScope.launch { AuthManager.signOut(context) }
                            },
                            onVoiceSelected = { vm.setVoiceProfile(it) },
                            onSpeedChanged = { vm.setSpeechSpeed(it) },
                            onToggleDistrictOffline = { id, saved ->
                                OdishaDistrictCatalog.getDistrictById(id)?.let { vm.toggleDistrictOffline(it, saved) }
                            },
                            onNavigate = { vm.navigateTo(it) }
                        )

                        is AppScreen.DistrictDetail -> DistrictDetailScreen(
                            districtId = screen.districtId,
                            language = prefs.language,
                            stories = allStories,
                            isOfflineSaved = offlineSet.contains(screen.districtId),
                            onBack = { vm.navigateBack() },
                            onNavigate = { vm.navigateTo(it) },
                            onToggleOffline = { currentlySaved ->
                                OdishaDistrictCatalog.getDistrictById(screen.districtId)?.let {
                                    vm.toggleDistrictOffline(it, currentlySaved)
                                }
                            },
                            onPlayStory = { story, lang -> vm.narrateStory(story, lang) },
                            onGenerateMoreStories = {
                                OdishaDistrictCatalog.getDistrictById(screen.districtId)?.let {
                                    vm.generateAiStoriesForDistrict(it)
                                }
                            }
                        )

                        is AppScreen.DestinationStoryDetail -> DestinationStoryExperienceScreen(
                            destinationId = screen.destinationId,
                            defaultLanguage = prefs.language,
                            allStories = allStories,
                            isFavoriteDestination = prefs.favoriteDestinationIds.contains(screen.destinationId),
                            onBack = { vm.navigateBack() },
                            onToggleFavoriteDestination = { vm.toggleFavoriteDestination(screen.destinationId) },
                            onPlayStory = { story, lang -> vm.narrateStory(story, lang) },
                            onToggleStoryOffline = { vm.toggleStoryOffline(it) },
                            onToggleStoryFavorite = { vm.toggleStoryFavorite(it) },
                            onAskFollowUpMitra = { distId, prompt ->
                                vm.navigateTo(AppScreen.UtkalMitraAi(contextDistrictId = distId, initialPrompt = prompt))
                            },
                            onOpenRelatedDestination = { vm.navigateTo(AppScreen.DestinationStoryDetail(it)) }
                        )

                        is AppScreen.UtkalMitraAi -> UtkalMitraAiScreen(
                            contextDistrictId = screen.contextDistrictId,
                            initialPrompt = screen.initialPrompt,
                            language = prefs.language,
                            preferredVoiceName = prefs.preferredVoiceName,
                            messages = chatMessages,
                            isThinking = isMitraThinking,
                            liveState = liveState,
                            liveManager = vm.liveSessionManager,
                            onBack = { vm.navigateBack() },
                            onSendQuestion = { q, dId, highThink, searchGround, autoSpeak ->
                                vm.askMitraQuestion(q, dId, highThink, searchGround, autoSpeak)
                            },
                            onSpeakMessage = { msg ->
                                vm.narrator.speak(
                                    cacheKey = msg.id,
                                    title = "Utkal Mitra AI",
                                    text = msg.text,
                                    language = prefs.language,
                                    voiceProfile = prefs.preferredVoiceName,
                                    speed = prefs.speechSpeed
                                )
                            }
                        )

                        is AppScreen.UtkalKathaLibrary -> UtkalKathaLibraryScreen(
                            initialDistrictFilter = screen.filterDistrictId,
                            language = prefs.language,
                            stories = allStories,
                            stats = kathaStats,
                            onBack = { vm.navigateBack() },
                            onPlayStory = { vm.narrateStory(it) },
                            onToggleFavorite = { vm.toggleStoryFavorite(it) },
                            onToggleOffline = { vm.toggleStoryOffline(it) },
                            onGenerateAiBatchForDistrict = { distId ->
                                OdishaDistrictCatalog.getDistrictById(distId)?.let { vm.generateAiStoriesForDistrict(it) }
                            },
                            onImportBatchJson = { vm.importBatchStoriesJson(it) }
                        )

                        AppScreen.GeoMapAndTransit -> OdishaGeoMapAndTransitScreen(
                            onBack = { vm.navigateBack() },
                            onOpenDistrict = { vm.navigateTo(AppScreen.DistrictDetail(it)) }
                        )

                        AppScreen.CuisineAndArtisans -> CuisineAndArtisansScreen(
                            onBack = { vm.navigateBack() },
                            onReportListingIssue = { id, title, note -> vm.submitListingCorrection(id, title, note) }
                        )

                        AppScreen.OfflineTravelPack -> OfflineAndProfileDashboardScreen(
                            isStandaloneOfflineScreen = true,
                            travellerName = traveller.displayName,
                            travellerEmail = traveller.email,
                            prefs = prefs,
                            offlineDistricts = offlineDistricts,
                            savedTrips = savedTrips,
                            allStories = allStories,
                            trustedContacts = trustedContacts,
                            onBack = { vm.navigateBack() },
                            onSignOut = {
                                uiScope.launch { AuthManager.signOut(context) }
                            },
                            onVoiceSelected = { vm.setVoiceProfile(it) },
                            onSpeedChanged = { vm.setSpeechSpeed(it) },
                            onToggleDistrictOffline = { id, saved ->
                                OdishaDistrictCatalog.getDistrictById(id)?.let { vm.toggleDistrictOffline(it, saved) }
                            },
                            onNavigate = { vm.navigateTo(it) }
                        )
                    }
                }
            }
        }
    }
}

private fun isTabActive(current: AppScreen, tabScreen: AppScreen): Boolean {
    if (current == tabScreen) return true
    return when (tabScreen) {
        AppScreen.Explore -> current is AppScreen.DistrictDetail || current is AppScreen.DestinationStoryDetail
        AppScreen.Home -> current is AppScreen.UtkalMitraAi || current is AppScreen.UtkalKathaLibrary || current == AppScreen.GeoMapAndTransit || current == AppScreen.CuisineAndArtisans
        AppScreen.Profile -> current == AppScreen.OfflineTravelPack
        else -> false
    }
}
