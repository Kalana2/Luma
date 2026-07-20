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
    val rooms: Map<String, Room> = emptyMap(),
    val planImageUrl: String? = null // For "overlaid onto floor layouts" requirement
)

data class Device(
    val id: String = "",
    val name: String = "",
    val type: String = "light",
    val status: String = "OFF", // ON, OFF, ERROR, DISCONNECTED
    val state: String = "OFF",
    val userId: String = "",
    
    // Scheduling & Safety
    val startTime: String? = null,
    val endTime: String? = null,
    val maxDurationMinutes: Int? = null,
    
    // Multi-Switch Units
    val switches: Map<String, String>? = null, // e.g. {"switch1": "OFF", "switch2": "ON"}
    val switchCount: Int = 0,
    
    // Security Cameras
    val lastSnapshotUrl: String? = null,
    val streamUri: String? = null,
    
    // Reporting/Stats
    val lastSeen: Long = 0
) {
    val isOn: Boolean get() = status == "ON"
    val isError: Boolean get() = status == "ERROR"
    val isDisconnected: Boolean get() = status == "DISCONNECTED"
}

data class UserLog(
    val event: String = "",
    val timestamp: Long = 0,
    val device: String = "",
    val environment: String = "",
    val details: Map<String, String> = emptyMap()
)
