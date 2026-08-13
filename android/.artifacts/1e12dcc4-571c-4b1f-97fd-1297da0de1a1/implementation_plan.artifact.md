# Implementation Plan - Hardware Simulator Schema & Switch Panel Support

This plan outlines the changes required to synchronize the app's data models and logic with the official **Luma Simulator Database Schema**, with a focus on implementing independent controls for **Switch Panels**.

## User Review Required

> [!IMPORTANT]
> **Switch Panel Support**: The `switchPanel` type uses a nested `switches` object (e.g., `switch1: "ON"`, `switch2: "OFF"`). I will update the `HomeViewModel` to parse this map, and the UI `DeviceCard` will now show individual toggles for each switch in the panel.
>
> **Camera Type**: Cameras do not have a `state` field (`ON/OFF`). The UI will be updated to show "Online" status and potentially a "View Stream" action in the future.
>
> **Denormalization**: I will verify that the app correctly follows the `users/{uid}/floors/.../devices/{deviceId}: true` index pattern for all fetching operations.

## Proposed Changes

### [Component Name] Model Updates

#### [MODIFY] [FirebaseModels.kt](file:///D:/Projects/Lumma App/Luma/android/app/src/main/java/com/example/myapplication/ui/pages_controllers/model/FirebaseModels.kt)
- Update `FirebaseDevice` to include:
    - `lastSeen: Long`
    - `switchCount: Int?`
    - `switches: Map<String, String>?`
    - `lastSnapshotUrl: String?`
- Update `DeviceUI` to include `switches: Map<String, Boolean>?` for granular state tracking.

### [Component Name] Logic Layer

#### [MODIFY] [HomeViewModel.kt](file:///D:/Projects/Lumma App/Luma/android/app/src/main/java/com/example/myapplication/ui/pages_controllers/HomeViewModel.kt)
- **State Updates**: Ensure `toggleDevice` writes `lastSeen: System.currentTimeMillis()` on every change.
- **Switch Logic**: Implement `toggleSwitch(deviceId: String, switchKey: String, currentState: Boolean)` to update specific switches in Firebase.
- **Type-Specific Parsing**:
    - For `camera`: Handle as a non-toggleable device.
    - For `switchPanel`: Map the `switches` map into the `DeviceUI`.
- **Iron Safety**: Include `turnedOnAt` and `maxDurationMinutes` in `DeviceUI` so the UI can display a real-time countdown for irons that are ON.

### [Component Name] UI Layer

#### [MODIFY] [HomeScreen.kt](file:///D:/Projects/Lumma App/Luma/android/app/src/main/java/com/example/myapplication/ui/screens/HomeScreen.kt)
- Update `DeviceCard` to detect `switchPanel` type.
- If it's a `switchPanel`, display a grid of small toggles within the card.
- Connect individual switch toggles to `homeViewModel.toggleSwitch`.
- **Timer Display**: For `iron` devices that are ON, display a "Remaining: MM:SS" timer on the card.
- Update `DeviceCard` for `camera` types to show status instead of a toggle.

## Verification Plan

### Automated Tests
- N/A

### Manual Verification
1. **Switch Panel**: Add a `switchPanel` with 3 switches in Firebase. Verify 3 toggles appear in the app and they work independently.
2. **Camera**: Add a `camera`. Verify no toggle appears and it shows as "ONLINE".
3. **Heartbeat**: Toggle any switch and verify `lastSeen` updates in Firebase.
