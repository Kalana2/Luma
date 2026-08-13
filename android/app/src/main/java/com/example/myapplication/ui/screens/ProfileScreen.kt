package com.example.myapplication.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.myapplication.ui.pages_controllers.getUserData
import com.example.myapplication.ui.pages_controllers.model.User
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import android.widget.Toast
import androidx.compose.ui.platform.LocalContext

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(onBackClick: () -> Unit) {
    val auth = FirebaseAuth.getInstance()
    val uid = auth.currentUser?.uid
    val context = LocalContext.current
    val dbUrl = "https://lumaa-2590d-default-rtdb.asia-southeast1.firebasedatabase.app"

    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(true) }
    var isSaving by remember { mutableStateOf(false) }

    LaunchedEffect(uid) {
        uid?.let {
            getUserData(it) { user ->
                user?.let {
                    name = it.name
                    phone = it.phone
                    address = it.address
                }
                isLoading = false
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Profile") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Name") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )
                Spacer(modifier = Modifier.height(16.dp))
                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = { Text("Phone") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )
                Spacer(modifier = Modifier.height(16.dp))
                OutlinedTextField(
                    value = address,
                    onValueChange = { address = it },
                    label = { Text("Address") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )
                Spacer(modifier = Modifier.height(32.dp))

                if (isSaving) {
                    CircularProgressIndicator()
                } else {
                    Button(
                        onClick = {
                            if (uid != null) {
                                isSaving = true
                                val updates = mapOf(
                                    "name" to name,
                                    "phone" to phone,
                                    "address" to address
                                )
                                FirebaseDatabase.getInstance(dbUrl)
                                    .getReference("users")
                                    .child(uid)
                                    .updateChildren(updates)
                                    .addOnCompleteListener { task ->
                                        isSaving = false
                                        if (task.isSuccessful) {
                                            Toast.makeText(context, "Profile Updated", Toast.LENGTH_SHORT).show()
                                        } else {
                                            Toast.makeText(context, "Update Failed: ${task.exception?.message}", Toast.LENGTH_LONG).show()
                                        }
                                    }
                            }
                        },
                        modifier = Modifier.fillMaxWidth().height(56.dp),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Text("Save Changes")
                    }
                }
            }
        }
    }
}
