package com.example.myapplication.ui.pages_controllers

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import com.example.myapplication.ui.pages_controllers.model.*
import android.util.Log

class HomeViewModel : ViewModel() {
    private val dbUrl = "https://lumaa-2590d-default-rtdb.asia-southeast1.firebasedatabase.app"
    private val auth = FirebaseAuth.getInstance()
    private val database = FirebaseDatabase.getInstance(dbUrl)
    
    private val _floors = MutableStateFlow<List<FloorUI>>(emptyList())
    val floors: StateFlow<List<FloorUI>> = _floors

    private val _isLoading = MutableStateFlow(true)
    val isLoading: StateFlow<Boolean> = _isLoading

    private val deviceListeners = mutableMapOf<String, ValueEventListener>()
    private val deviceDetails = mutableMapOf<String, DeviceUI>()
    private val rawDevices = mutableMapOf<String, FirebaseDevice>()
    private var floorsListener: ValueEventListener? = null
    private var lastFloorsSnapshot: DataSnapshot? = null

    init {
        fetchFloors()
        startAutoOffCheck()
    }

    private fun fetchFloors() {
        val uid = auth.currentUser?.uid ?: return
        val floorsRef = database.getReference("users/$uid/floors")

        floorsListener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                lastFloorsSnapshot = snapshot
                val allDeviceIds = mutableSetOf<String>()

                snapshot.children.forEach { floorSnap ->
                    floorSnap.child("rooms").children.forEach { roomSnap ->
                        roomSnap.child("devices").children.forEach { deviceSnap ->
                            deviceSnap.key?.let { allDeviceIds.add(it) }
                        }
                    }
                }
                
                syncDevices(allDeviceIds)
            }

            override fun onCancelled(error: DatabaseError) {
                Log.e("HomeViewModel", "Error fetching floors: ${error.message}")
            }
        }
        
        floorsRef.addValueEventListener(floorsListener!!)
    }
    
    private fun syncDevices(deviceIds: Set<String>) {
        val iterator = deviceListeners.entries.iterator()
        while (iterator.hasNext()) {
            val (id, listener) = iterator.next()
            if (!deviceIds.contains(id)) {
                database.getReference("devices/$id").removeEventListener(listener)
                deviceDetails.remove(id)
                rawDevices.remove(id)
                iterator.remove()
            }
        }

        if (deviceIds.isEmpty()) {
            _isLoading.value = false
            updateUI()
            return
        }

        deviceIds.forEach { deviceId ->
            if (!deviceListeners.containsKey(deviceId)) {
                val listener = object : ValueEventListener {
                    override fun onDataChange(snap: DataSnapshot) {
                        val device = snap.getValue(FirebaseDevice::class.java)?.copy(id = deviceId) ?: return
                        rawDevices[deviceId] = device
                        
                        val switchStates = device.switches?.mapValues { it.value == "ON" }
                        
                        deviceDetails[deviceId] = DeviceUI(
                            id = deviceId,
                            name = device.name,
                            icon = mapTypeToIcon(device.type),
                            isOn = device.state == "ON",
                            type = device.type,
                            isError = device.status == "ERROR",
                            status = device.status,
                            switches = switchStates,
                            turnedOnAt = device.turnedOnAt,
                            maxDurationMinutes = device.maxDurationMinutes,
                            snapshotUrl = device.lastSnapshotUrl
                        )
                        updateUI()
                        _isLoading.value = false
                    }

                    override fun onCancelled(error: DatabaseError) {}
                }
                deviceListeners[deviceId] = listener
                database.getReference("devices/$deviceId").addValueEventListener(listener)
            }
        }
    }

    private fun updateUI() {
        val snapshot = lastFloorsSnapshot ?: return
        val uiFloors = mutableListOf<FloorUI>()
        
        snapshot.children.forEach { floorSnap ->
            val rooms = mutableListOf<RoomUI>()
            floorSnap.child("rooms").children.forEach { roomSnap ->
                val roomDevices = mutableListOf<DeviceUI>()
                roomSnap.child("devices").children.forEach { deviceSnap ->
                    deviceDetails[deviceSnap.key]?.let { roomDevices.add(it) }
                }
                rooms.add(RoomUI(
                    roomSnap.child("name").value as? String ?: roomSnap.key ?: "",
                    roomDevices
                ))
            }
            uiFloors.add(FloorUI(
                floorSnap.child("name").value as? String ?: floorSnap.key ?: "",
                floorSnap.child("icon").value as? String ?: "home",
                rooms
            ))
        }
        _floors.value = uiFloors
    }

    fun toggleDevice(deviceId: String, currentState: Boolean) {
        val device = rawDevices[deviceId] ?: return
        if (device.status == "ERROR") return

        val newState = if (currentState) "OFF" else "ON"
        val updates = mutableMapOf<String, Any>(
            "state" to newState,
            "lastSeen" to System.currentTimeMillis()
        )
        
        if (newState == "ON") {
            updates["turnedOnAt"] = System.currentTimeMillis()
        } else {
            updates["turnedOnAt"] = 0L
        }

        database.getReference("devices/$deviceId").updateChildren(updates)
    }

    fun toggleSwitch(deviceId: String, switchKey: String, currentState: Boolean) {
        val device = rawDevices[deviceId] ?: return
        if (device.status == "ERROR") return

        val newState = if (currentState) "OFF" else "ON"
        val updates = mapOf(
            "switches/$switchKey" to newState,
            "lastSeen" to System.currentTimeMillis()
        )
        database.getReference("devices/$deviceId").updateChildren(updates)
    }

    private fun startAutoOffCheck() {
        viewModelScope.launch {
            while (true) {
                val now = System.currentTimeMillis()
                rawDevices.values.forEach { device ->
                    if (device.type.lowercase() == "iron" && 
                        device.state == "ON" && 
                        device.turnedOnAt != null && 
                        device.turnedOnAt > 0 &&
                        device.maxDurationMinutes != null && 
                        device.maxDurationMinutes > 0
                    ) {
                        val durationMs = device.maxDurationMinutes * 60 * 1000L
                        if (now - device.turnedOnAt >= durationMs) {
                            Log.i("HomeViewModel", "Auto-turning off iron: ${device.id}")
                            toggleDevice(device.id, true)
                        }
                    }
                }
                delay(30000)
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        val uid = auth.currentUser?.uid
        if (uid != null && floorsListener != null) {
            database.getReference("users/$uid/floors").removeEventListener(floorsListener!!)
        }
        deviceListeners.forEach { (id, listener) ->
            database.getReference("devices/$id").removeEventListener(listener)
        }
    }
}
