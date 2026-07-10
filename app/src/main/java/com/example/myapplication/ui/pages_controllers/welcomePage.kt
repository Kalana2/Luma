package com.example.myapplication.ui.pages_controllers

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase

data class User(
    val name: String,
    val email: String,
    val password: String
)

fun registration(user: User, onResult: (Boolean, String?) -> Unit) {
    val auth = FirebaseAuth.getInstance()
    val database = FirebaseDatabase.getInstance().getReference("users")

    auth.createUserWithEmailAndPassword(user.email, user.password)
        .addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val userId = auth.currentUser?.uid
                if (userId != null) {
                    val userData = mapOf(
                        "name" to user.name,
                        "email" to user.email
                    )
                    database.child(userId).setValue(userData)
                        .addOnCompleteListener { dbTask ->
                            if (dbTask.isSuccessful) {
                                onResult(true, "Registration Successful")
                            } else {
                                onResult(false, dbTask.exception?.message)
                            }
                        }
                }
            } else {
                onResult(false, task.exception?.message)
            }
        }
}