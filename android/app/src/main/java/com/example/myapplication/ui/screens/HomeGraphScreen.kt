package com.example.myapplication.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.myapplication.ui.pages_controllers.model.Device
import com.example.myapplication.ui.pages_controllers.model.Floor

@Composable
fun HomeGraphDialog(
    floors: List<Floor>,
    devices: List<Device>,
    onDismiss: () -> Unit
) {
    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Home Infrastructure Graph", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Box(modifier = Modifier.weight(1f).fillMaxWidth().verticalScroll(rememberScrollState())) {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Root node: HOME
                        NodeItem("HOME", MaterialTheme.colorScheme.primary)

                        floors.forEach { floor ->
                            ConnectorLine()
                            NodeItem("FLOOR: ${floor.name}", MaterialTheme.colorScheme.secondary)

                            floor.rooms.forEach { (roomId, room) ->
                                ConnectorLine()
                                NodeItem("ROOM: ${room.name}", MaterialTheme.colorScheme.tertiary)

                                val roomDevices = devices.filter { it.id in room.devices.keys }
                                roomDevices.forEach { device ->
                                    ConnectorLine()
                                    DeviceNodeItem(device)
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
fun NodeItem(label: String, color: Color) {
    Surface(
        color = color,
        shape = CircleShape,
        modifier = Modifier.padding(vertical = 4.dp)
    ) {
        Text(
            text = label,
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp),
            color = Color.White,
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp
        )
    }
}

@Composable
fun DeviceNodeItem(device: Device) {
    Surface(
        color = if (device.isOn) Color(0xFF4CAF50) else Color.Gray,
        shape = MaterialTheme.shapes.small,
        modifier = Modifier.padding(vertical = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(if (device.isOn) Color.White else Color.LightGray))
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "${device.name} (${device.status})",
                color = Color.White,
                fontSize = 12.sp
            )
        }
    }
}

@Composable
fun ConnectorLine() {
    Canvas(modifier = Modifier.height(20.dp).width(2.dp)) {
        drawLine(
            color = Color.LightGray,
            start = Offset(size.width / 2, 0f),
            end = Offset(size.width / 2, size.height),
            strokeWidth = 4f
        )
    }
}
