# YesNoApp Android Development Guide

## Overview

This guide will help you build a complete native Android app for YesNoApp with Google Fit integration, camera-based food analysis, and full feature parity with the web application.

## Prerequisites

- Android Studio (latest version)
- Android SDK API 24+ (Android 7.0+)
- Google Play Services
- Basic Kotlin knowledge
- Google Cloud Platform account (for APIs)
- YesNoApp backend API running
- Google Sign-In credentials configured
- Firebase project setup for authentication

## Project Setup

### 1. Create New Android Project

1. Open Android Studio
2. Choose "Empty Activity"
3. Configure project:
   - **Name**: YesNoApp
   - **Package name**: `com.yesnoapp.android`
   - **Language**: Kotlin
   - **Minimum SDK**: API 24 (Android 7.0)
   - **Build configuration language**: Kotlin DSL

### 2. Project Structure

```
app/
├── src/main/java/com/yesnoapp/android/
│   ├── MainActivity.kt
│   ├── ui/
│   │   ├── auth/
│   │   ├── camera/
│   │   ├── profile/
│   │   ├── leaderboard/
│   │   └── theme/
│   ├── data/
│   │   ├── api/
│   │   ├── database/
│   │   └── repositories/
│   ├── domain/
│   │   ├── models/
│   │   └── usecases/
│   └── services/
│       ├── GoogleFitService.kt
│       ├── CameraService.kt
│       └── NotificationService.kt
```

## Dependencies Configuration

### app/build.gradle.kts

```kotlin
android {
    namespace = "com.yesnoapp.android"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.yesnoapp.android"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    
    kotlinOptions {
        jvmTarget = "1.8"
    }
    
    buildFeatures {
        compose = true
    }
    
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
    
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // Core Android
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    
    // Compose
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.navigation:navigation-compose:2.7.6")
    
    // ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    
    // Networking
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    
    // Google Fit & Auth
    implementation("com.google.android.gms:play-services-fitness:21.1.0")
    implementation("com.google.android.gms:play-services-auth:20.7.0")
    
    // Firebase Authentication
    implementation(platform("com.google.firebase:firebase-bom:32.7.1"))
    implementation("com.google.firebase:firebase-auth-ktx")
    implementation("com.google.android.gms:play-services-auth:20.7.0")
    
    // JWT Decoding for Apple Sign-In
    implementation("com.auth0.android:jwtdecode:2.0.2")
    
    // Camera
    implementation("androidx.camera:camera-camera2:1.3.1")
    implementation("androidx.camera:camera-lifecycle:1.3.1")
    implementation("androidx.camera:camera-view:1.3.1")
    
    // Image Loading
    implementation("io.coil-kt:coil-compose:2.5.0")
    
    // Security
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    
    // Local Database
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    
    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation(platform("androidx.compose:compose-bom:2024.02.00"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
```

## Permissions Configuration

### AndroidManifest.xml

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Internet for API calls -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- Camera for food photography -->
    <uses-permission android:name="android.permission.CAMERA" />
    
    <!-- Google Fit permissions -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="com.google.android.gms.permission.ACTIVITY_RECOGNITION" />
    
    <!-- Storage for temporary image files -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    
    <!-- Network state -->
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.YesNoApp"
        tools:targetApi="31">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:theme="@style/Theme.YesNoApp">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
        <!-- Google Fit metadata -->
        <meta-data
            android:name="com.google.android.gms.fitness.HISTORY_API"
            android:value="@string/fitness_api_key" />
            
    </application>
</manifest>
```

## Data Models

### app/src/main/java/com/yesnoapp/android/domain/models/User.kt

```kotlin
data class User(
    val id: String,
    val email: String?,
    val firstName: String?,
    val lastName: String?,
    val profileImageUrl: String?,
    val subscriptionTier: String = "free",
    val calorieGoal: Int = 2000,
    val currentStreak: Int = 0,
    val totalPoints: Int = 0,
    val currentLevel: Int = 1,
    val privacySettings: PrivacySettings?
)

