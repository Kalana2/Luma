# Lumaa - Smart Home Application

Lumaa is a modern, industry-standard Smart Home application designed to help users manage their home environment efficiently. The project consists of a native Android application and a web-based dashboard.

## 🚀 Project Overview

"Welcome Lumaa - Make your home smarter"

This project provides a seamless experience for users to register, sign in, and manage their smart home devices. It features a professional UI/UX, Firebase integration for authentication and real-time data storage, and supports both Android and Web platforms.

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

## 🌐 Web Dashboard

A separate **React** based application for managing Lumaa from the browser.

### Tech Stack (Web)
- React.js
- (Future integration) Firebase Data Connect / Cloud SQL

## 📂 Project Structure

- `/app`: Native Android application source code.
- `/web`: React.js web application template.
- `/gradle`: Gradle configuration and version catalog.

## 🛠 Setup Instructions

### Android
1. Open the project in **Android Studio**.
2. Add your `google-services.json` to the `/app` directory.
3. Ensure **SHA-1 fingerprint** is added to your Firebase project.
4. Enable **Email/Password** authentication in the Firebase Console.
5. Set Realtime Database rules to allow authenticated reads/writes.
6. Build and run the project.

### Web
1. Navigate to the `/web` directory.
2. Run `npm install` to install dependencies.
3. Run `npm start` to launch the development server.

## 🛡 Security & Validation
The project implements field-level validation and uses secure authentication providers to ensure user data protection.

---
© 2026 Lumaa Smart Home Project. Developed with ❤️ by Sahan.
