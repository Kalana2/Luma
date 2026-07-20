package com.example.myapplication.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.myapplication.ui.pages_controllers.model.Device
import com.example.myapplication.ui.pages_controllers.model.Floor
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FloorDetailsScreen(floorId: String, onBackClick: () -> Unit) {
    val auth = FirebaseAuth.getInstance()
    val uid = auth.currentUser?.uid ?: ""
    val database = FirebaseDatabase.getInstance("https://lumaa-2590d-default-rtdb.asia-southeast1.firebasedatabase.app").reference
    val devices = remember { mutableStateListOf<Device>() }
    var floorName by remember { mutableStateOf("Floor Details") }
    var floorPlanUrl by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var selectedDeviceId by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(floorId, uid) {
        if (uid.isEmpty()) {
            isLoading = false
            return@LaunchedEffect
        }

        // 1. Listen for Floor Data
        database.child("users").child(uid).child("floors").child(floorId).addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val floor = snapshot.getValue(Floor::class.java)
                floorName = floor?.name ?: "Floor Details"
                floorPlanUrl = floor?.planImageUrl
                
                val floorDeviceIds = floor?.rooms?.values?.flatMap { it.devices.keys }?.toSet() ?: emptySet()

                // 2. Fetch all Devices and filter
                database.child("devices").addValueEventListener(object : ValueEventListener {
                    override fun onDataChange(devSnapshot: DataSnapshot) {
                        devices.clear()
                        devSnapshot.children.forEach { child ->
                            val device = child.getValue(Device::class.java)?.copy(id = child.key ?: "")
                            if (device != null && device.id in floorDeviceIds) {
                                devices.add(device)
                            }
                        }
                        isLoading = false
                    }
                    override fun onCancelled(error: DatabaseError) { isLoading = false }
                })
            }
            override fun onCancelled(error: DatabaseError) { isLoading = false }
        })
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(floorName) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) { Icon(Icons.Default.ArrowBack, contentDescription = "Back") }
                }
            )
        }
    ) { paddingValues ->
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        } else {
            Column(modifier = Modifier.fillMaxSize().padding(paddingValues)) {
                // "Floor Plan Layout" Requirement
                if (floorPlanUrl != null) {
                    Box(modifier = Modifier.fillMaxWidth().height(200.dp).padding(16.dp)) {
                        AsyncImage(
                            model = floorPlanUrl,
                            contentDescription = "Floor Plan",
                            modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(12.dp)),
                            contentScale = ContentScale.Fit
                        )
                        Text(
                            "Floor Layout Overview",
                            modifier = Modifier.align(Alignment.BottomStart).padding(8.dp).background(Color.Black.copy(0.6f)).padding(4.dp),
                            color = Color.White,
                            fontSize = 10.sp
                        )
                    }
                }

                if (devices.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("No devices found for this floor")
                    }
                } else {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        modifier = Modifier.fillMaxSize().padding(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        items(devices) { device ->
                            DeviceCard(
                                device = device,
                                onToggle = {
                                    val newStatus = if (device.isOn) "OFF" else "ON"
                                    database.child("devices").child(device.id).updateChildren(mapOf("status" to newStatus, "state" to newStatus))
                                },
                                onClick = { selectedDeviceId = device.id }
                            )
                        }
                    }
                }
            }
        }
    }

    selectedDeviceId?.let { deviceId ->
        val device = devices.find { it.id == deviceId }
        if (device != null) {
            DeviceDetailDialog(
                device = device,
                onDismiss = { selectedDeviceId = null },
                onToggle = { dev, newStatus ->
                    database.child("devices").child(dev.id).updateChildren(mapOf("status" to newStatus, "state" to newStatus))
                },
                onToggleSwitch = { dev, switchId, newStatus ->
                    database.child("devices").child(dev.id).child("switches").child(switchId).setValue(newStatus)
                },
                onUpdateSchedule = { dev, start, end, maxDur ->
                    val updates = mutableMapOf<String, Any?>()
                    updates["startTime"] = start
                    updates["endTime"] = end
                    updates["maxDurationMinutes"] = maxDur
                    database.child("devices").child(dev.id).updateChildren(updates)
                }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DeviceCardSimple(device: Device, onToggle: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().height(100.dp),
        onClick = onToggle,
        colors = CardDefaults.cardColors(
            containerColor = if (device.isOn) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier.fillMaxSize().padding(12.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = device.name, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = if (device.isOn) "ON" else "OFF", style = MaterialTheme.typography.bodySmall)
        }
    }
}
