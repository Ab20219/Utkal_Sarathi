package com.example.ui.theme

import android.app.Activity
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.unit.dp
import androidx.core.view.WindowCompat

private val UtkalDarkColorScheme = darkColorScheme(
    primary = SaffronOrange,
    onPrimary = ObsidianBlack,
    primaryContainer = Color(0xFF3A1F0A),
    onPrimaryContainer = PaleGold,
    secondary = WarmGold,
    onSecondary = ObsidianBlack,
    secondaryContainer = Color(0xFF332914),
    onSecondaryContainer = PaleGold,
    tertiary = OdishaTeal,
    onTertiary = ObsidianBlack,
    tertiaryContainer = TealContainer,
    onTertiaryContainer = TealBright,
    background = ObsidianBlack,
    onBackground = IvoryText,
    surface = CharcoalSurface,
    onSurface = IvoryText,
    surfaceVariant = CharcoalElevated,
    onSurfaceVariant = IvoryMuted,
    outline = CharcoalBorder,
    outlineVariant = Color(0xFF232632),
    error = SosCrimson,
    onError = Color.White,
    errorContainer = SosContainer,
    onErrorContainer = Color(0xFFFFB4AB)
)

val UtkalShapes = Shapes(
    extraSmall = RoundedCornerShape(8.dp),
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(22.dp),
    extraLarge = RoundedCornerShape(28.dp)
)

@Composable
fun UtkalSarathiTheme(
    content: @Composable () -> Unit
) {
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window
            if (window != null) {
                WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
                WindowCompat.getInsetsController(window, view).isAppearanceLightNavigationBars = false
            }
        }
    }

    MaterialTheme(
        colorScheme = UtkalDarkColorScheme,
        typography = Typography,
        shapes = UtkalShapes,
        content = content
    )
}