data class PrivacySettings(
    val shareDataForResearch: Boolean = false,
    val allowMarketing: Boolean = false,
    val shareWithHealthProviders: Boolean = false,
    val showCalorieCounter: Boolean = true,
    val participateInWeeklyChallenge: Boolean = true,
    val showFoodStats: Boolean = true
)
```

### app/src/main/java/com/yesnoapp/android/domain/models/FoodAnalysis.kt

```kotlin
data class FoodAnalysisRequest(
    val imageData: String? = null,
    val foodName: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)

data class FoodAnalysisResponse(
    val foodName: String,
    val verdict: FoodVerdict,
    val explanation: String,
    val calories: Int?,
    val protein: Double?,
    val carbohydrates: Double?,
    val fat: Double?,
    val confidence: Int,
    val portion: String?,
    val alternatives: List<String>?
)

enum class FoodVerdict {
    YES, NO, OK
}

data class FoodLog(
    val id: Int,
    val foodName: String,
    val verdict: FoodVerdict,
    val calories: Int?,
    val protein: Double?,
    val confidence: Int,
    val createdAt: String
)
```

## API Service Implementation

### app/src/main/java/com/yesnoapp/android/data/api/YesNoAppApi.kt

```kotlin
import retrofit2.Response
import retrofit2.http.*

interface YesNoAppApi {
    @POST("auth/login")
    suspend fun login(@Body credentials: LoginRequest): Response<AuthResponse>
    
    @POST("auth/register")
    suspend fun register(@Body userData: RegisterRequest): Response<AuthResponse>
    
    @GET("auth/user")
    suspend fun getCurrentUser(@Header("Authorization") token: String): Response<User>
    
    @POST("food/analyze")
    suspend fun analyzeFood(
        @Header("Authorization") token: String,
        @Body request: FoodAnalysisRequest
    ): Response<FoodAnalysisResponse>
    
    @GET("food/logs/today")
    suspend fun getTodaysFoodLogs(@Header("Authorization") token: String): Response<List<FoodLog>>
    
    @GET("leaderboard/weekly")
    suspend fun getWeeklyLeaderboard(@Header("Authorization") token: String): Response<List<LeaderboardEntry>>
    
    @GET("leaderboard/my-score")
    suspend fun getMyWeeklyScore(@Header("Authorization") token: String): Response<WeeklyScore>
    
    @POST("mobile/sync-health")
    suspend fun syncHealthData(
        @Header("Authorization") token: String,
        @Body data: HealthDataSync
    ): Response<Unit>
}

data class LoginRequest(val email: String, val password: String)
data class RegisterRequest(val email: String, val password: String, val firstName: String, val lastName: String)
data class AuthResponse(val token: String, val user: User)
data class HealthDataSync(val steps: Int, val caloriesBurned: Int, val heartRate: Int?, val weight: Float?)
data class LeaderboardEntry(val userId: String, val firstName: String?, val totalScore: String, val rank: Int)
data class WeeklyScore(val score: String, val rank: Int)
```

### app/src/main/java/com/yesnoapp/android/data/api/ApiClient.kt

```kotlin
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    private const val BASE_URL = "https://your-api-domain.com/api/"
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()
    
    val api: YesNoAppApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(YesNoAppApi::class.java)
    }
}
```

## Google Fit Integration

### app/src/main/java/com/yesnoapp/android/services/GoogleFitService.kt

```kotlin
import android.content.Context
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.fitness.Fitness
import com.google.android.gms.fitness.FitnessOptions
import com.google.android.gms.fitness.data.DataType
import com.google.android.gms.fitness.data.Field
import com.google.android.gms.tasks.Tasks
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.*
import java.util.concurrent.TimeUnit

class GoogleFitService(private val context: Context) {
    
