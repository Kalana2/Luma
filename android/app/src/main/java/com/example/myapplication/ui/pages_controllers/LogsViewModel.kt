package com.example.myapplication.ui.pages_controllers

import androidx.lifecycle.ViewModel
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import com.example.myapplication.ui.pages_controllers.model.UserLog
import android.util.Log

class LogsViewModel : ViewModel() {
    private val dbUrl = "https://lumaa-2590d-default-rtdb.asia-southeast1.firebasedatabase.app"
    private val auth = FirebaseAuth.getInstance()
    private val database = FirebaseDatabase.getInstance(dbUrl)
    
    private val _logs = MutableStateFlow<List<UserLog>>(emptyList())
    val logs: StateFlow<List<UserLog>> = _logs

    private val _isLoading = MutableStateFlow(true)
    val isLoading: StateFlow<Boolean> = _isLoading

    private var logsListener: ValueEventListener? = null

    init {
        fetchLogs()
    }

    private fun fetchLogs() {
        val uid = auth.currentUser?.uid ?: return
        val logsRef = database.getReference("userLogs/$uid")

        logsListener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val logsList = mutableListOf<UserLog>()
                snapshot.children.forEach { logSnap ->
                    val log = logSnap.getValue(UserLog::class.java)
                    if (log != null) {
                        logsList.add(log)
                    }
                }
                // Sort by timestamp descending (newest first)
                _logs.value = logsList.sortedByDescending { it.timestamp }
                _isLoading.value = false
            }

            override fun onCancelled(error: DatabaseError) {
                Log.e("LogsViewModel", "Error fetching logs: ${error.message}")
                _isLoading.value = false
            }
        }
        
        logsRef.addValueEventListener(logsListener!!)
    }

    override fun onCleared() {
        super.onCleared()
        val uid = auth.currentUser?.uid
        if (uid != null && logsListener != null) {
            database.getReference("userLogs/$uid").removeEventListener(logsListener!!)
        }
    }
}
