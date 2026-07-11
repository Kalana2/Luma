package com.example.myapplication.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.*
import kotlinx.coroutines.launch
import java.util.*

data class Floor(
    val id: String = "",
    val name: String = "",
    val iconName: String = "Home",
    val roomCount: Int = 0,
    val activeDevices: Int = 0,
    val isOn: Boolean = false
)

private val LumaPrimary = Color(0xFF7B88FF)
private val LumaBackground = Color(0xFFF5F7FB)
private val LumaCardBg = Color(0xFFFFFFFF)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onLogout: () -> Unit,
    onFloorClick: (String) -> Unit
) {
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    var userName by remember { mutableStateOf("User") }
    var floors by remember { mutableStateOf<List<Floor>>(emptyList()) }
    var showAddFloorDialog by remember { mutableStateOf(false) }
    var floorToEdit by remember { mutableStateOf<Floor?>(null) }
    var selectedCategoryIndex by remember { mutableStateOf(0) }

    val auth = FirebaseAuth.getInstance()
    val userId = auth.currentUser?.uid
    val dbUrl = "https://lumaa-2590d-default-rtdb.asia-southeast1.firebasedatabase.app"
    val database = FirebaseDatabase.getInstance(dbUrl).reference

    // Fetch User Name
    LaunchedEffect(userId) {
        if (userId != null) {
            database.child("users").child(userId).child("name").get().addOnSuccessListener {
                userName = it.value as? String ?: "User"
            }
        }
    }

    // Fetch Floors
    LaunchedEffect(userId) {
        if (userId != null) {
            val floorsRef = database.child("users").child(userId).child("floors")
            floorsRef.addValueEventListener(object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val floorsList = mutableListOf<Floor>()
                    snapshot.children.forEach { child ->
                        val floor = child.getValue(Floor::class.java)
                        if (floor != null) {
                            floorsList.add(floor.copy(id = child.key ?: ""))
                        }
                    }
                    floors = floorsList
                }

                override fun onCancelled(error: DatabaseError) {}
            })
        }
    }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet {
                Spacer(modifier = Modifier.height(16.dp))
                NavigationDrawerItem(
                    label = { Text("Profile") },
                    selected = false,
                    onClick = { /* TODO */ },
                    icon = { Icon(Icons.Default.Person, contentDescription = null) }
                )
                NavigationDrawerItem(
                    label = { Text("Settings") },
                    selected = false,
                    onClick = { /* TODO */ },
                    icon = { Icon(Icons.Default.Settings, contentDescription = null) }
                )
                NavigationDrawerItem(
                    label = { Text("Logout") },
                    selected = false,
                    onClick = {
                        auth.signOut()
                        onLogout()
                    },
                    icon = { Icon(Icons.Default.ExitToApp, contentDescription = null) }
                )
            }
        }
    ) {
        Box(modifier = Modifier.fillMaxSize().background(LumaBackground)) {
            Scaffold(
                containerColor = Color.Transparent,
                topBar = {
                    TopAppBar(
                        title = { },
                        navigationIcon = {
                            IconButton(onClick = { scope.launch { drawerState.open() } }) {
                                Icon(Icons.Default.Menu, contentDescription = "Menu", tint = Color.DarkGray)
                            }
                        },
                        actions = {
                            IconButton(onClick = { /* TODO */ }) {
                                Icon(Icons.Default.Search, contentDescription = "Search", tint = Color.DarkGray)
                            }
                            IconButton(onClick = { /* TODO */ }) {
                                Icon(
                                    imageVector = Icons.Default.AccountCircle,
                                    contentDescription = "Profile",
                                    tint = Color.Gray,
                                    modifier = Modifier.size(32.dp)
                                )
                            }
                        },
                        colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent)
                    )
                },
                bottomBar = {
                    BottomAppBar(
                        containerColor = Color.White,
                        modifier = Modifier.height(70.dp).shadow(12.dp),
                        contentPadding = PaddingValues(horizontal = 16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            IconButton(onClick = { }) { Icon(Icons.Default.Home, contentDescription = null, tint = LumaPrimary) }
                            IconButton(onClick = { }) { Icon(Icons.Default.List, contentDescription = null, tint = Color.LightGray) }
                            
                            Spacer(modifier = Modifier.width(48.dp)) // Space for FAB
                            
                            IconButton(onClick = { }) { Icon(Icons.Default.Notifications, contentDescription = null, tint = Color.LightGray) }
                            IconButton(onClick = { }) { Icon(Icons.Default.Settings, contentDescription = null, tint = Color.LightGray) }
                        }
                    }
                }
            ) { paddingValues ->
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                        .padding(horizontal = 24.dp)
                ) {
                    Text(
                        text = "Smart Home Controller",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    val categories = listOf("Living Room", "Drawing Room", "Kitchen", "Dining", "Office")
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(20.dp),
                        contentPadding = PaddingValues(vertical = 8.dp)
                    ) {
                        itemsIndexed(categories) { index, category ->
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = category,
                                    color = if (selectedCategoryIndex == index) Color.Black else Color.Gray,
                                    fontWeight = if (selectedCategoryIndex == index) FontWeight.Bold else FontWeight.Normal,
                                    modifier = Modifier.clickable { selectedCategoryIndex = index }
                                )
                                if (selectedCategoryIndex == index) {
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Box(modifier = Modifier.width(20.dp).height(2.dp).background(LumaPrimary))
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(bottom = 100.dp)
                    ) {
                        items(floors) { floor ->
                            FloorCard(
                                floor = floor,
                                onClick = { onFloorClick(floor.id) },
                                onLongClick = { floorToEdit = floor },
                                onToggle = { isOn ->
                                    if (userId != null) {
                                        database.child("users").child(userId).child("floors").child(floor.id)
                                            .child("isOn").setValue(isOn)
                                    }
                                }
                            )
                        }
                    }
                }
            }

            // Central FAB
            FloatingActionButton(
                onClick = { showAddFloorDialog = true },
                containerColor = LumaPrimary,
                contentColor = Color.White,
                shape = CircleShape,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 35.dp)
                    .size(64.dp)
                    .shadow(8.dp, CircleShape)
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add", modifier = Modifier.size(32.dp))
            }
        }
    }

    if (showAddFloorDialog || floorToEdit != null) {
        FloorDialog(
            floor = floorToEdit,
            onDismiss = {
                showAddFloorDialog = false
                floorToEdit = null
            },
            onConfirm = { name, icon ->
                if (userId != null) {
                    val floorsRef = database.child("users").child(userId).child("floors")
                    if (floorToEdit == null) {
                        val newFloorRef = floorsRef.push()
                        val newFloor = Floor(id = newFloorRef.key ?: "", name = name, iconName = icon)
                        newFloorRef.setValue(newFloor)
                    } else {
                        floorsRef.child(floorToEdit!!.id).updateChildren(mapOf(
                            "name" to name,
                            "iconName" to icon
                        ))
                    }
                }
                showAddFloorDialog = false
                floorToEdit = null
            },
            onDelete = {
                if (userId != null && floorToEdit != null) {
                    database.child("users").child(userId).child("floors").child(floorToEdit!!.id).removeValue()
                }
                floorToEdit = null
            }
        )
    }
}

