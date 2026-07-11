package com.example.myapplication.ui.pages_controllers

import com.example.myapplication.ui.pages_controllers.model.User
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase

import android.util.Log

fun registration(user: User, onResult: (Boolean, String?) -> Unit) {
    val auth = FirebaseAuth.getInstance()
    
    // Check your Firebase Console -> Realtime Database for this exact URL
    // Your URL from the screenshot is in the asia-southeast1 region
    val dbUrl = "https://lumaa-2590d-default-rtdb.asia-southeast1.firebasedatabase.app"
    
    try {
        val database = FirebaseDatabase.getInstance(dbUrl).getReference("users")

        user.password?.let { pwd ->
            auth.createUserWithEmailAndPassword(user.email, pwd)
                .addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        val userId = auth.currentUser?.uid
                        if (userId != null) {
                            val userData = mapOf(
                                "id" to userId,
                                "name" to user.name,
                                "email" to user.email,
                                "phone" to user.phone,
                                "address" to user.address,
                                "role" to user.role
                            )
                            
                            Log.d("FirebaseRTDB", "Attempting to write to: $dbUrl/users/$userId")
                            
                            database.child(userId).setValue(userData)
                                .addOnSuccessListener {
                                    Log.d("FirebaseRTDB", "Write successful")
                                    onResult(true, "Account Created Successfully")
                                }
                                .addOnFailureListener { e ->
                                    Log.e("FirebaseRTDB", "Write failed: ${e.message}")
                                    onResult(false, "Database Error: ${e.message}")
                                }
                        }
                    } else {
                        Log.e("FirebaseRTDB", "Auth failed: ${task.exception?.message}")
                        onResult(false, "Auth Error: ${task.exception?.message}")
                    }
                }
        } ?: onResult(false, "Password is required")
    } catch (e: Exception) {
        Log.e("FirebaseRTDB", "Initialization error: ${e.message}")
        onResult(false, "Config Error: ${e.message}")
    }
}