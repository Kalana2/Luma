package com.example.myapplication.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import coil.compose.AsyncImage
import coil.compose.rememberAsyncImagePainter
import com.example.myapplication.ui.pages_controllers.getUserData
import com.example.myapplication.ui.pages_controllers.model.*
import com.example.myapplication.ui.screens.HomeGraphDialog
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.*
import java.io.File
import java.text.SimpleDateFormat
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
    val logs = remember { mutableStateListOf<UserLog>() }

    var selectedDeviceId by remember { mutableStateOf<String?>(null) }
    var showLogsDialog by remember { mutableStateOf(false) }
    var showHomeGraph by remember { mutableStateOf(false) }

    LaunchedEffect(currentUser?.uid) {
        val uid = currentUser?.uid ?: run {
            isLoading = false
            return@LaunchedEffect
        }

        getUserData(uid) { user ->
            userDetails = user
        }

        // 1. Listen for Floors under the user
        database.child("users").child(uid).child("floors").addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                floors.clear()
                snapshot.children.forEach { child ->
                    val floor = child.getValue(Floor::class.java)?.copy(id = child.key ?: "")
                    if (floor != null) floors.add(floor)
                }
                isLoading = false
            }
            override fun onCancelled(error: DatabaseError) { isLoading = false }
        })

        // 2. Listen for Devices for this user
        database.child("devices").addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                devices.clear()
                snapshot.children.forEach { child ->
                    val device = child.getValue(Device::class.java)?.copy(id = child.key ?: "")
                    if (device != null && device.userId == uid) devices.add(device)
                }
            }
            override fun onCancelled(error: DatabaseError) {}
        })

        // 3. Listen for Logs (Reporting)
        database.child("userLogs").child(uid).limitToLast(20).addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                logs.clear()
                snapshot.children.forEach { child ->
                    val log = child.getValue(UserLog::class.java)
                    if (log != null) logs.add(log)
                }
                logs.reverse() // Most recent first
            }
            override fun onCancelled(error: DatabaseError) {}
        })
    }

    val groupedDevices = remember(floors.toList(), devices.toList()) {
        floors.map { floor ->
            val floorDeviceIds = floor.rooms.values.flatMap { it.devices.keys }.toSet()
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
    val context = LocalContext.current

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Luma", fontWeight = FontWeight.ExtraBold, fontSize = 22.sp) },
                navigationIcon = {
                    IconButton(onClick = onProfileClick) { UserAvatar(name = userDetails?.name) }
                },
                actions = {
                    IconButton(onClick = { showHomeGraph = true }) {
                        Icon(Icons.Default.Search, contentDescription = "Home Map")
                    }
                    IconButton(onClick = {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("http://www.lumaa.tk"))
                        context.startActivity(intent)
                    }) {
                        Icon(Icons.Default.Share, contentDescription = "Web Portal")
                    }
                    IconButton(onClick = { showLogsDialog = true }) {
                        Icon(Icons.Default.List, contentDescription = "Reports")
                    }
                    IconButton(onClick = onLogout) {
                        Icon(Icons.AutoMirrored.Filled.ExitToApp, contentDescription = "Logout")
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = Color.Transparent)
            )
        }
    ) { paddingValues ->
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(paddingValues).padding(horizontal = 16.dp),
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
                        text = "Smart Dashboard",
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
                            database.child("devices").child(device.id).updateChildren(mapOf("status" to newStatus, "state" to newStatus))
                        },
                        onDeviceClick = { selectedDeviceId = it.id }
                    )
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

    if (showLogsDialog) {
        LogsDialog(logs = logs, onDismiss = { showLogsDialog = false })
    }

    if (showHomeGraph) {
        HomeGraphDialog(floors = floors, devices = devices, onDismiss = { showHomeGraph = false })
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
    onToggle: (Device) -> Unit,
    onDeviceClick: (Device) -> Unit
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
                            DeviceCard(
                                device = device,
                                onToggle = { onToggle(device) },
                                onClick = { onDeviceClick(device) }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun DeviceCard(device: Device, onToggle: () -> Unit, onClick: () -> Unit) {
    val containerColor by animateColorAsState(
        targetValue = when {
            device.isError -> MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.8f)
            device.isDisconnected -> MaterialTheme.colorScheme.surfaceVariant
            device.isOn -> MaterialTheme.colorScheme.primaryContainer
            else -> MaterialTheme.colorScheme.surface
        },
        animationSpec = tween(250),
        label = "deviceContainerColor"
    )
    val iconColor by animateColorAsState(
        targetValue = when {
            device.isError -> MaterialTheme.colorScheme.error
            device.isDisconnected -> Color.Gray
            device.isOn -> MaterialTheme.colorScheme.primary
            else -> Color.Gray
        },
        animationSpec = tween(250),
        label = "deviceIconColor"
    )
    
    Card(
        modifier = Modifier.width(110.dp).height(120.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = containerColor),
        elevation = CardDefaults.cardElevation(defaultElevation = if (device.isOn) 4.dp else 0.dp),
        onClick = if (device.isDisconnected) ({}) else onClick
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            // Status Dot or Quick Toggle
            Box(
                modifier = Modifier.align(Alignment.TopEnd).padding(4.dp)
            ) {
                if (device.type != "camera" && device.type != "switchPanel" && !device.isDisconnected) {
                    Switch(
                        checked = device.isOn,
                        onCheckedChange = { onToggle() },
                        modifier = Modifier.scale(0.6f),
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = MaterialTheme.colorScheme.primary
                        )
                    )
                } else {
                    Box(
                        modifier = Modifier.padding(4.dp).size(8.dp).clip(CircleShape).background(
                            when {
                                device.isError -> Color.Red
                                device.isDisconnected -> Color.Gray
                                device.isOn -> Color(0xFF4CAF50)
                                else -> Color.Transparent
                            }
                        )
                    )
                }
            }

            Column(
                modifier = Modifier.fillMaxSize().padding(10.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = getDeviceIcon(device.type),
                    contentDescription = device.name,
                    tint = iconColor,
                    modifier = Modifier.size(28.dp)
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = device.name,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    maxLines = 2,
                    textAlign = TextAlign.Center,
                    overflow = TextOverflow.Ellipsis
                )
                if (device.isDisconnected) {
                    Text("Offline", fontSize = 8.sp, color = Color.Gray)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DeviceDetailDialog(
    device: Device,
    onDismiss: () -> Unit,
    onToggle: (Device, String) -> Unit,
    onToggleSwitch: (Device, String, String) -> Unit,
    onUpdateSchedule: (Device, String?, String?, Int?) -> Unit
) {
    var startTime by remember(device) { mutableStateOf(device.startTime ?: "") }
    var endTime by remember(device) { mutableStateOf(device.endTime ?: "") }
    var maxDur by remember(device) { mutableStateOf(device.maxDurationMinutes?.toString() ?: "") }
    var showScheduleEditor by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            shape = RoundedCornerShape(24.dp)
        ) {
            Column(modifier = Modifier.padding(24.dp).verticalScroll(rememberScrollState())) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(getDeviceIcon(device.type), contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(text = device.name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                }
                
                Spacer(modifier = Modifier.height(16.dp))

                // Camera Preview
                if (device.type == "camera" && device.lastSnapshotUrl != null) {
                    AsyncImage(
                        model = device.lastSnapshotUrl,
                        contentDescription = "Camera View",
                        modifier = Modifier.fillMaxWidth().height(180.dp).clip(RoundedCornerShape(12.dp)),
                        contentScale = ContentScale.Crop
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                }

                // Main Toggle or Multi-Switches
                if (device.type == "switchPanel" && device.switches != null) {
                    Text("Switches", style = MaterialTheme.typography.titleMedium)
                    device.switches.forEach { (sid, sstate) ->
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(sid.replaceFirstChar { it.uppercase() })
                            Switch(
                                checked = sstate == "ON",
                                onCheckedChange = { onToggleSwitch(device, sid, if (it) "ON" else "OFF") }
                            )
                        }
                    }
                } else {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Power", style = MaterialTheme.typography.titleMedium)
                        Switch(
                            checked = device.isOn,
                            onCheckedChange = { onToggle(device, if (it) "ON" else "OFF") }
                        )
                    }
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 16.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Safety & Scheduling", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                    IconButton(onClick = { showScheduleEditor = !showScheduleEditor }) {
                        Icon(if (showScheduleEditor) Icons.Default.Close else Icons.Default.Edit, contentDescription = "Edit Schedule", modifier = Modifier.size(20.dp))
                    }
                }

                if (showScheduleEditor) {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = startTime,
                            onValueChange = { startTime = it },
                            label = { Text("Start Time (HH:mm)") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = endTime,
                            onValueChange = { endTime = it },
                            label = { Text("End Time (HH:mm)") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = maxDur,
                            onValueChange = { maxDur = it },
                            label = { Text("Max On Duration (min)") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        Button(
                            onClick = {
                                onUpdateSchedule(device, startTime.ifBlank { null }, endTime.ifBlank { null }, maxDur.toIntOrNull())
                                showScheduleEditor = false
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Save Schedule")
                        }
                    }
                } else {
                    if (device.startTime != null) {
                        InfoRow(label = "Active Hours", value = "${device.startTime} - ${device.endTime}")
                    }
                    if (device.maxDurationMinutes != null) {
                        InfoRow(label = "Safety Cutoff", value = "${device.maxDurationMinutes} min max")
                    }
                    if (device.startTime == null && device.maxDurationMinutes == null) {
                        Text("No schedule set", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))
                Button(onClick = onDismiss, modifier = Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary)) {
                    Text("Close")
                }
            }
        }
    }
}

@Composable
fun InfoRow(label: String, value: String) {
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(text = label, style = MaterialTheme.typography.bodySmall, color = Color.Gray)
        Text(text = value, style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun LogsDialog(logs: List<UserLog>, onDismiss: () -> Unit) {
    val sdf = SimpleDateFormat("MMM dd, HH:mm", Locale.getDefault())
    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier.fillMaxWidth().fillMaxHeight(0.7f).padding(16.dp),
            shape = RoundedCornerShape(24.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text("Device Usage Reports", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(16.dp))
                LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(logs) { log ->
                        Column {
                            Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                                Text(log.event.replace("_", " ").uppercase(), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.secondary)
                                Text(sdf.format(Date(log.timestamp)), style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                            }
                            Text(log.device, fontWeight = FontWeight.Medium)
                            if (log.details.isNotEmpty()) {
                                Text(log.details.toString(), style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                            }
                            HorizontalDivider(modifier = Modifier.padding(top = 8.dp), thickness = 0.5.dp)
                        }
                    }
                }
            }
        }
    }
}
