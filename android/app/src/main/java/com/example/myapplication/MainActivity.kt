package com.example.myapplication

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.myapplication.ui.screens.DashboardScreen
import com.example.myapplication.ui.screens.FloorDetailsScreen
import com.example.myapplication.ui.screens.SignInScreen
import com.example.myapplication.ui.screens.SignUpScreen
import com.example.myapplication.ui.screens.WelcomeScreen
import com.example.myapplication.ui.theme.LumaaTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            LumaaTheme {
                AppNavigation()
            }
        }
    }
}

@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "welcome") {
        composable("welcome") {
            WelcomeScreen(
                onSignInClick = { navController.navigate("signin") },
                onSignUpClick = { navController.navigate("signup") }
            )
        }
        composable("signin") {
            SignInScreen(
                onBackClick = { navController.popBackStack() },
                onSignInSuccess = {
                    navController.navigate("dashboard") {
                        popUpTo("welcome") { inclusive = true }
                    }
                }
            )
        }
        composable("signup") {
            SignUpScreen(
                onBackClick = { navController.popBackStack() },
                onSignUpSuccess = {
                    navController.navigate("dashboard") {
                        popUpTo("welcome") { inclusive = true }
                    }
                }
            )
        }
        composable("dashboard") {
            DashboardScreen(
                onLogout = {
                    navController.navigate("welcome") {
                        popUpTo("dashboard") { inclusive = true }
                    }
                },
                onFloorClick = { floorId ->
                    navController.navigate("floor_details/$floorId")
                }
            )
        }
        composable("floor_details/{floorId}") { backStackEntry ->
            val floorId = backStackEntry.arguments?.getString("floorId") ?: ""
            FloorDetailsScreen(floorId = floorId, onBackClick = { navController.popBackStack() })
        }
    }
}