@Composable
fun FloorCard(
    floor: Floor,
    onClick: () -> Unit,
    onLongClick: () -> Unit,
    onToggle: (Boolean) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(160.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = LumaCardBg),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (floor.isOn) LumaPrimary.copy(alpha = 0.1f) else Color.Transparent),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = getIconForName(floor.iconName),
                        contentDescription = null,
                        modifier = Modifier.size(28.dp),
                        tint = if (floor.isOn) LumaPrimary else Color.DarkGray
                    )
                }
                Switch(
                    checked = floor.isOn,
                    onCheckedChange = onToggle,
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.White,
                        checkedTrackColor = LumaPrimary,
                        uncheckedThumbColor = Color.White,
                        uncheckedTrackColor = Color.LightGray.copy(alpha = 0.5f),
                        uncheckedBorderColor = Color.Transparent
                    ),
                    modifier = Modifier.scale(0.7f)
                )
            }
            
            Column {
                Text(
                    text = floor.name,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = Color.Black
                )
                Text(
                    text = if (floor.roomCount > 0) "Floor description here" else "Smart Device",
                    fontSize = 12.sp,
                    color = Color.Gray
                )
            }
        }
    }
}

@Composable
fun FloorDialog(
    floor: Floor? = null,
    onDismiss: () -> Unit,
    onConfirm: (String, String) -> Unit,
    onDelete: () -> Unit = {}
) {
    var name by remember { mutableStateOf(floor?.name ?: "") }
    var selectedIcon by remember { mutableStateOf(floor?.iconName ?: "Home") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (floor == null) "Add Floor" else "Edit Floor") },
        text = {
            Column {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Floor Name") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text("Select Icon")
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                    listOf("Home", "Info", "Settings", "List").forEach { iconName ->
                        IconButton(onClick = { selectedIcon = iconName }) {
                            Icon(
                                imageVector = getIconForName(iconName),
                                contentDescription = iconName,
                                tint = if (selectedIcon == iconName) LumaPrimary else Color.Gray
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(onClick = { onConfirm(name, selectedIcon) }, colors = ButtonDefaults.buttonColors(containerColor = LumaPrimary)) {
                Text("Save")
            }
        },
        dismissButton = {
            Row {
                if (floor != null) {
                    TextButton(onClick = onDelete, colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)) {
                        Text("Delete")
                    }
                }
                TextButton(onClick = onDismiss) {
                    Text("Cancel")
                }
            }
        }
    )
}

fun getGreeting(): String {
    val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
    return when (hour) {
        in 0..11 -> "Good Morning"
        in 12..16 -> "Good Afternoon"
        else -> "Good Evening"
    }
}

fun getIconForName(name: String): ImageVector {
    return when (name) {
        "Home" -> Icons.Default.Home
        "Info" -> Icons.Default.Info
        "Settings" -> Icons.Default.Settings
        "List" -> Icons.Default.List
        else -> Icons.Default.Home
    }
}