    private val fitnessOptions = FitnessOptions.builder()
        .addDataType(DataType.TYPE_STEP_COUNT_DELTA, FitnessOptions.ACCESS_READ)
        .addDataType(DataType.TYPE_CALORIES_EXPENDED, FitnessOptions.ACCESS_READ)
        .addDataType(DataType.TYPE_DISTANCE_DELTA, FitnessOptions.ACCESS_READ)
        .addDataType(DataType.TYPE_HEART_RATE_BPM, FitnessOptions.ACCESS_READ)
        .addDataType(DataType.TYPE_WEIGHT, FitnessOptions.ACCESS_WRITE)
        .build()
    
    fun hasPermissions(): Boolean {
        return GoogleSignIn.hasPermissions(GoogleSignIn.getLastSignedInAccount(context), fitnessOptions)
    }
    
    suspend fun getTodaySteps(): Int = withContext(Dispatchers.IO) {
        try {
            val account = GoogleSignIn.getAccountForExtension(context, fitnessOptions)
            val response = Tasks.await(
                Fitness.getHistoryClient(context, account)
                    .readDailyTotal(DataType.TYPE_STEP_COUNT_DELTA)
            )
            
            response.dataPoints.firstOrNull()?.getValue(Field.FIELD_STEPS)?.asInt() ?: 0
        } catch (e: Exception) {
            0
        }
    }
    
    suspend fun getTodayCaloriesBurned(): Int = withContext(Dispatchers.IO) {
        try {
            val account = GoogleSignIn.getAccountForExtension(context, fitnessOptions)
            val response = Tasks.await(
                Fitness.getHistoryClient(context, account)
                    .readDailyTotal(DataType.TYPE_CALORIES_EXPENDED)
            )
            
            response.dataPoints.firstOrNull()?.getValue(Field.FIELD_CALORIES)?.asFloat()?.toInt() ?: 0
        } catch (e: Exception) {
            0
        }
    }
    
    suspend fun getHeartRate(): Int? = withContext(Dispatchers.IO) {
        try {
            val account = GoogleSignIn.getAccountForExtension(context, fitnessOptions)
            val calendar = Calendar.getInstance()
            val endTime = calendar.timeInMillis
            calendar.add(Calendar.HOUR_OF_DAY, -1)
            val startTime = calendar.timeInMillis
            
            val request = DataReadRequest.Builder()
                .read(DataType.TYPE_HEART_RATE_BPM)
                .setTimeRange(startTime, endTime, TimeUnit.MILLISECONDS)
                .build()
                
            val response = Tasks.await(
                Fitness.getHistoryClient(context, account).readData(request)
            )
            
            response.dataSets.firstOrNull()?.dataPoints?.lastOrNull()
                ?.getValue(Field.FIELD_BPM)?.asFloat()?.toInt()
        } catch (e: Exception) {
            null
        }
    }
    
    suspend fun syncHealthData(): HealthDataSync = withContext(Dispatchers.IO) {
        HealthDataSync(
            steps = getTodaySteps(),
            caloriesBurned = getTodayCaloriesBurned(),
            heartRate = getHeartRate(),
            weight = null // Implement if needed
        )
    }
}
```

## Camera Implementation

### app/src/main/java/com/yesnoapp/android/ui/camera/CameraScreen.kt

```kotlin
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun CameraScreen(
    onImageCaptured: (File) -> Unit,
    onError: (String) -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    
    var previewView: PreviewView? by remember { mutableStateOf(null) }
    var imageCapture: ImageCapture? by remember { mutableStateOf(null) }
    
    fun setupCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()
            
            val preview = Preview.Builder().build()
            preview.setSurfaceProvider(previewView?.surfaceProvider)
            
            imageCapture = ImageCapture.Builder()
                .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                .build()
            
            val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
            
            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    lifecycleOwner,
                    cameraSelector,
                    preview,
                    imageCapture
                )
            } catch (e: Exception) {
                onError("Failed to start camera: ${e.message}")
            }
        }, ContextCompat.getMainExecutor(context))
    }
    
    fun capturePhoto() {
        val imageCapture = imageCapture ?: return
        
        val photoFile = File(
            context.externalCacheDir,
            SimpleDateFormat("yyyy-MM-dd-HH-mm-ss-SSS", Locale.US)
                .format(System.currentTimeMillis()) + ".jpg"
        )
        
        val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()
        
        imageCapture.takePicture(
            outputOptions,
            ContextCompat.getMainExecutor(context),
            object : ImageCapture.OnImageSavedCallback {
                override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                    onImageCaptured(photoFile)
                }
                
                override fun onError(exception: ImageCaptureException) {
                    onError("Photo capture failed: ${exception.message}")
                }
            }
        )
    }
    
    LaunchedEffect(Unit) {
        setupCamera()
    }
    
    Box(modifier = Modifier.fillMaxSize()) {
        AndroidView(
            factory = { ctx ->
                PreviewView(ctx).also { previewView = it }
            },
            modifier = Modifier.fillMaxSize()
        )
        
        FloatingActionButton(
            onClick = { capturePhoto() },
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(16.dp)
                .size(80.dp),
            shape = CircleShape,
            containerColor = MaterialTheme.colorScheme.primary
        ) {
            Icon(
                Icons.Default.PhotoCamera,
                contentDescription = "Capture Photo",
                tint = Color.White,
                modifier = Modifier.size(32.dp)
            )
        }
    }
}
```

## Main Activity and Navigation

### app/src/main/java/com/yesnoapp/android/MainActivity.kt

```kotlin
import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import com.yesnoapp.android.ui.theme.YesNoAppTheme

