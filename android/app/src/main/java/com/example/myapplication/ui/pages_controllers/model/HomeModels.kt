package com.example.myapplication.ui.pages_controllers.model

data class Room(
    val name: String = "",
    val devices: Map<String, Boolean> = emptyMap()
)

data class Floor(
    val id: String = "",
    val name: String = "",
    val icon: String = "home",
    val isOn: Boolean = false,
    val rooms: Map<String, Room> = emptyMap()
)

data class Device(
    val id: String = "",
    val name: String = "",
    val type: String = "light",
    val status: String = "OFF",
    val state: String = "OFF",
    val userId: String = ""
) {
    val isOn: Boolean get() = status == "ON"
}
