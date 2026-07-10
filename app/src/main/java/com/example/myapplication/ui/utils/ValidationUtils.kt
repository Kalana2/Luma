package com.example.myapplication.ui.utils

import android.util.Patterns

object ValidationUtils {
    fun validateRegistration(name: String, email: String, phone: String, address: String, password: String): String? {
        if (name.isBlank()) return "Name cannot be empty"
        if (email.isBlank()) return "Email cannot be empty"
        if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) return "Invalid email format"
        if (phone.isBlank()) return "Phone number is required"
        if (address.isBlank()) return "Address is required"
        if (password.length < 6) return "Password must be at least 6 characters"
        return null
    }
}