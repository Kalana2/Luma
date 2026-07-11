# Luma — Smart Home Monitoring & Control System

A monorepo for a smart home monitoring and control system consisting of an Android
app, a React-based hardware simulator, and Firebase cloud backend.

## Project Structure

```
Luma/
├── android/          # Android app (Kotlin + Jetpack Compose + MVVM)
├── simulator/        # React hardware simulator (Vite + Material UI)
├── firebase/         # Firebase Cloud Functions & Realtime Database
└── docs/             # Documentation, LaTeX report, diagrams
```

## Android App

Located in `android/`. Built with Kotlin, Jetpack Compose, and MVVM architecture.

### Prerequisites
- Android Studio Hedgehog (2023.1.1) or newer
- JDK 17
- A Firebase project with Realtime Database and Cloud Messaging enabled

### Setup
1. Open the `android/` directory in Android Studio.
2. Place your `google-services.json` in `android/app/`.
3. Sync Gradle and run on a device/emulator.

### Key Dependencies
- Jetpack Compose (via BOM)
- Navigation Compose
- Firebase Realtime Database, Auth, and FCM
- Material 3

## Hardware Simulator

Located in `simulator/`. A React SPA that simulates smart home devices
(lights, locks, cameras, thermostats, irons, etc.) and syncs state with
Firebase Realtime Database.

### Prerequisites
- Node.js 18+
- npm 9+

### Setup
```bash
cd simulator
cp .env.example .env
# Edit .env with your Firebase project credentials
npm install
npm run dev
```

## Firebase Backend

Located in `firebase/`. Contains Cloud Functions for automation rules
and security rules for the Realtime Database.

### Prerequisites
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Authenticated with `firebase login`

### Setup
```bash
cd firebase/functions
npm install
cd ..
firebase use <your-project-id>
```

### Local Development
```bash
firebase emulators:start
```

## Documentation

The `docs/` directory contains the LaTeX project report and any architecture
diagrams.
