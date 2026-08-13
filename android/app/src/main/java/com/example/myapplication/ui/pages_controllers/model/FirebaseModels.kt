package com.example.myapplication.ui.pages_controllers.model

import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*

data class FirebaseDevice(
    val id: String = "",
    val name: String = "",
    val type: String = "",
    val state: String = "OFF",
    val status: String = "OFF",
    val userId: String = "",
    val startTime: String = "",
    val endTime: String = "",
    val maxDurationMinutes: Int? = null,
    val turnedOnAt: Long? = null,
    val switchCount: Int? = null,
    val switches: Map<String, String>? = null,
    val lastSnapshotUrl: String? = null,
    val lastSeen: Long? = null
)

data class FirebaseRoom(
    val name: String = "",
    val devices: Map<String, Boolean> = emptyMap()
)

data class FirebaseFloor(
    val name: String = "",
    val icon: String = "",
    val rooms: Map<String, FirebaseRoom> = emptyMap()
)

// UI representation
data class DeviceUI(
    val id: String,
    val name: String,
    val icon: ImageVector,
    val isOn: Boolean,
    val type: String,
    val isError: Boolean = false,
    val status: String = "OFF",
    val switches: Map<String, Boolean>? = null,
    val turnedOnAt: Long? = null,
    val maxDurationMinutes: Int? = null,
    val snapshotUrl: String? = null,
    val customPosition: androidx.compose.ui.geometry.Offset? = null
)

data class RoomUI(
    val name: String,
    val devices: List<DeviceUI>
)

data class FloorUI(
    val name: String,
    val icon: String = "home",
    val rooms: List<RoomUI>
)

data class UserLog(
    val device: String = "",
    val environment: String = "",
    val event: String = "",
    val sessionId: String = "",
    val timestamp: Long = 0L
)

fun mapTypeToIcon(type: String): ImageVector {
    return when (type.lowercase()) {
        "light" -> Icons.Default.Lightbulb
        "outlet" -> Icons.Default.Power
        "iron" -> Icons.Default.Iron
        "switchpanel" -> Icons.Default.DashboardCustomize
        "camera" -> Icons.Default.Videocam
        "ac" -> Icons.Default.AcUnit
        "fan" -> Icons.Default.ModeFanOff
        else -> Icons.Default.DevicesOther
    }
}
