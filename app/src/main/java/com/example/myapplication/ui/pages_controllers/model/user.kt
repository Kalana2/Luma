package com.example.myapplication.ui.pages_controllers.model

data class User(
    val id: String? = null,
    val name: String,
    val email: String,
    val phone: String,
    val address: String,
    val role: String = "User", // Default role
    val password: String? = null
)