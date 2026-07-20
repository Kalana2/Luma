package com.example.myapplication.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.myapplication.ui.pages_controllers.getUserData
import com.example.myapplication.ui.pages_controllers.model.User
import com.example.myapplication.ui.pages_controllers.model.Floor
import com.example.myapplication.ui.pages_controllers.model.Device
import com.example.myapplication.ui.pages_controllers.model.Room
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.*
import java.io.File
import java.util.*

fun getDeviceIcon(type: String): ImageVector {
    return when (type.lowercase()) {
        "light" -> Icons.Default.Star
        "lock" -> Icons.Default.Lock
        "ac" -> Icons.Default.Settings
        "fan" -> Icons.Default.Refresh
        "plug", "outlet" -> Icons.Default.Settings
        "iron" -> Icons.Default.Warning
        "camera" -> Icons.Default.CheckCircle
        "switchpanel" -> Icons.Default.List
        else -> Icons.Default.Star
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(onLogout: () -> Unit, onProfileClick: () -> Unit) {
    val auth = FirebaseAuth.getInstance()
    val currentUser = auth.currentUser
    val dbUrl = "https://lumaa-2590d-default-rtdb.asia-southeast1.firebasedatabase.app"
    val database = FirebaseDatabase.getInstance(dbUrl).reference
    
    var userDetails by remember { mutableStateOf<User?>(null) }
    var isLoading by remember { mutableStateOf(true) }

    val floors = remember { mutableStateListOf<Floor>() }
    val devices = remember { mutableStateListOf<Device>() }

    LaunchedEffect(currentUser?.uid) {
        val uid = currentUser?.uid ?: run {
            isLoading = false
            return@LaunchedEffect
        }

        getUserData(uid) { user ->
            userDetails = user
        }

        // 1. Listen for Floors under the user
        val floorsRef = database.child("users").child(uid).child("floors")
        val floorsListener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                floors.clear()
                snapshot.children.forEach { child ->
                    val floor = child.getValue(Floor::class.java)?.copy(id = child.key ?: "")
                    if (floor != null) {
                        floors.add(floor)
                    }
                }
                isLoading = false
            }
            override fun onCancelled(error: DatabaseError) {
                isLoading = false
            }
        }
        floorsRef.addValueEventListener(floorsListener)

        // 2. Listen for all Devices for this user
        val devicesRef = database.child("devices")
        val devicesListener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                devices.clear()
                snapshot.children.forEach { child ->
                    val device = child.getValue(Device::class.java)?.copy(id = child.key ?: "")
                    if (device != null && device.userId == uid) {
                        devices.add(device)
                    }
                }
            }
            override fun onCancelled(error: DatabaseError) {}
        }
        devicesRef.addValueEventListener(devicesListener)
    }

    // Mapping floors to their devices based on room associations
    val groupedDevices = remember(floors.toList(), devices.toList()) {
        floors.map { floor ->
            // Collect all device IDs mentioned in this floor's rooms
            val floorDeviceIds = floor.rooms.values.flatMap { it.devices.keys }.toSet()
            // Filter devices that belong to this floor
            floor to devices.filter { it.id in floorDeviceIds }
        }
    }

    val hour = remember { Calendar.getInstance().get(Calendar.HOUR_OF_DAY) }
    val (greeting, timeEmoji) = remember(hour) {
        when (hour) {
            in 0..11 -> "Good Morning" to "☀️"
            in 12..16 -> "Good Afternoon" to "🌤️"
            in 17..24 -> "Good Evening" to "🌙"
            else -> "Good Night" to "🌙"
        }
    }

    val totalDevices = devices.size
    val activeDevices = devices.count { it.isOn }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        "Luma",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 22.sp
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onProfileClick) {
                        UserAvatar(name = userDetails?.name)
                    }
                },
                actions = {
                    IconButton(onClick = { /* Sync logic */ }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Sync")
                    }
                    IconButton(onClick = onLogout) {
                        Icon(Icons.AutoMirrored.Filled.ExitToApp, contentDescription = "Logout")
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = Color.Transparent
                )
            )
        }
    ) { paddingValues ->
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp),
                contentPadding = PaddingValues(top = 8.dp, bottom = 24.dp)
            ) {
                item {
                    WelcomeCard(
                        greeting = greeting,
                        timeEmoji = timeEmoji,
                        name = userDetails?.name ?: "there",
                        totalDevices = totalDevices,
                        activeDevices = activeDevices
                    )
                }

                item {
                    Text(
                        text = "My Devices",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                items(groupedDevices, key = { it.first.id }) { (floor, floorDevices) ->
                    FloorSection(
                        floorName = floor.name,
                        devices = floorDevices,
                        onToggle = { device ->
                            val newStatus = if (device.isOn) "OFF" else "ON"
                            database.child("devices").child(device.id).child("status").setValue(newStatus)
                            database.child("devices").child(device.id).child("state").setValue(newStatus)
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun UserAvatar(name: String?, size: androidx.compose.ui.unit.Dp = 36.dp) {
    val initial = name?.trim()?.firstOrNull()?.uppercaseChar()?.toString() ?: "?"
    Box(
        modifier = Modifier
            .size(size)
            .clip(CircleShape)
            .background(
                Brush.linearGradient(
                    listOf(MaterialTheme.colorScheme.primary, MaterialTheme.colorScheme.tertiary)
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = initial,
            color = MaterialTheme.colorScheme.onPrimary,
            fontWeight = FontWeight.Bold,
            fontSize = (size.value * 0.42f).sp
        )
    }
}

@Composable
fun WelcomeCard(
    greeting: String,
    timeEmoji: String,
    name: String,
    totalDevices: Int,
    activeDevices: Int
) {
    val logoPath = "D:/Education/3 Year 1st Sem/Mobile App Development/assinment/lumaa/Luma/android/app/src/main/java/com/example/myapplication/ui/src/ChatGPT Image Jul 10, 2026, 10_22_11 PM.png"
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(28.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.linearGradient(
                        listOf(
                            MaterialTheme.colorScheme.primaryContainer,
                            MaterialTheme.colorScheme.tertiaryContainer.copy(alpha = 0.6f)
                        )
                    )
                )
                .padding(22.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = timeEmoji, fontSize = 22.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = greeting,
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                        )
                    }
                    Text(
                        text = name,
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.ExtraBold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )

                    Spacer(modifier = Modifier.height(18.dp))

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(18.dp))
                            .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.55f))
                            .padding(vertical = 12.dp, horizontal = 8.dp),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        StatChip(label = "Devices", value = totalDevices.toString(), icon = Icons.Default.Info)
                        StatDivider()
                        StatChip(label = "Active", value = activeDevices.toString(), icon = Icons.Default.CheckCircle)
                    }
                }
                
                Spacer(modifier = Modifier.width(16.dp))
                
                // App Logo
                AsyncImage(
                    model = File(logoPath),
                    contentDescription = "App Logo",
                    modifier = Modifier
                        .size(90.dp)
                        .clip(RoundedCornerShape(20.dp)),
                    contentScale = ContentScale.Crop
                )
            }
        }
    }
}

