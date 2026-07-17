package com.example.myapplication.ui.pages_controllers

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import com.example.myapplication.ui.pages_controllers.model.User
import android.util.Log

fun login(email: String, pass: String, onResult: (Boolean, String?) -> Unit) {
    val auth = FirebaseAuth.getInstance()
    auth.signInWithEmailAndPassword(email, pass)
        .addOnCompleteListener { task ->
            if (task.isSuccessful) {
                onResult(true, "Login Successful")
            } else {
                onResult(false, task.exception?.message ?: "Login Failed")
            }
        }
}

fun getUserData(uid: String, onResult: (User?) -> Unit) {
    val dbUrl = "https://lumaa-2590d-default-rtdb.asia-southeast1.firebasedatabase.app"
    val database = FirebaseDatabase.getInstance(dbUrl).getReference("users")
    
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
