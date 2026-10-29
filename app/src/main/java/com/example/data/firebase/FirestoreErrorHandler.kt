package com.example.data.firebase

import android.util.Log
import com.google.firebase.Firebase
import com.google.firebase.auth.auth
import com.google.firebase.firestore.FirebaseFirestoreException
import org.json.JSONArray
import org.json.JSONObject

enum class OperationType {
    CREATE,
    UPDATE,
    DELETE,
    GET,
    LIST,
    WRITE
}

object FirestoreErrorHandler {
    private const val TAG = "FirestoreError"

    fun handleFirestoreError(
        error: Throwable,
        operationType: OperationType,
        path: String?
    ): Exception {
        val currentUser = runCatching { Firebase.auth.currentUser }.getOrNull()
        val providerArray = JSONArray()
        currentUser?.providerData?.forEach { profile ->
            providerArray.put(
                JSONObject()
                    .put("providerId", profile.providerId)
                    .put("displayName", profile.displayName)
                    .put("email", profile.email)
                    .put("photoUrl", profile.photoUrl?.toString())
            )
        }

        val authInfo = JSONObject()
            .put("userId", currentUser?.uid)
            .put("email", currentUser?.email)
            .put("emailVerified", currentUser?.isEmailVerified)
            .put("isAnonymous", currentUser?.isAnonymous)
            .put("providerInfo", providerArray)

        val errInfo = JSONObject()
            .put("error", error.message ?: error.javaClass.simpleName)
            .put("operationType", operationType.name.lowercase())
            .put("path", path)
            .put("authInfo", authInfo)

        val jsonPayload = errInfo.toString().replace("\\/", "/")
        Log.e(TAG, jsonPayload, error)

        return if (error is FirebaseFirestoreException &&
            error.code == FirebaseFirestoreException.Code.PERMISSION_DENIED
        ) {
            SecurityException(jsonPayload, error)
        } else if (error is Exception) {
            error
        } else {
            RuntimeException(jsonPayload, error)
        }
    }
}
