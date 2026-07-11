package com.example.myapplication.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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
    val activeDevices: Int = 0
)

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
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Lumaa") },
                    navigationIcon = {
                        IconButton(onClick = {
                            scope.launch { drawerState.open() }
                        }) {
                            Icon(Icons.Default.Menu, contentDescription = "Menu")
                        }
                    }
                )
            },
            floatingActionButton = {
                FloatingActionButton(onClick = { showAddFloorDialog = true }) {
                    Icon(Icons.Default.Add, contentDescription = "Add Floor")
                }
            }
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp)
            ) {
                val greeting = getGreeting()
                Text(
                    text = "$greeting,",
                    style = MaterialTheme.typography.headlineSmall
                )
                Text(
                    text = userName,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(24.dp))

                Text(
                    text = "Your Floors",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.SemiBold
                )

                Spacer(modifier = Modifier.height(16.dp))

                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(floors) { floor ->
                        FloorCard(
                            floor = floor,
                            onClick = { onFloorClick(floor.id) },
                            onLongClick = { floorToEdit = floor }
                        )
                    }
                }
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
    onLongClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(1f),
        onClick = onClick
    ) {
        // Long click handling for Card is not direct in Material3 Card, might need to wrap in box or use combinedClickable
        // For simplicity using standard onClick and adding an overflow icon or separate long click logic
        // But the requirement says "long-press or overflow menu"
        Box(modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = getIconForName(floor.iconName),
                    contentDescription = null,
                    modifier = Modifier.size(48.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = floor.name, fontWeight = FontWeight.Bold, maxLines = 1)
                Text(text = "${floor.roomCount} Rooms", style = MaterialTheme.typography.bodySmall)
                Text(text = "${floor.activeDevices} Devices ON", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.secondary)
            }
            
            IconButton(
                onClick = onLongClick,
                modifier = Modifier.align(Alignment.TopEnd)
            ) {
                Icon(Icons.Default.MoreVert, contentDescription = "Options")
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
                // Simplified icon picker
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                    listOf("Home", "Info", "Settings", "List").forEach { iconName ->
                        IconButton(onClick = { selectedIcon = iconName }) {
                            Icon(
                                imageVector = getIconForName(iconName),
                                contentDescription = iconName,
                                tint = if (selectedIcon == iconName) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(onClick = { onConfirm(name, selectedIcon) }) {
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
