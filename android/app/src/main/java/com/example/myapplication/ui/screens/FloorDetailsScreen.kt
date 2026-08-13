package com.example.myapplication.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Iron
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Power
import androidx.compose.material.icons.filled.TouchApp
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener

private val LumaPrimary = Color(0xFF7B88FF)
private val LumaBackground = Color(0xFFF5F7FB)

data class Device(
    val id: String = "",
    val name: String = "",
    val type: String = "",
    val status: String = "OFF"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FloorDetailsScreen(floorId: String, onBackClick: () -> Unit, onCameraClick: (String) -> Unit) {
    var floorName by remember { mutableStateOf("Floor Details") }
    var devices by remember { mutableStateOf<List<Device>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }

    val auth = FirebaseAuth.getInstance()
    val userId = auth.currentUser?.uid
    val dbUrl = "https://lumaa-2590d-default-rtdb.asia-southeast1.firebasedatabase.app"
    val database = FirebaseDatabase.getInstance(dbUrl).reference

    LaunchedEffect(floorId, userId) {
        if (userId == null) {
            loading = false
            return@LaunchedEffect
        }
        val floorRef = database.child("users").child(userId).child("floors").child(floorId)
        floorRef.get().addOnSuccessListener { floorSnapshot ->
            floorName = floorSnapshot.child("name").value as? String ?: "Floor Details"
            val deviceIds = mutableListOf<String>()
            floorSnapshot.child("rooms").children.forEach { room ->
                room.child("devices").children.forEach { device ->
                    deviceIds.add(device.key ?: "")
                }
            }
            if (deviceIds.isEmpty()) {
                devices = emptyList()
                loading = false
                return@addOnSuccessListener
            }
            val deviceRef = database.child("devices")
            deviceRef.get().addOnSuccessListener { devicesSnapshot ->
                devices = deviceIds.mapNotNull { id ->
                    val child = devicesSnapshot.child(id)
                    if (!child.exists()) {
                        null
                    } else {
                        Device(
                            id = id,
                            name = child.child("name").value as? String ?: "Device",
                            type = child.child("type").value as? String ?: "",
                            status = child.child("status").value as? String ?: "OFF"
                        )
                    }
                }
                loading = false
            }.addOnFailureListener { loading = false }
        }.addOnFailureListener { loading = false }
    }

    Scaffold(
        containerColor = LumaBackground,
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = floorName,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF2D3243)
                        )
                        Text(
                            text = "Smart Devices",
                            fontSize = 11.sp,
                            color = Color.Gray
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = LumaBackground)
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 20.dp)
        ) {
            when {
                loading -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center),
                        color = LumaPrimary
                    )
                }

                devices.isEmpty() -> {
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.Power,
                            contentDescription = null,
                            tint = Color.Gray,
                            modifier = Modifier.size(56.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "No devices found",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF2D3243)
                        )
                    }
                }

                else -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        contentPadding = PaddingValues(vertical = 8.dp)
                    ) {
                        items(devices) { device ->
                            DeviceRow(
                                device = device,
                                onClick = {
                                    if (device.type == "camera") {
                                        onCameraClick(device.id)
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DeviceRow(device: Device, onClick: (Device) -> Unit) {
    val isCamera = device.type == "camera"
    val icon = deviceIcon(device.type)
    val accent = if (isCamera) Color(0xFF059669) else LumaPrimary
    Card(
        onClick = { onClick(device) },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(accent.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = accent,
                    modifier = Modifier.size(24.dp)
                )
            }
            Spacer(modifier = Modifier.width(14.dp))
            Column {
                Text(
                    text = device.name,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF2D3243)
                )
                Text(
                    text = if (isCamera) device.status else if (device.status == "ON") "ON" else "OFF",
                    fontSize = 12.sp,
                    color = Color.Gray
                )
            }
            Spacer(modifier = Modifier.weight(1f))
            if (isCamera) {
                Text(
                    text = "View Feed",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = accent
                )
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = null,
                    tint = accent,
                    modifier = Modifier
                        .size(16.dp)
                        .rotate(180f)
                )
            }
        }
    }
}

private fun deviceIcon(type: String): ImageVector {
    return when (type) {
        "light" -> Icons.Default.Lightbulb
        "outlet", "switchPanel" -> Icons.Default.Power
        "iron" -> Icons.Default.Iron
        "camera" -> Icons.Default.Videocam
        else -> Icons.Default.TouchApp
    }
}