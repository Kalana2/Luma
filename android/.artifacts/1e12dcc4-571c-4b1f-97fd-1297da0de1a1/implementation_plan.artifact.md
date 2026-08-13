# Implementation Plan - Fix Compilation Errors and Deprecations

This plan addresses the compilation errors related to function ambiguity, type inference, and unresolved references, as well as updating deprecated icons.

## User Review Required

> [!IMPORTANT]
> - I will remove the `login` function from `welcomePage.kt` to resolve the ambiguity with the one in `authController.kt`.
> - I will also fix a missing parameter for `SignUpScreen` in `MainActivity.kt` which was likely causing an additional compilation error.

## Proposed Changes

### Logic Layer - Authentication Controllers

#### [MODIFY] [welcomePage.kt](file:///D:/Projects/Lumma App/Luma/android/app/src/main/java/com/example/myapplication/ui/pages_controllers/welcomePage.kt)
- Remove the duplicate `login` function definition.

### UI Layer - Screens

#### [MODIFY] [SignInScreen.kt](file:///D:/Projects/Lumma App/Luma/android/app/src/main/java/com/example/myapplication/ui/screens/SignInScreen.kt)
- Update `Icons.Default.ArrowBack` to `Icons.AutoMirrored.Filled.ArrowBack`.
- Update corresponding imports.

#### [MODIFY] [SignUpScreen.kt](file:///D:/Projects/Lumma App/Luma/android/app/src/main/java/com/example/myapplication/ui/screens/SignUpScreen.kt)
- Update `Icons.Default.ArrowBack` to `Icons.AutoMirrored.Filled.ArrowBack`.
- Update corresponding imports.

#### [MODIFY] [MainActivity.kt](file:///D:/Projects/Lumma App/Luma/android/app/src/main/java/com/example/myapplication/MainActivity.kt)
- Provide the missing `onSignUpSuccess` parameter to the `SignUpScreen` composable call.

## Verification Plan

### Automated Tests
- Run `./gradlew :app:assembleDebug` to ensure the project compiles without errors.

### Manual Verification
- N/A (Focus is on resolving compilation errors).
