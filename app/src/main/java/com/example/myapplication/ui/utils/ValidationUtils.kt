package com.example.myapplication.ui.utils

import android.util.Patterns

object ValidationUtils {
    fun validateRegistration(name: String, email: String, password: String): String? {
        if (name.isBlank()) return "Name cannot be empty"
        if (email.isBlank()) return "Email cannot be empty"
        if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) return "Invalid email format"
        if (password.length < 6) return "Password must be at least 6 characters"
        return null
    }
}