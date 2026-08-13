package com.example.myapplication.ui.pages_controllers.model

import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*

data class RoomLayout(
    val name: String,
    val bounds: Rect, // Coordinates on a 100x100 grid
    val floorName: String,
    val icon: ImageVector? = null,
    val color: Color = Color(0xFFF5F5F5)
)

object FloorPlanMetadata {
    private val roomMappings = listOf(
        // Ground Floor
        RoomLayout("Living Room", Rect(5f, 5f, 60f, 45f), "Ground Floor", Icons.Default.Weekend, Color(0xFFE3F2FD)),
        RoomLayout("Gayan's Room", Rect(12f, 10f, 55f, 40f), "Ground Floor", Icons.Default.Person, Color(0xFFE8EAF6)),
        RoomLayout("Kitchen", Rect(65f, 5f, 95f, 45f), "Ground Floor", Icons.Default.Kitchen, Color(0xFFFFF3E0)),
        RoomLayout("Garage", Rect(5f, 50f, 55f, 95f), "Ground Floor", Icons.Default.Garage, Color(0xFFECEFF1)),
        RoomLayout("Entrance", Rect(65f, 50f, 95f, 95f), "Ground Floor", Icons.Default.MeetingRoom, Color(0xFFF3E5F5)),
        
        // First Floor
        RoomLayout("Master Bedroom", Rect(5f, 5f, 50f, 50f), "First Floor", Icons.Default.Bed, Color(0xFFFCE4EC)),
        RoomLayout("Bedroom 1", Rect(55f, 5f, 95f, 45f), "First Floor", Icons.Default.SingleBed, Color(0xFFE0F2F1)),
        RoomLayout("Bedroom 2", Rect(55f, 50f, 95f, 95f), "First Floor", Icons.Default.SingleBed, Color(0xFFE0F7FA)),
        RoomLayout("Bathroom", Rect(5f, 55f, 50f, 95f), "First Floor", Icons.Default.Bathtub, Color(0xFFF3E5F5)),
        RoomLayout("Balcony", Rect(5f, 85f, 95f, 98f), "First Floor", Icons.Default.Deck, Color(0xFFFFFDE7)),

        // Second Floor
        RoomLayout("Gym", Rect(5f, 5f, 45f, 45f), "Second Floor", Icons.Default.FitnessCenter, Color(0xFFFBE9E7)),
        RoomLayout("Office", Rect(50f, 5f, 95f, 45f), "Second Floor", Icons.Default.Work, Color(0xFFEFEBE9)),
        RoomLayout("Roof Top", Rect(5f, 50f, 95f, 95f), "Second Floor", Icons.Default.WbSunny, Color(0xFFFFF8E1))
    )

    fun getLayoutForRoom(roomName: String, floorName: String): RoomLayout {
        return roomMappings.find { 
            it.name.equals(roomName, ignoreCase = true) && it.floorName.equals(floorName, ignoreCase = true) 
        } ?: RoomLayout(roomName, Rect(10f, 10f, 40f, 40f), floorName) // Default fallback
    }
    
    fun getDevicePosition(device: DeviceUI, roomLayout: RoomLayout, index: Int, total: Int): Offset {
        // If device has a custom position, use it
        device.customPosition?.let { return it }

        // Otherwise use default room positioning
        val centerX = roomLayout.bounds.left + roomLayout.bounds.width / 2f
        val centerY = roomLayout.bounds.top + roomLayout.bounds.height / 2f
        
        if (total <= 1) return Offset(centerX, centerY)
        
        val angle = (index.toFloat() / total.toFloat()) * 2f * Math.PI.toFloat()
        val radius = 5f
        return Offset(
            centerX + Math.cos(angle.toDouble()).toFloat() * radius,
            centerY + Math.sin(angle.toDouble()).toFloat() * radius
        )
    }
}
