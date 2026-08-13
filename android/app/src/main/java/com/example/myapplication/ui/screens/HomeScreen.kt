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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.example.myapplication.ui.pages_controllers.HomeViewModel
import com.example.myapplication.ui.pages_controllers.getUserData
import com.example.myapplication.ui.pages_controllers.model.*
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.delay
import java.io.File
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onLogout: () -> Unit, 
    onProfileClick: () -> Unit,
    homeViewModel: HomeViewModel = viewModel()
) {
    val auth = FirebaseAuth.getInstance()
    val currentUser = auth.currentUser
    var userDetails by remember { mutableStateOf<User?>(null) }
    
    val floors by homeViewModel.floors.collectAsState()
    val isDataLoading by homeViewModel.isLoading.collectAsState()
    var isUserLoading by remember { mutableStateOf(true) }

    LaunchedEffect(currentUser?.uid) {
        currentUser?.uid?.let { uid ->
            getUserData(uid) { user ->
                userDetails = user
                isUserLoading = false
            }
        } ?: run { isUserLoading = false }
    }

    val hour = remember { Calendar.getInstance().get(Calendar.HOUR_OF_DAY) }
    val (greeting, timeEmoji) = remember(hour) {
        when (hour) {
            in 0..11 -> "Good Morning" to "☀️"
            in 12..16 -> "Good Afternoon" to "🌤️"
            in 17..20 -> "Good Evening" to "🌇"
            else -> "Good Night" to "🌙"
        }
    }

    val totalDevices = remember(floors) { 
        floors.sumOf { floor -> floor.rooms.sumOf { it.devices.size } } 
    }
    val activeDevices = remember(floors) { 
        floors.sumOf { floor -> floor.rooms.sumOf { room -> room.devices.count { it.isOn } } } 
    }

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
                    IconButton(onClick = { /* Refresh logic */ }) {
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
        if (isUserLoading || isDataLoading) {
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

                if (floors.isEmpty()) {
                    item {
                        Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                            Text("No devices found", color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }

                items(floors, key = { it.name }) { floor ->
                    FloorSection(
                        floor = floor,
                        onToggle = { device ->
                            homeViewModel.toggleDevice(device.id, device.isOn)
                        },
                        onSwitchToggle = { deviceId, key, state ->
                            homeViewModel.toggleSwitch(deviceId, key, state)
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
    floor: FloorUI,
    onToggle: (DeviceUI) -> Unit,
    onSwitchToggle: (String, String, Boolean) -> Unit
) {
    var expanded by remember { mutableStateOf(true) }
    val devices = floor.rooms.flatMap { it.devices }
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
                    Text(text = floor.name, fontWeight = FontWeight.Bold, fontSize = 17.sp)
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
                    floor.rooms.forEach { room ->
                        if (room.devices.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = room.name,
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.primary,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                items(room.devices, key = { it.id }) { device ->
                                    DeviceCard(
                                        device = device, 
                                        onToggle = { onToggle(device) },
                                        onSwitchToggle = { key, state -> onSwitchToggle(device.id, key, state) }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun DeviceCard(
    device: DeviceUI, 
    onToggle: () -> Unit,
    onSwitchToggle: (String, Boolean) -> Unit
) {
    val isSwitchPanel = device.type.lowercase() == "switchpanel"
    val isCamera = device.type.lowercase() == "camera"
    val isIron = device.type.lowercase() == "iron"

    val containerColor by animateColorAsState(
        targetValue = when {
            device.isError -> MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.8f)
            device.isOn -> MaterialTheme.colorScheme.primaryContainer
            else -> MaterialTheme.colorScheme.surface
        },
        animationSpec = tween(250),
        label = "deviceContainerColor"
    )
    val iconColor by animateColorAsState(
        targetValue = when {
            device.isError -> MaterialTheme.colorScheme.error
            device.isOn -> MaterialTheme.colorScheme.primary
            else -> Color.Gray
        },
        animationSpec = tween(250),
        label = "deviceIconColor"
    )
    val scale by animateFloatAsState(
        targetValue = if (device.isOn && !device.isError) 1f else 0.96f,
        animationSpec = tween(200),
        label = "deviceScale"
    )

    Card(
        modifier = Modifier
            .width(if (isSwitchPanel) 160.dp else 118.dp)
            .height(128.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = containerColor),
        elevation = CardDefaults.cardElevation(defaultElevation = if (device.isOn && !device.isError) 4.dp else 0.dp),
        onClick = { if (!device.isError && !isSwitchPanel && !isCamera) onToggle() }
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            // Status/Indicators
            if (device.isError) {
                 Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = "Error",
                    tint = MaterialTheme.colorScheme.error,
                    modifier = Modifier.align(Alignment.TopEnd).padding(8.dp).size(16.dp)
                )
            } else if (!isSwitchPanel && !isCamera) {
                Box(
                    modifier = Modifier.align(Alignment.TopEnd).padding(8.dp).size(8.dp)
                        .clip(CircleShape).background(if (device.isOn) Color(0xFF4CAF50) else Color.Transparent)
                )
            }

            Column(
                modifier = Modifier.fillMaxSize().padding(8.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                if (isSwitchPanel) {
                    Text(text = device.name, fontSize = 11.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                    Spacer(modifier = Modifier.height(4.dp))
                    device.switches?.let { switches ->
                        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                            switches.forEach { (key, state) ->
                                Row(
                                    modifier = Modifier.fillMaxWidth().height(18.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(text = key, fontSize = 9.sp, maxLines = 1)
                                    Switch(
                                        checked = state,
                                        onCheckedChange = { onSwitchToggle(key, state) },
                                        modifier = Modifier.scale(0.4f),
                                        colors = SwitchDefaults.colors(
                                            checkedThumbColor = MaterialTheme.colorScheme.primary,
                                            checkedTrackColor = MaterialTheme.colorScheme.primaryContainer
                                        )
                                    )
                                }
                            }
                        }
                    }
                } else {
                    Icon(
                        imageVector = device.icon,
                        contentDescription = device.name,
                        tint = iconColor,
                        modifier = Modifier.size((28 * scale).dp)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = device.name,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        maxLines = 1,
                        textAlign = TextAlign.Center,
                        overflow = TextOverflow.Ellipsis
                    )
                    
                    if (device.isError) {
                        Text(text = "ERROR", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.error)
                    } else if (isCamera) {
                        Text(text = device.status, fontSize = 9.sp, color = MaterialTheme.colorScheme.primary)
                    } else if (isIron && device.isOn) {
                        IronCountdown(device.turnedOnAt, device.maxDurationMinutes)
                    }
                }
            }
        }
    }
}

@Composable
fun IronCountdown(turnedOnAt: Long?, maxDuration: Int?) {
    if (turnedOnAt == null || maxDuration == null || turnedOnAt <= 0) return
    
    var remainingText by remember { mutableStateOf("--:--") }
    
    LaunchedEffect(turnedOnAt, maxDuration) {
        val endTime = turnedOnAt + (maxDuration * 60 * 1000L)
        while (true) {
            val now = System.currentTimeMillis()
            val diff = endTime - now
            if (diff <= 0) {
                remainingText = "00:00"
                break
            }
            val mins = (diff / 60000)
            val secs = (diff % 60000) / 1000
            remainingText = String.format(Locale.getDefault(), "%02d:%02d", mins, secs)
            delay(1000)
        }
    }
    
    Text(
        text = remainingText,
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(top = 2.dp)
    )
}
