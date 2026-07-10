package com.example.myapplication.ui.pages_controllers

data class User(
    val name: String,
    val email: String,
    val password: String
)

fun registration(user: User) {
    println(user)
}