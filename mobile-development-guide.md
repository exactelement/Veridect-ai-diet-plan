# YesNoApp Mobile Development Guide

## Overview

This guide covers building native Android and iOS apps that integrate with your existing YesNoApp backend, adding Google Fit and Apple Health integrations for comprehensive health data synchronization.

## Architecture Strategy

### Hybrid Approach: Native Mobile + Web Backend
- **Backend**: Keep existing Node.js/Express API (add mobile-specific endpoints)
- **Android**: Native Kotlin app with Google Fit SDK
- **iOS**: Native Swift app with HealthKit framework
- **Shared**: API endpoints, user accounts, food analysis engine

## Android App Development

### 1. Project Setup

**Prerequisites:**
- Android Studio (latest version)
- Android SDK API 24+ (Android 7.0+)
- Google Play Services
- Kotlin knowledge

**Create New Project:**
```bash
# Open Android Studio
# Choose "Empty Activity"
# Package name: com.yesnoapp.android
# Language: Kotlin
# Minimum SDK: API 24
```

### 2. Dependencies (app/build.gradle)

```kotlin
dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.7.0'
    implementation 'androidx.activity:activity-compose:1.8.2'
    implementation 'androidx.compose.ui:ui:1.5.8'
    implementation 'androidx.compose.ui:ui-tooling-preview:1.5.8'
    implementation 'androidx.compose.material3:material3:1.1.2'
    
    // Networking
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.12.0'
    
    // Google Fit
    implementation 'com.google.android.gms:play-services-fitness:21.1.0'
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
    
    // Camera and Image Processing
    implementation 'androidx.camera:camera-camera2:1.3.1'
    implementation 'androidx.camera:camera-lifecycle:1.3.1'
    implementation 'androidx.camera:camera-view:1.3.1'
    
    // Authentication
    implementation 'androidx.security:security-crypto:1.1.0-alpha06'
    
    // Multi-Provider Authentication
    implementation 'com.google.firebase:firebase-auth-ktx:22.3.1'
    implementation 'com.auth0.android:jwtdecode:2.0.2'
    
    // Navigation
    implementation 'androidx.navigation:navigation-compose:2.7.6'
    
    // Image Loading
    implementation 'io.coil-kt:coil-compose:2.5.0'
}
```

### 3. Google Fit Integration

**Step 1: Enable Google Fit API**
1. Go to Google Cloud Console
2. Enable Fitness API
3. Create credentials (OAuth 2.0 client ID)
4. Add your app's SHA-1 fingerprint

**Step 2: Permissions (AndroidManifest.xml)**
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="com.google.android.gms.permission.ACTIVITY_RECOGNITION" />
```

**Step 3: Google Fit Service Class**
```kotlin
class GoogleFitService(private val context: Context) {
    private val fitnessOptions = FitnessOptions.builder()
        .addDataType(DataType.TYPE_STEP_COUNT_DELTA, FitnessOptions.ACCESS_READ)
        .addDataType(DataType.TYPE_CALORIES_EXPENDED, FitnessOptions.ACCESS_READ)
        .addDataType(DataType.TYPE_DISTANCE_DELTA, FitnessOptions.ACCESS_READ)
        .addDataType(DataType.TYPE_HEART_RATE_BPM, FitnessOptions.ACCESS_READ)
        .addDataType(DataType.TYPE_WEIGHT, FitnessOptions.ACCESS_WRITE)
        .build()

    suspend fun requestPermissions(activity: Activity): Boolean {
        return if (!GoogleSignIn.hasPermissions(GoogleSignIn.getLastSignedInAccount(context), fitnessOptions)) {
            GoogleSignIn.requestPermissions(
                activity,
                GOOGLE_FIT_PERMISSIONS_REQUEST_CODE,
                GoogleSignIn.getLastSignedInAccount(context),
                fitnessOptions
            )
            false
        } else {
            true
        }
    }

