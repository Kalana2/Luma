package com.example.myapplication.ui.pages_controllers

import com.example.myapplication.ui.pages_controllers.model.User
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import android.util.Log

private const val DB_URL = "https://lumaa-2590d-default-rtdb.asia-southeast1.firebasedatabase.app"

fun login(email: String, password: String, onResult: (Boolean, String?) -> Unit) {
    val auth = FirebaseAuth.getInstance()
    auth.signInWithEmailAndPassword(email, password)
        .addOnCompleteListener { task ->
            if (task.isSuccessful) {
                onResult(true, "Login Successful")
            } else {
                onResult(false, task.exception?.message ?: "Login Failed")
            }
        }
}

fun registration(user: User, onResult: (Boolean, String?) -> Unit) {
    val auth = FirebaseAuth.getInstance()
    
    try {
        val database = FirebaseDatabase.getInstance(DB_URL).getReference("users")

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
                            
                            Log.d("FirebaseRTDB", "Attempting to write to: $DB_URL/users/$userId")
                            
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

fun getUserData(uid: String, onResult: (User?) -> Unit) {
    val database = FirebaseDatabase.getInstance(DB_URL).getReference("users")
    
    database.child(uid).get().addOnSuccessListener { snapshot ->
        if (snapshot.exists()) {
            val user = User(
                id = snapshot.child("id").value as? String,
                name = snapshot.child("name").value as? String ?: "",
                email = snapshot.child("email").value as? String ?: "",
                phone = snapshot.child("phone").value as? String ?: "",
                address = snapshot.child("address").value as? String ?: "",
                role = snapshot.child("role").value as? String ?: "User"
            )
            onResult(user)
        } else {
            onResult(null)
        }
    }.addOnFailureListener {
        onResult(null)
    }
}
