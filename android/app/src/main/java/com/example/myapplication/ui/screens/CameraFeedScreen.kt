package com.example.myapplication.ui.screens

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

private val LumaPrimary = Color(0xFF7B88FF)
private val LumaBackground = Color(0xFFF5F7FB)
private val CameraGreen = Color(0xFF059669)
private val CameraRed = Color(0xFFDC2626)

private fun decodeBase64Image(dataUrl: String?): Bitmap? {
    if (dataUrl.isNullOrEmpty()) return null
    val payload = dataUrl.substringAfter(',', dataUrl)
    if (payload == dataUrl) return null
    return runCatching {
        val bytes = Base64.decode(payload, Base64.DEFAULT)
        BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
    }.getOrNull()
}

private fun formatTimestamp(epochMs: Long?): String {
    if (epochMs == null || epochMs <= 0) return "never"
    return SimpleDateFormat("MMM d, h:mm:ss a", Locale.getDefault()).format(Date(epochMs))
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CameraFeedScreen(deviceId: String, onBackClick: () -> Unit) {
    var deviceName by remember { mutableStateOf("Camera") }
    var status by remember { mutableStateOf("OFFLINE") }
    var snapshotImage by remember { mutableStateOf<Bitmap?>(null) }
    var lastSnapshotAt by remember { mutableStateOf<Long?>(null) }
    var loading by remember { mutableStateOf(true) }

    val dbUrl = "https://lumaa-2590d-default-rtdb.asia-southeast1.firebasedatabase.app"
    val database = FirebaseDatabase.getInstance(dbUrl).reference

    LaunchedEffect(deviceId) {
        val deviceRef = database.child("devices").child(deviceId)
        deviceRef.addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                deviceName = snapshot.child("name").value as? String ?: "Camera"
                status = snapshot.child("status").value as? String ?: "OFFLINE"
                lastSnapshotAt = (snapshot.child("lastSnapshotAt").value as? Number)?.toLong()
                snapshotImage = decodeBase64Image(snapshot.child("lastSnapshotImage").value as? String)
                loading = false
            }

            override fun onCancelled(error: DatabaseError) {
                loading = false
            }
        })
    }

    val isLive = status == "ONLINE"

    Scaffold(
        containerColor = LumaBackground,
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = deviceName,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF2D3243)
                        )
                        Text(
                            text = "Camera Feed",
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

                snapshotImage == null -> {
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.Warning,
                            contentDescription = null,
                            tint = Color.Gray,
                            modifier = Modifier.size(56.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "No snapshot yet",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF2D3243)
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Capture a snapshot in the simulator to store the camera feed",
                            fontSize = 13.sp,
                            color = Color.Gray
                        )
                    }
                }

                else -> {
                    Column(modifier = Modifier.fillMaxSize()) {
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 8.dp),
                            shape = RoundedCornerShape(20.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White)
                        ) {
                            Box {
                                Image(
                                    bitmap = snapshotImage!!.asImageBitmap(),
                                    contentDescription = "Camera snapshot",
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(20.dp)),
                                    contentScale = ContentScale.Fit
                                )
                                Row(
                                    modifier = Modifier
                                        .align(Alignment.BottomStart)
                                        .fillMaxWidth()
                                        .background(
                                            Color.Black.copy(alpha = 0.35f),
                                            RoundedCornerShape(bottomStart = 20.dp, bottomEnd = 20.dp)
                                        )
                                        .padding(horizontal = 14.dp)
                                        .heightIn(min = 40.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(7.dp)
                                            .clip(RoundedCornerShape(50))
                                            .background(if (isLive) CameraGreen else CameraRed)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = if (isLive) "LIVE" else "OFFLINE",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = Color.White
                                    )
                                    Spacer(modifier = Modifier.weight(1f))
                                    Text(
                                        text = formatTimestamp(lastSnapshotAt),
                                        fontSize = 11.sp,
                                        color = Color.White
                                    )
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Videocam,
                                contentDescription = null,
                                tint = LumaPrimary
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "Last snapshot: ${formatTimestamp(lastSnapshotAt)}",
                                fontSize = 13.sp,
                                color = Color.Gray
                            )
                        }
                    }
                }
            }
        }
    }
}