    suspend fun getTodaySteps(): Int {
        val account = GoogleSignIn.getAccountForExtension(context, fitnessOptions)
        val response = Fitness.getHistoryClient(context, account)
            .readDailyTotal(DataType.TYPE_STEP_COUNT_DELTA)
            .await()
        
        return response.dataPoints.firstOrNull()?.getValue(Field.FIELD_STEPS)?.asInt() ?: 0
    }

    suspend fun syncCaloriesBurned(calories: Int) {
        val account = GoogleSignIn.getAccountForExtension(context, fitnessOptions)
        val dataSet = DataSet.create(DataSource.Builder()
            .setAppPackageName(context.packageName)
            .setDataType(DataType.TYPE_CALORIES_EXPENDED)
            .setType(DataSource.TYPE_RAW)
            .build())

        val now = System.currentTimeMillis()
        val dataPoint = dataSet.createDataPoint()
            .setTimeInterval(now - 3600000, now, TimeUnit.MILLISECONDS) // Last hour
            
        dataPoint.getValue(Field.FIELD_CALORIES).setFloat(calories.toFloat())
        dataSet.add(dataPoint)

        Fitness.getHistoryClient(context, account)
            .insertData(dataSet)
            .await()
    }

    companion object {
        private const val GOOGLE_FIT_PERMISSIONS_REQUEST_CODE = 1001
    }
}
```

### 4. API Service Integration

```kotlin
interface YesNoAppApi {
    @POST("auth/mobile-login")
    suspend fun mobileLogin(@Body credentials: LoginRequest): Response<AuthResponse>
    
    @POST("food/analyze")
    suspend fun analyzeFood(@Body request: FoodAnalysisRequest): Response<FoodAnalysisResponse>
    
    @POST("food/sync-health-data")
    suspend fun syncHealthData(@Body data: HealthDataRequest): Response<Unit>
    
    @GET("user/profile")
    suspend fun getUserProfile(): Response<UserProfile>
}

data class HealthDataRequest(
    val steps: Int,
    val caloriesBurned: Int,
    val distance: Float,
    val heartRate: Int?,
    val weight: Float?,
    val timestamp: Long
)
```

### 5. Main Features Implementation

**Food Camera Activity:**
```kotlin
@Composable
fun FoodCameraScreen(
    onFoodAnalyzed: (FoodAnalysisResponse) -> Unit
) {
    val context = LocalContext.current
    val cameraController = remember { LifecycleCameraController(context) }
    
    Box(modifier = Modifier.fillMaxSize()) {
        CameraPreview(
            controller = cameraController,
            modifier = Modifier.fillMaxSize()
        )
        
        FloatingActionButton(
            onClick = {
                capturePhoto(cameraController) { imageFile ->
                    // Send to YesNoApp API for analysis
                    analyzeFood(imageFile, onFoodAnalyzed)
                }
            },
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(16.dp)
        ) {
            Icon(Icons.Default.Camera, contentDescription = "Capture")
        }
    }
}
```

## iOS App Development

### 1. Project Setup

**Prerequisites:**
- Xcode 15+
- iOS 16.0+ deployment target
- Apple Developer Account
- Swift knowledge

**Create New Project:**
1. Open Xcode
2. Create new iOS app
3. Bundle ID: com.yesnoapp.ios
4. Language: Swift
5. Interface: SwiftUI

### 2. HealthKit Integration

**Step 1: Enable HealthKit Capability**
1. Select project in Xcode
2. Go to Signing & Capabilities
3. Add HealthKit capability

**Step 2: Info.plist Permissions**
```xml
<key>NSHealthShareUsageDescription</key>
<string>YesNoApp needs access to your health data to provide personalized nutrition insights</string>
<key>NSHealthUpdateUsageDescription</key>
<string>YesNoApp wants to save your nutrition data to Apple Health</string>
<key>NSCameraUsageDescription</key>
<string>YesNoApp needs camera access to analyze your food</string>
```

**Step 3: HealthKit Service**
```swift
import HealthKit

class HealthKitService: ObservableObject {
    private let healthStore = HKHealthStore()
    
