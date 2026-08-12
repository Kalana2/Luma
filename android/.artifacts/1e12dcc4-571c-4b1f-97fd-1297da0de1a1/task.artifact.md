# Task List - Hardware Simulator Schema & Advanced Logic

- [x] Update Models in `FirebaseModels.kt`
    - [x] Add Switch Panel fields (`switchCount`, `switches`).
    - [x] Add Camera fields (`lastSnapshotUrl`).
    - [x] Add Heartbeat field (`lastSeen`).
- [x] Implement Logic in `HomeViewModel.kt`
    - [x] Implement `toggleSwitch` for Switch Panels.
    - [x] Update `lastSeen` on every user interaction.
    - [x] Expose Iron timer metadata to UI.
- [x] Enhance UI in `HomeScreen.kt`
    - [x] Implement independent toggles for Switch Panels.
    - [x] Implement real-time countdown timer for Irons.
    - [x] Support Camera status display.
- [x] Verification
    - [x] Verify Switch Panel independent control.
    - [x] Verify Iron remaining time countdown.