@Composable
fun StatChip(label: String, value: String, icon: ImageVector) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(
            icon,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(18.dp)
        )
        Spacer(modifier = Modifier.width(6.dp))
        Column {
            Text(text = value, fontWeight = FontWeight.Bold, fontSize = 15.sp)
            Text(
                text = label,
                fontSize = 11.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun StatDivider() {
    Box(
        modifier = Modifier
            .height(28.dp)
            .width(1.dp)
            .background(MaterialTheme.colorScheme.outlineVariant)
    )
}

@Composable
fun FloorSection(
    floorName: String,
    devices: List<Device>,
    onToggle: (Device) -> Unit
) {
    var expanded by remember { mutableStateOf(true) }
    val activeCount = devices.count { it.isOn }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(text = floorName, fontWeight = FontWeight.Bold, fontSize = 17.sp)
                    Text(
                        text = if (activeCount > 0) "$activeCount of ${devices.size} on" else "All off",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                IconButton(onClick = { expanded = !expanded }) {
                    Icon(
                        imageVector = if (expanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                        contentDescription = if (expanded) "Collapse" else "Expand"
                    )
                }
            }

            AnimatedVisibility(
                visible = expanded,
                enter = fadeIn() + expandVertically(),
                exit = fadeOut() + shrinkVertically()
            ) {
                Column {
                    Spacer(modifier = Modifier.height(12.dp))
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        items(devices, key = { it.id }) { device ->
                            DeviceCard(device = device, onToggle = { onToggle(device) })
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun DeviceCard(device: Device, onToggle: () -> Unit) {
    val containerColor by animateColorAsState(
        targetValue = if (device.isOn)
            MaterialTheme.colorScheme.primaryContainer
        else
            MaterialTheme.colorScheme.surface,
        animationSpec = tween(250),
        label = "deviceContainerColor"
    )
    val iconColor by animateColorAsState(
        targetValue = if (device.isOn) MaterialTheme.colorScheme.primary else Color.Gray,
        animationSpec = tween(250),
        label = "deviceIconColor"
    )
    val scale by animateFloatAsState(
        targetValue = if (device.isOn) 1f else 0.96f,
        animationSpec = tween(200),
        label = "deviceScale"
    )

    Card(
        modifier = Modifier
            .width(108.dp)
            .height(112.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = containerColor),
        elevation = CardDefaults.cardElevation(defaultElevation = if (device.isOn) 4.dp else 0.dp),
        onClick = onToggle
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(8.dp)
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(if (device.isOn) Color(0xFF4CAF50) else Color.Transparent)
            )

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(10.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = getDeviceIcon(device.type),
                    contentDescription = device.name,
                    tint = iconColor,
                    modifier = Modifier.size((28 * scale).dp)
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = device.name,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    maxLines = 2,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}