    private let typesToRead: Set<HKObjectType> = [
        HKObjectType.quantityType(forIdentifier: .stepCount)!,
        HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!,
        HKObjectType.quantityType(forIdentifier: .distanceWalkingRunning)!,
        HKObjectType.quantityType(forIdentifier: .heartRate)!,
        HKObjectType.quantityType(forIdentifier: .bodyMass)!
    ]
    
    private let typesToWrite: Set<HKSampleType> = [
        HKObjectType.quantityType(forIdentifier: .dietaryEnergyConsumed)!,
        HKObjectType.quantityType(forIdentifier: .dietaryProtein)!,
        HKObjectType.quantityType(forIdentifier: .dietaryCarbohydrates)!,
        HKObjectType.quantityType(forIdentifier: .dietaryFatTotal)!
    ]
    
    func requestAuthorization() async throws {
        try await healthStore.requestAuthorization(toShare: typesToWrite, read: typesToRead)
    }
    
    func getTodaySteps() async throws -> Int {
        guard let stepType = HKQuantityType.quantityType(forIdentifier: .stepCount) else {
            throw HealthKitError.invalidType
        }
        
        let calendar = Calendar.current
        let now = Date()
        let startOfDay = calendar.startOfDay(for: now)
        
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: now)
        
        return try await withCheckedThrowingContinuation { continuation in
            let query = HKStatisticsQuery(
                quantityType: stepType,
                quantitySamplePredicate: predicate,
                options: .cumulativeSum
            ) { _, result, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }
                
                let steps = result?.sumQuantity()?.doubleValue(for: .count()) ?? 0
                continuation.resume(returning: Int(steps))
            }
            
            healthStore.execute(query)
        }
    }
    
    func saveNutritionData(calories: Double, protein: Double, carbs: Double, fat: Double) async throws {
        let now = Date()
        
        let samples: [HKQuantitySample] = [
            HKQuantitySample(type: HKQuantityType.quantityType(forIdentifier: .dietaryEnergyConsumed)!,
                           quantity: HKQuantity(unit: .kilocalorie(), doubleValue: calories),
                           start: now, end: now),
            HKQuantitySample(type: HKQuantityType.quantityType(forIdentifier: .dietaryProtein)!,
                           quantity: HKQuantity(unit: .gram(), doubleValue: protein),
                           start: now, end: now),
            HKQuantitySample(type: HKQuantityType.quantityType(forIdentifier: .dietaryCarbohydrates)!,
                           quantity: HKQuantity(unit: .gram(), doubleValue: carbs),
                           start: now, end: now),
            HKQuantitySample(type: HKQuantityType.quantityType(forIdentifier: .dietaryFatTotal)!,
                           quantity: HKQuantity(unit: .gram(), doubleValue: fat),
                           start: now, end: now)
        ]
        
        try await healthStore.save(samples)
    }
}

enum HealthKitError: Error {
    case invalidType
    case unauthorized
}
```

### 3. API Service Integration

```swift
import Foundation

class YesNoAppAPI: ObservableObject {
    private let baseURL = "https://your-api-domain.com/api"
    
    struct FoodAnalysisRequest: Codable {
        let imageData: String
        let timestamp: Date
    }
    
    struct FoodAnalysisResponse: Codable {
        let foodName: String
        let verdict: String
        let explanation: String
        let calories: Int?
        let protein: Double?
        let carbohydrates: Double?
        let fat: Double?
        let confidence: Int
    }
    
    func analyzeFood(imageData: Data) async throws -> FoodAnalysisResponse {
        let base64Image = imageData.base64EncodedString()
        let request = FoodAnalysisRequest(imageData: base64Image, timestamp: Date())
        
        var urlRequest = URLRequest(url: URL(string: "\(baseURL)/food/analyze")!)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add authentication header if needed
        if let token = UserDefaults.standard.string(forKey: "auth_token") {
            urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        urlRequest.httpBody = try JSONEncoder().encode(request)
        
        let (data, response) = try await URLSession.shared.data(for: urlRequest)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.invalidResponse
        }
        
        return try JSONDecoder().decode(FoodAnalysisResponse.self, from: data)
    }
}

