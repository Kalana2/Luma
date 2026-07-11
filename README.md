# Lumaa - Smart Home Application

Lumaa is a modern, industry-standard Smart Home application designed to help users manage their home environment efficiently. The project consists of a native Android application and a web-based dashboard.

## 🚀 Project Overview

"Welcome Lumaa - Make your home smarter"

This project provides a seamless experience for users to register, sign in, and manage their smart home devices. It features a professional UI/UX, Firebase integration for authentication and real-time data storage, and supports both Android and Web platforms.

---

## 📱 Android Application

Developed using **Kotlin** and **Jetpack Compose**, the Android app features:

- **Industry-Level UI**: Clean and modern design with support for **Light and Dark modes**.
- **Navigation**: Seamless flow between Welcome, Sign In, and Sign Up screens.
- **Firebase Authentication**: Secure user registration and login.
- **Real-time Database**: User profile data (Name, Email, Phone, Address, Role) is stored in Firebase Realtime Database.
- **Input Validation**: Robust validation for registration fields (email format, password length, etc.).

### Tech Stack (Android)
- Kotlin / Jetpack Compose
- Firebase Auth & Realtime Database
- Material 3
- Coil (Image loading)
- Navigation Compose

---

## 🌐 Web Dashboard

A separate **React** based application for managing Lumaa from the browser.

### Tech Stack (Web)
- React.js
- Firebase Data Connect / Cloud SQL (Future integration)

---

## 📂 Project Structure

- `/app`: Native Android application source code (Kotlin).
- `/web`: React.js web application template.
- `/gradle`: Gradle configuration and version catalog.

---

## 🛠 Setup & Installation Instructions

### 1. Firebase Configuration (Mandatory)
Both Android and Web components require a Firebase project.

1.  **Create a Project**: Go to [Firebase Console](https://console.firebase.google.com/) and create a new project named `Lumaa`.
2.  **Enable Authentication**: 
    - Go to **Authentication** > **Sign-in method**.
    - Enable **Email/Password**.
3.  **Create Realtime Database**:
    - Go to **Realtime Database** > **Create Database**.
    - Choose a location (e.g., Singapore `asia-southeast1`).
    - Set **Security Rules**:
      ```json
      {
        "rules": {
          ".read": "auth != null",
          ".write": "auth != null"
        }
      }
      ```
4.  **Connect Android App**:
    - Register your app with package name `com.example.myapplication`.
    - Download `google-services.json` and place it in the `/app` folder.
    - **SHA-1 Fingerprint**: You must add your SHA-1 to Firebase for Authentication to work.
      - In Android Studio, run the `signingReport` task (Gradle -> app -> Tasks -> android -> signingReport).
      - Copy the SHA-1 and add it to **Project Settings** in Firebase.

### 2. Android App Setup
1.  Open the root folder in **Android Studio**.
2.  Wait for Gradle Sync to complete.
3.  Ensure your `google-services.json` is in the `app/` directory.
4.  If your Database URL is different from the default, update `dbUrl` in `WelcomePage.kt`.
5.  Build and Run on an emulator or physical device.

### 3. Web Dashboard Setup
1.  Navigate to the `/web` directory in your terminal:
    ```bash
    cd web
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm start
    ```
4.  (Future) Add your Firebase web configuration to a `.env` file or directly in the React source code.

---

## 🛡 Security & Validation
The project implements strict validation for:
- **Email**: Correct format check.
- **Password**: Minimum length (6 characters) and masked input.
- **Profile**: Mandatory fields for registration (Phone, Address, Role).

---
© 2026 Lumaa Smart Home Project. Developed with ❤️ by Sahan.