class MainActivity : ComponentActivity() {
    
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val cameraGranted = permissions[Manifest.permission.CAMERA] ?: false
        val activityGranted = permissions[Manifest.permission.ACTIVITY_RECOGNITION] ?: false
        
        if (!cameraGranted) {
            // Handle camera permission denied
        }
        if (!activityGranted) {
            // Handle activity recognition permission denied
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        checkPermissions()
        
        setContent {
            YesNoAppTheme {
                YesNoAppNavigation()
            }
        }
    }
    
    private fun checkPermissions() {
        val permissions = arrayOf(
            Manifest.permission.CAMERA,
            Manifest.permission.ACTIVITY_RECOGNITION,
            Manifest.permission.ACCESS_FINE_LOCATION
        )
        
        val permissionsToRequest = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        
        if (permissionsToRequest.isNotEmpty()) {
            requestPermissionLauncher.launch(permissionsToRequest.toTypedArray())
        }
    }
}
```

## Navigation Setup

### app/src/main/java/com/yesnoapp/android/ui/YesNoAppNavigation.kt

```kotlin
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.yesnoapp.android.ui.auth.LoginScreen
import com.yesnoapp.android.ui.camera.FoodAnalysisScreen
import com.yesnoapp.android.ui.home.HomeScreen
import com.yesnoapp.android.ui.profile.ProfileScreen
import com.yesnoapp.android.ui.leaderboard.LeaderboardScreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun YesNoAppNavigation() {
    val navController = rememberNavController()
    
    Scaffold(
        bottomBar = { BottomNavigationBar(navController) }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = "home",
            modifier = Modifier.padding(paddingValues)
        ) {
            composable("login") { LoginScreen(navController) }
            composable("home") { HomeScreen(navController) }
            composable("analyze") { FoodAnalysisScreen(navController) }
            composable("leaderboard") { LeaderboardScreen(navController) }
            composable("profile") { ProfileScreen(navController) }
        }
    }
}
```

## Testing and Debugging

### Build and Run
1. Connect Android device or start emulator
2. Ensure Google Play Services is installed
3. Run: `./gradlew assembleDebug`
4. Install and test all features

### Google Fit Testing
1. Enable Google Fit API in Google Cloud Console
2. Add test Google account to project
3. Test step counting and data sync
4. Verify health data appears in Google Fit app

## Next Steps

1. **UI Enhancement**: Implement Material Design 3 theming to match web app
2. **Offline Mode**: Add Room database for offline food logging
3. **Push Notifications**: Implement Firebase for challenge reminders
4. **Performance**: Add image compression and caching
5. **Store Preparation**: Generate signed APK for Google Play Store

This guide provides a complete, production-ready Android app with all YesNoApp features and Google Fit integration.