enum APIError: Error {
    case invalidResponse
    case networkError
    case unauthorized
}
```

### 4. SwiftUI Camera View

```swift
import SwiftUI
import AVFoundation

struct CameraView: UIViewControllerRepresentable {
    @Binding var capturedImage: UIImage?
    
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.delegate = context.coordinator
        picker.sourceType = .camera
        picker.allowsEditing = false
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: CameraView
        
        init(_ parent: CameraView) {
            self.parent = parent
        }
        
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.capturedImage = image
            }
            picker.dismiss(animated: true)
        }
    }
}

struct FoodAnalysisView: View {
    @StateObject private var healthKit = HealthKitService()
    @StateObject private var api = YesNoAppAPI()
    @State private var capturedImage: UIImage?
    @State private var analysisResult: YesNoAppAPI.FoodAnalysisResponse?
    @State private var showingCamera = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Button("Analyze Food") {
                    showingCamera = true
                }
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
                
                if let result = analysisResult {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Food: \(result.foodName)")
                            .font(.headline)
                        Text("Verdict: \(result.verdict)")
                            .font(.subheadline)
                        Text("Explanation: \(result.explanation)")
                            .font(.body)
                        
                        if let calories = result.calories {
                            Text("Calories: \(calories)")
                        }
                        
                        Button("Save to Health App") {
                            Task {
                                await saveToHealthKit(result: result)
                            }
                        }
                        .padding()
                        .background(Color.green)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                    }
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(10)
                }
            }
            .padding()
            .navigationTitle("YesNoApp")
        }
        .sheet(isPresented: $showingCamera) {
            CameraView(capturedImage: $capturedImage)
        }
        .onChange(of: capturedImage) { image in
            if let image = image {
                Task {
                    await analyzeFood(image: image)
                }
            }
        }
        .onAppear {
            Task {
                try? await healthKit.requestAuthorization()
            }
        }
    }
    
    private func analyzeFood(image: UIImage) async {
        guard let imageData = image.jpegData(compressionQuality: 0.8) else { return }
        
        do {
            let result = await api.analyzeFood(imageData: imageData)
            await MainActor.run {
                self.analysisResult = result
            }
        } catch {
            print("Analysis failed: \(error)")
        }
    }
    
    private func saveToHealthKit(result: YesNoAppAPI.FoodAnalysisResponse) async {
        let calories = Double(result.calories ?? 0)
        let protein = result.protein ?? 0
        let carbs = result.carbohydrates ?? 0
        let fat = result.fat ?? 0
        
        do {
            try await healthKit.saveNutritionData(
                calories: calories,
                protein: protein,
                carbs: carbs,
                fat: fat
            )
        } catch {
            print("Failed to save to HealthKit: \(error)")
        }
    }
}
```

## Backend API Extensions

Add these endpoints to your existing Node.js backend:

```javascript
// Mobile-specific routes
app.post('/api/mobile/sync-health', isAuthenticated, async (req, res) => {
  const { steps, caloriesBurned, heartRate, weight } = req.body;
  const userId = req.user.id;
  
  try {
    // Save health data to database
    await storage.updateHealthMetrics(userId, {
      steps,
      caloriesBurned,
      heartRate,
      weight,
      syncedAt: new Date()
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/mobile/health-insights', isAuthenticated, async (req, res) => {
  const userId = req.user.id;
  
  try {
    const insights = await generateHealthInsights(userId);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Deployment Strategy

1. **Backend**: Deploy to Google Cloud Run (as discussed)
2. **Android**: Publish to Google Play Store
3. **iOS**: Publish to Apple App Store

## Development Timeline

- **Week 1-2**: Android app basic functionality + Google Fit
- **Week 3-4**: iOS app basic functionality + HealthKit  
- **Week 5**: Backend mobile API extensions
- **Week 6**: Testing and store submissions

This gives you native mobile apps with full health integration while leveraging your existing backend infrastructure.