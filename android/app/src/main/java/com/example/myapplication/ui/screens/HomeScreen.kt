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
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.gestures.rememberTransformableState
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.gestures.rememberTransformableState
import androidx.compose.foundation.gestures.transformable
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.unit.IntOffset
import com.example.myapplication.ui.pages_controllers.HomeViewModel
import com.example.myapplication.ui.pages_controllers.getUserData
import com.example.myapplication.ui.pages_controllers.model.*
import kotlin.math.roundToInt
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.delay
import java.io.File
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onLogout: () -> Unit, 
    onProfileClick: () -> Unit,
    onLogsClick: () -> Unit,
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

    var showVirtualDashboard by remember { mutableStateOf(false) }
    var selectedDeviceForControl by remember { mutableStateOf<DeviceUI?>(null) }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val controlSheetState = rememberModalBottomSheetState()

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        "Lumaa",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 22.sp
                    )
                },
                navigationIcon = {
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(start = 4.dp)) {
                        IconButton(onClick = onProfileClick) {
                            UserAvatar(name = userDetails?.name)
                        }
                        IconButton(onClick = onLogsClick) {
                            Icon(Icons.Default.History, contentDescription = "Logs")
                        }
                    }
                },
                actions = {
                    IconButton(onClick = { showVirtualDashboard = true }) {
                        Icon(Icons.Default.Dashboard, contentDescription = "Virtual Dashboard")
                    }
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
            if (showVirtualDashboard) {
                ModalBottomSheet(
                    onDismissRequest = { showVirtualDashboard = false },
                    sheetState = sheetState,
                    dragHandle = { BottomSheetDefaults.DragHandle() },
                    containerColor = MaterialTheme.colorScheme.surface,
                ) {
                    VirtualDashboard(
                        floors = floors,
                        onToggle = { device -> homeViewModel.toggleDevice(device.id, device.isOn) },
                        onClose = { showVirtualDashboard = false }
                    )
                }
            }

            if (selectedDeviceForControl != null) {
                ModalBottomSheet(
                    onDismissRequest = { selectedDeviceForControl = null },
                    sheetState = controlSheetState,
                    containerColor = MaterialTheme.colorScheme.surface,
                    dragHandle = { BottomSheetDefaults.DragHandle() }
                ) {
                    DeviceControlPanel(
                        device = selectedDeviceForControl!!,
                        onToggle = { 
                            homeViewModel.toggleDevice(selectedDeviceForControl!!.id, selectedDeviceForControl!!.isOn)
                            selectedDeviceForControl = selectedDeviceForControl?.copy(isOn = !selectedDeviceForControl!!.isOn)
                        },
                        onClose = { selectedDeviceForControl = null }
                    )
                }
            }
            
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
                    AlertsSection(floors = floors)
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
                        onDeviceClick = { device ->
                            selectedDeviceForControl = device
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
fun AlertsSection(floors: List<FloorUI>) {
    val offlineDevices = remember(floors) {
        val list = mutableListOf<Pair<DeviceUI, String>>()
        floors.forEach { floor ->
            floor.rooms.forEach { room ->
                room.devices.filter { it.isError }.forEach { device ->
                    list.add(device to "${room.name}, ${floor.name}")
                }
            }
        }
        list
    }

    if (offlineDevices.isNotEmpty()) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.7f)
            ),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Warning,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.error,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Issues Detected",
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onErrorContainer
                    )
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                offlineDevices.forEach { (device, location) ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(6.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.error)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = "${device.name} is Offline",
                                style = MaterialTheme.typography.bodySmall,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = location,
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
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
    onDeviceClick: (DeviceUI) -> Unit,
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
                                        onCardClick = { onDeviceClick(device) },
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
    onCardClick: () -> Unit,
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
        onClick = { 
            if (!device.isError) {
                if (isCamera || isSwitchPanel) {
                    onCardClick()
                } else {
                    onToggle()
                }
            }
        }
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
                        Text(text = "OFFLINE", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.error)
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VirtualDashboard(
    floors: List<FloorUI>,
    onToggle: (DeviceUI) -> Unit,
    onClose: () -> Unit
) {
    var selectedFloorIndex by remember { mutableIntStateOf(0) }
    val selectedFloor = floors.getOrNull(selectedFloorIndex)
    
    var selectedDevice by remember { mutableStateOf<DeviceUI?>(null) }
    val controlSheetState = rememberModalBottomSheetState()
    
    // Track custom device positions locally in this session
    val customPositions = remember { mutableStateMapOf<String, Offset>() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.surface)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    "Virtual Home View",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
                if (selectedFloor != null) {
                    val onlineCount = selectedFloor.rooms.flatMap { it.devices }.count { it.isOn && !it.isError }
                    Text(
                        "$onlineCount Devices Active",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
            IconButton(onClick = onClose) {
                Icon(Icons.Default.Close, contentDescription = "Close")
            }
        }

        // Floor Selector
        if (floors.isNotEmpty()) {
            ScrollableTabRow(
                selectedTabIndex = selectedFloorIndex,
                edgePadding = 16.dp,
                containerColor = Color.Transparent,
                divider = {},
                indicator = { tabPositions ->
                    if (selectedFloorIndex < tabPositions.size) {
                        TabRowDefaults.SecondaryIndicator(
                            Modifier.tabIndicatorOffset(tabPositions[selectedFloorIndex]),
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            ) {
                floors.forEachIndexed { index, floor ->
                    Tab(
                        selected = selectedFloorIndex == index,
                        onClick = { selectedFloorIndex = index },
                        text = {
                            Text(
                                floor.name,
                                fontWeight = if (selectedFloorIndex == index) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Floor Plan Canvas Area
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(16.dp)
                .clip(RoundedCornerShape(24.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
        ) {
            if (selectedFloor != null) {
                FloorPlanView(
                    floor = selectedFloor,
                    customPositions = customPositions,
                    onDeviceClick = { selectedDevice = it },
                    onDevicePositionChanged = { id, pos -> customPositions[id] = pos }
                )
            } else {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No floor data available")
                }
            }
        }
    }

    // Device Control Bottom Sheet
    if (selectedDevice != null) {
        val currentDeviceId = selectedDevice!!.id
        ModalBottomSheet(
            onDismissRequest = { selectedDevice = null },
            sheetState = controlSheetState,
            containerColor = MaterialTheme.colorScheme.surface,
            dragHandle = { BottomSheetDefaults.DragHandle() }
        ) {
            DeviceControlPanel(
                device = selectedDevice!!.copy(customPosition = customPositions[currentDeviceId]),
                onToggle = { 
                    onToggle(selectedDevice!!)
                    selectedDevice = selectedDevice?.copy(isOn = !selectedDevice!!.isOn)
                },
                onClose = { selectedDevice = null }
            )
        }
    }
}

@Composable
fun FloorPlanView(
    floor: FloorUI,
    customPositions: Map<String, Offset>,
    onDeviceClick: (DeviceUI) -> Unit,
    onDevicePositionChanged: (String, Offset) -> Unit
) {
    var scale by remember { mutableFloatStateOf(1f) }
    var offset by remember { mutableStateOf(Offset.Zero) }
    val state = rememberTransformableState { zoomChange, offsetChange, _ ->
        scale *= zoomChange
        offset += offsetChange
    }

    var parentWidth by remember { mutableFloatStateOf(0f) }
    var parentHeight by remember { mutableFloatStateOf(0f) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .onGloballyPositioned { coordinates ->
                parentWidth = coordinates.size.width.toFloat()
                parentHeight = coordinates.size.height.toFloat()
            }
            .transformable(state = state)
            .pointerInput(Unit) {
                detectTransformGestures { _, pan, zoom, _ ->
                    scale *= zoom
                    offset += pan
                }
            }
    ) {
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .graphicsLayer(
                    scaleX = scale.coerceIn(0.5f, 3f),
                    scaleY = scale.coerceIn(0.5f, 3f),
                    translationX = offset.x,
                    translationY = offset.y
                )
        ) {
            val gridUnit = Math.min(size.width, size.height) / 100f

            floor.rooms.forEach { room ->
                val layout = FloorPlanMetadata.getLayoutForRoom(room.name, floor.name)
                val rect = Rect(
                    layout.bounds.left * gridUnit,
                    layout.bounds.top * gridUnit,
                    layout.bounds.right * gridUnit,
                    layout.bounds.bottom * gridUnit
                )

                // Draw Room Background (Color)
                drawRect(
                    color = layout.color.copy(alpha = 0.3f),
                    topLeft = rect.topLeft,
                    size = rect.size
                )

                // Draw Room Walls
                drawPath(
                    path = Path().apply {
                        moveTo(rect.left, rect.top)
                        lineTo(rect.right, rect.top)
                        lineTo(rect.right, rect.bottom)
                        lineTo(rect.left, rect.bottom)
                        close()
                    },
                    color = Color.LightGray.copy(alpha = 0.8f),
                    style = Stroke(width = 2.dp.toPx())
                )
            }
        }

        // Overlay for Labels and Devices
        Box(
            modifier = Modifier
                .fillMaxSize()
                .graphicsLayer(
                    scaleX = scale.coerceIn(0.5f, 3f),
                    scaleY = scale.coerceIn(0.5f, 3f),
                    translationX = offset.x,
                    translationY = offset.y
                )
        ) {
            if (parentWidth > 0) {
                floor.rooms.forEach { room ->
                    val layout = FloorPlanMetadata.getLayoutForRoom(room.name, floor.name)
                    
                    // Room Label
                    Text(
                        text = room.name,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f),
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.offset {
                            IntOffset(
                                (layout.bounds.left * (parentWidth / 100f)).roundToInt() + 8,
                                (layout.bounds.top * (parentHeight / 100f)).roundToInt() + 8
                            )
                        }
                    )

                    // Devices in this room
                    room.devices.forEachIndexed { index, device ->
                        val deviceWithPos = device.copy(customPosition = customPositions[device.id])
                        val pos = FloorPlanMetadata.getDevicePosition(deviceWithPos, layout, index, room.devices.size)
                        
                        DeviceNode(
                            device = deviceWithPos,
                            modifier = Modifier.offset {
                                IntOffset(
                                    (pos.x * (parentWidth / 100f)).roundToInt() - 20,
                                    (pos.y * (parentHeight / 100f)).roundToInt() - 20
                                )
                            },
                            onClick = { onDeviceClick(device) },
                            onDrag = { dragAmount ->
                                val deltaX = dragAmount.x / (parentWidth / 100f)
                                val deltaY = dragAmount.y / (parentHeight / 100f)
                                onDevicePositionChanged(device.id, Offset(pos.x + deltaX, pos.y + deltaY))
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun DeviceNode(
    device: DeviceUI,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
    onDrag: (Offset) -> Unit = {}
) {
    val isOn = device.isOn && !device.isError
    val glowColor by animateColorAsState(
        targetValue = if (isOn) Color(0xFFFFD700).copy(alpha = 0.5f) else Color.Transparent,
        animationSpec = tween(1000)
    )

    Box(
        modifier = modifier
            .size(40.dp)
            .clip(CircleShape)
            .background(
                if (isOn) Color(0xFFFFF9C4) else MaterialTheme.colorScheme.surface,
            )
            .then(
                if (isOn) Modifier.background(glowColor, CircleShape) else Modifier
            )
            .pointerInput(device.id) {
                detectDragGestures(
                    onDragStart = { /* Optional */ },
                    onDrag = { change, dragAmount ->
                        change.consume()
                        onDrag(dragAmount)
                    }
                )
            }
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = device.icon,
            contentDescription = device.name,
            modifier = Modifier.size(24.dp),
            tint = when {
                device.isError -> MaterialTheme.colorScheme.error
                isOn -> Color(0xFFFBC02D)
                else -> MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
            }
        )
        
        if (device.isError) {
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.error)
            )
        }
    }
}

@Composable
fun DeviceControlPanel(
    device: DeviceUI,
    onToggle: () -> Unit,
    onClose: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        if (device.type.lowercase() == "camera") {
            val snapshotUrl = device.snapshotUrl ?: "https://picsum.photos/seed/${device.id}-default/640/480"
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(220.dp),
                shape = RoundedCornerShape(24.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
            ) {
                AsyncImage(
                    model = snapshotUrl,
                    contentDescription = "Camera Stream",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
        } else {
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(24.dp))
                    .background(if (device.isOn) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = device.icon,
                    contentDescription = null,
                    modifier = Modifier.size(40.dp),
                    tint = if (device.isOn) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(device.name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        Text(
            if (device.isError) "Offline" else if (device.isOn) "Active" else "Idle",
            style = MaterialTheme.typography.bodyMedium,
            color = if (device.isError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        // Control Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Power", fontWeight = FontWeight.Bold)
                        Text(if (device.isOn) "Device is ON" else "Device is OFF", style = MaterialTheme.typography.labelSmall)
                    }
                    Switch(
                        checked = device.isOn,
                        onCheckedChange = { if (!device.isError) onToggle() },
                        enabled = !device.isError
                    )
                }
                
                if (device.type.lowercase() == "light" && device.isOn) {
                    Spacer(modifier = Modifier.height(24.dp))
                    Text("Brightness", fontWeight = FontWeight.Bold)
                    var brightness by remember { mutableFloatStateOf(0.7f) }
                    Slider(
                        value = brightness,
                        onValueChange = { brightness = it },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Button(
            onClick = onClose,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp)
        ) {
            Text("Done")
        }
        
        Spacer(modifier = Modifier.height(16.dp))
    }
}


