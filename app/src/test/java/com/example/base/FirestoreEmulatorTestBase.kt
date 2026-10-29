package com.example.base

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.R
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseAuthInvalidUserException
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FirebaseFirestoreSettings
import com.google.firebase.firestore.MemoryCacheSettings
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import org.junit.After
import org.junit.Before
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.LooperMode
import org.robolectric.shadows.ShadowLog
import java.net.HttpURLConnection
import java.net.URL

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
@LooperMode(LooperMode.Mode.INSTRUMENTATION_TEST)
abstract class FirestoreEmulatorTestBase {

    protected lateinit var firestore: FirebaseFirestore
    protected lateinit var auth: FirebaseAuth
    protected lateinit var databaseId: String

    companion object {
        const val EMULATOR_HOST = "127.0.0.1"
        const val FIRESTORE_PORT = 8085
        const val AUTH_PORT = 9099
        const val PROJECT_ID = "demo-test"
        private const val APP_NAME = "utkal-emulator-test"
        private const val DEFAULT_PASSWORD = "TestPass123!"
        private const val AUTH_TIMEOUT_MS = 8000L
    }

    @Before
    open fun setUpFirebaseEmulators() {
        ShadowLog.stream = System.out

        val context = ApplicationProvider.getApplicationContext<Context>()
        databaseId = context.getString(R.string.firestore_database_id)

        val options = FirebaseOptions.Builder()
            .setApplicationId("com.aistudio.utkalsarathi.krmpzv")
            .setProjectId(PROJECT_ID)
            .setApiKey("fake-api-key-for-emulator")
            .build()

        // Ensure default app also exists so Firebase.auth inside error handlers never throws
        if (FirebaseApp.getApps(context).isEmpty()) {
            FirebaseApp.initializeApp(context, options)
        }

        val testApp = FirebaseApp.getApps(context).find { it.name == APP_NAME } ?: run {
            val created = FirebaseApp.initializeApp(context, options, APP_NAME)
            val newFirestore = FirebaseFirestore.getInstance(created, databaseId)
            newFirestore.useEmulator(EMULATOR_HOST, FIRESTORE_PORT)
            newFirestore.firestoreSettings = FirebaseFirestoreSettings.Builder()
                .setLocalCacheSettings(MemoryCacheSettings.newBuilder().build())
                .build()

            val newAuth = FirebaseAuth.getInstance(created)
            newAuth.useEmulator(EMULATOR_HOST, AUTH_PORT)
            created
        }

        firestore = FirebaseFirestore.getInstance(testApp, databaseId)
        auth = FirebaseAuth.getInstance(testApp)

        clearFirestoreEmulator()
        auth.signOut()
    }

    @After
    open fun tearDownFirebaseEmulators() {
        auth.signOut()
    }

    protected fun clearFirestoreEmulator() {
        runCatching {
            val url = URL("http://$EMULATOR_HOST:$FIRESTORE_PORT/emulator/v1/projects/$PROJECT_ID/databases/$databaseId/documents")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "DELETE"
                connectTimeout = 3000
                readTimeout = 3000
            }
            conn.responseCode
            conn.disconnect()
        }
    }

    protected suspend fun signInTestUser(email: String): String = withContext(Dispatchers.IO) {
        withTimeout(AUTH_TIMEOUT_MS) {
            val result = try {
                auth.signInWithEmailAndPassword(email, DEFAULT_PASSWORD).await()
            } catch (_: FirebaseAuthInvalidUserException) {
                auth.createUserWithEmailAndPassword(email, DEFAULT_PASSWORD).await()
            } catch (_: Exception) {
                auth.createUserWithEmailAndPassword(email, DEFAULT_PASSWORD).await()
            }
            checkNotNull(result.user?.uid) { "User auth failed in emulator" }
        }
    }
}
