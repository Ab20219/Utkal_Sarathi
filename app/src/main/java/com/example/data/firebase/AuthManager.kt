package com.example.data.firebase

import android.content.Context
import android.util.Log
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.NoCredentialException
import com.example.R
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.Firebase
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.auth
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

data class SignedInTraveller(
    val uid: String,
    val displayName: String,
    val email: String?,
    val photoUrl: String?
)

object AuthManager {
    private const val TAG = "UtkalAuthManager"

    fun currentTravellerOrNull(): SignedInTraveller? =
        Firebase.auth.currentUser?.toTraveller()

    fun observeAuthState(): Flow<SignedInTraveller?> = callbackFlow {
        val auth = Firebase.auth
        val listener = FirebaseAuth.AuthStateListener { firebaseAuth ->
            trySend(firebaseAuth.currentUser?.toTraveller())
        }
        auth.addAuthStateListener(listener)
        awaitClose { auth.removeAuthStateListener(listener) }
    }

    /**
     * Silent startup credential check using GetGoogleIdOption in its own dedicated request.
     * Never combined with GetSignInWithGoogleOption in the same GetCredentialRequest.
     */
    suspend fun attemptAutoSignIn(activityContext: Context): SignedInTraveller? {
        Firebase.auth.currentUser?.let { return it.toTraveller() }
        val webClientId = runCatching { activityContext.getString(R.string.default_web_client_id) }.getOrNull()
        if (webClientId.isNullOrBlank()) return null

        val googleIdOption = GetGoogleIdOption.Builder()
            .setFilterByAuthorizedAccounts(true)
            .setServerClientId(webClientId)
            .setAutoSelectEnabled(true)
            .build()

        val request = GetCredentialRequest.Builder()
            .addCredentialOption(googleIdOption)
            .build()

        return try {
            val credentialManager = CredentialManager.create(activityContext)
            val result = credentialManager.getCredential(activityContext, request)
            exchangeGoogleCredentialForFirebaseUser(result.credential)?.toTraveller()
        } catch (e: NoCredentialException) {
            Log.d(TAG, "No authorized Google account cached for silent sign-in.")
            null
        } catch (e: GetCredentialCancellationException) {
            Log.w(TAG, "Silent Google sign-in dismissed by user.")
            null
        } catch (e: GetCredentialException) {
            Log.w(TAG, "Silent Google sign-in unavailable: ${e.message}")
            null
        } catch (e: Exception) {
            Log.e(TAG, "Unexpected error during silent Google sign-in", e)
            null
        }
    }

    /**
     * Explicit interactive "Sign in with Google" button flow using GetSignInWithGoogleOption
     * in a dedicated single-option GetCredentialRequest.
     */
    suspend fun signInWithGoogleButton(activityContext: Context): Result<SignedInTraveller> {
        val webClientId = runCatching { activityContext.getString(R.string.default_web_client_id) }.getOrDefault("")
        if (webClientId.isBlank()) {
            return Result.failure(IllegalStateException("Google Sign-In Web Client ID resource is missing."))
        }

        val signInWithGoogleOption = GetSignInWithGoogleOption.Builder(
            serverClientId = webClientId
        ).build()

        val request = GetCredentialRequest.Builder()
            .addCredentialOption(signInWithGoogleOption)
            .build()

        return try {
            val credentialManager = CredentialManager.create(activityContext)
            val result = credentialManager.getCredential(activityContext, request)
            val user = exchangeGoogleCredentialForFirebaseUser(result.credential)
                ?: return Result.failure(IllegalStateException("Unsupported credential returned from Google Sign-In."))
            Result.success(user.toTraveller())
        } catch (e: GetCredentialCancellationException) {
            Log.w(TAG, "User cancelled Google Sign-In dialog.")
            Result.failure(e)
        } catch (e: GetCredentialException) {
            Log.e(TAG, "CredentialManager error during Google Sign-In", e)
            Result.failure(e)
        } catch (e: Exception) {
            Log.e(TAG, "Firebase signInWithCredential failed", e)
            Result.failure(e)
        }
    }

    suspend fun signOut(context: Context) {
        Firebase.auth.signOut()
        runCatching {
            CredentialManager.create(context).clearCredentialState(ClearCredentialStateRequest())
        }.onFailure {
            Log.w(TAG, "Clearing CredentialManager state warning: ${it.message}")
        }
    }

    private suspend fun exchangeGoogleCredentialForFirebaseUser(credential: androidx.credentials.Credential): FirebaseUser? {
        if (credential is CustomCredential &&
            credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
        ) {
            val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
            val firebaseCredential = GoogleAuthProvider.getCredential(googleIdTokenCredential.idToken, null)
            val authResult = Firebase.auth.signInWithCredential(firebaseCredential).await()
            return authResult.user
        }
        return null
    }

    private fun FirebaseUser.toTraveller(): SignedInTraveller = SignedInTraveller(
        uid = uid,
        displayName = displayName?.takeIf { it.isNotBlank() }
            ?: email?.substringBefore("@")?.takeIf { it.isNotBlank() }
            ?: "Odisha Traveller",
        email = email,
        photoUrl = photoUrl?.toString()
    )
}
