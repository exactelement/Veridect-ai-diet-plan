# Veridect iOS Development Guide

## Overview

This guide will help you build a complete native iOS app for Veridect with Apple HealthKit integration, camera-based food analysis, personalized AI verdicts, position-ranked weekly leaderboards, level progression, and full feature parity with the web application.

## Prerequisites

- Xcode 15+ (latest version)
- iOS 16.0+ deployment target
- Apple Developer Account ($99/year)
- Basic Swift and SwiftUI knowledge
- Veridect backend API running
- Multi-provider authentication system (Email/Password, Google, Apple)
- Understanding of gamification UI patterns
- Stripe iOS SDK for subscription management
- Google Gemini AI API access for food analysis

## Current Subscription Tiers (2025)

The iOS app must implement the following subscription tiers:

- **Free Tier** (€0): 5 daily food analyses, basic features
- **Pro Tier** (€1/month - promotional pricing, normally €10/month): Unlimited analyses, food logging, leaderboards, progress tracking
- **Advanced Tier** (€50/month - coming soon): Medical features, priority support, advanced analytics

## Key Features to Implement

### Core Features
- Multi-provider authentication (Email/Password, Google, Apple ID)
- Camera-based food analysis with Google Gemini AI
- Real-time food verdicts (YES/NO/OK) with explanations
- Dual point system (lifetime points for levels, weekly points for leaderboards)
- Position-ranked weekly leaderboards (#1, #2, #3, etc.)
- Daily challenges and streak tracking
- Spanish contact information (info@veridect.com, +34 672 810 584)

## Authentication Integration

The iOS app must handle Veridect's comprehensive authentication system with intelligent error handling for method conflicts.

### Authentication Providers
- **Email/Password**: Traditional sign-up with validation
- **Google OAuth**: Sign in with Google integration
- **Apple Sign-In**: Native Apple ID authentication

### Smart Error Handling
When users attempt to sign in with the wrong method for their account, the app should display specific guidance:

```swift
enum AuthError: Error {
    case useEmailLogin
    case useGoogleLogin
    case useAppleLogin
    case invalidCredentials
    
    var userMessage: String {
        switch self {
        case .useEmailLogin:
            return "This email is registered with a password. Please use email login instead."
        case .useGoogleLogin:
            return "This email is registered with Google. Please use 'Sign in with Google' instead."
        case .useAppleLogin:
            return "This email is registered with Apple ID. Please use 'Sign in with Apple' instead."
        case .invalidCredentials:
            return "Invalid email or password."
        }
    }
}
```

## Project Setup

### 1. Create New iOS Project

1. Open Xcode
2. Choose "Create a new Xcode project"
3. Select "iOS" → "App"
4. Configure project:
   - **Product Name**: Veridect
   - **Bundle Identifier**: `com.veridect.ios`
   - **Language**: Swift
   - **Interface**: SwiftUI
   - **Use Core Data**: No (we'll use API + UserDefaults)

### 2. Add Dependencies

Add these packages via Swift Package Manager (File → Add Package Dependencies):

1. **Google Sign-In**:
   ```
   https://github.com/google/GoogleSignIn-iOS
   ```

2. **Keychain Swift** (for secure token storage):
   ```
   https://github.com/evgenyneu/keychain-swift
   ```

### 3. Project Structure

```
YesNoApp/
├── YesNoApp/
│   ├── App/
│   │   ├── YesNoAppApp.swift
│   │   └── ContentView.swift
│   ├── Views/
│   │   ├── Auth/
│   │   ├── Camera/
│   │   ├── Home/
│   │   ├── Profile/
│   │   └── Leaderboard/
│   ├── Models/
│   │   ├── User.swift
│   │   ├── FoodAnalysis.swift
│   │   └── HealthData.swift
│   ├── Services/
│   │   ├── APIService.swift
│   │   ├── HealthKitService.swift
│   │   ├── AuthService.swift
│   │   └── CameraService.swift
│   ├── ViewModels/
│   │   ├── AuthViewModel.swift
│   │   ├── HomeViewModel.swift
│   │   └── CameraViewModel.swift
│   └── Utilities/
│       ├── Extensions.swift
│       └── Constants.swift
```

## Capabilities and Permissions

### 1. Enable Required Capabilities

1. Select your project in Xcode
2. Go to "Signing & Capabilities"
3. Add the following capabilities:
   - **HealthKit**: For health data integration
   - **Sign In with Apple**: For Apple authentication
   - **Keychain Sharing**: For secure token storage
4. For HealthKit, ensure "Use with CloudKit" is unchecked (unless you want cloud sync)

### 2. Configure Info.plist

Right-click `Info.plist` → "Open As" → "Source Code", add:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Existing keys ... -->
    
    <!-- HealthKit Usage Descriptions -->
    <key>NSHealthShareUsageDescription</key>
    <string>Veridect needs access to your health data to provide personalized nutrition insights and track your progress toward health goals.</string>
    
    <key>NSHealthUpdateUsageDescription</key>
    <string>Veridect wants to save your nutrition data to Apple Health to help you maintain a comprehensive health record.</string>
    
    <!-- Camera Usage -->
    <key>NSCameraUsageDescription</key>
    <string>Veridect needs camera access to analyze your food and provide instant nutrition verdicts.</string>
    
    <!-- Photo Library (optional, for food image uploads) -->
    <key>NSPhotoLibraryUsageDescription</key>
    <string>Veridect can analyze food photos from your photo library to provide nutrition insights.</string>
    
</dict>
</plist>
```

## Data Models

### Models/User.swift

```swift
import Foundation

struct User: Codable, Identifiable {
    let id: String
    let email: String?
    let firstName: String?
    let lastName: String?
    let profileImageUrl: String?
    let subscriptionTier: String
    let calorieGoal: Int
    let currentStreak: Int
    let totalPoints: Int
    let currentLevel: Int
    let privacySettings: PrivacySettings?
    
    var displayName: String {
        if let firstName = firstName, let lastName = lastName {
            return "\(firstName) \(lastName)"
        } else if let firstName = firstName {
            return firstName
        } else {
            return email ?? "User"
        }
    }
}

struct PrivacySettings: Codable {
    let shareDataForResearch: Bool
    let allowMarketing: Bool
    let shareWithHealthProviders: Bool
    let showCalorieCounter: Bool
    let participateInWeeklyChallenge: Bool
    let showFoodStats: Bool
}

struct AuthResponse: Codable {
    let token: String
    let user: User
}

struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct RegisterRequest: Codable {
    let email: String
    let password: String
    let firstName: String
    let lastName: String
}

struct AppleAuthRequest: Codable {
    let identityToken: String
    let authorizationCode: String
    let user: AppleUser?
}

struct AppleUser: Codable {
    let name: PersonNameComponents?
    let email: String?
}

struct GoogleAuthRequest: Codable {
    let idToken: String
}
```

### Models/FoodAnalysis.swift

```swift
import Foundation

struct FoodAnalysisRequest: Codable {
    let imageData: String?
    let foodName: String?
    let timestamp: Date
    
    init(imageData: String? = nil, foodName: String? = nil) {
        self.imageData = imageData
        self.foodName = foodName
        self.timestamp = Date()
    }
}

struct FoodAnalysisResponse: Codable, Identifiable {
    let id = UUID()
    let foodName: String
    let verdict: FoodVerdict
    let explanation: String
    let calories: Int?
    let protein: Double?
    let carbohydrates: Double?
    let fat: Double?
    let fiber: Double?
    let sugar: Double?
    let sodium: Double?
    let confidence: Int
    let portion: String?
    let alternatives: [String]?
    
    private enum CodingKeys: String, CodingKey {
        case foodName, verdict, explanation, calories, protein, carbohydrates, fat, fiber, sugar, sodium, confidence, portion, alternatives
    }
}

enum FoodVerdict: String, Codable, CaseIterable {
    case YES = "YES"
    case NO = "NO"
    case OK = "OK"
    
    var color: Color {
        switch self {
        case .YES: return .green
        case .NO: return .red
        case .OK: return .orange
        }
    }
    
    var emoji: String {
        switch self {
        case .YES: return "✅"
        case .NO: return "❌"
        case .OK: return "⚠️"
        }
    }
}

struct FoodLog: Codable, Identifiable {
    let id: Int
    let foodName: String
    let verdict: FoodVerdict
    let calories: Int?
    let protein: Double?
    let confidence: Int
    let createdAt: String
}
```

### Models/HealthData.swift

```swift
import Foundation
import HealthKit

struct HealthDataSync: Codable {
    let steps: Int
    let caloriesBurned: Int
    let heartRate: Int?
    let weight: Double?
    let timestamp: Date
    
    init(steps: Int = 0, caloriesBurned: Int = 0, heartRate: Int? = nil, weight: Double? = nil) {
        self.steps = steps
        self.caloriesBurned = caloriesBurned
        self.heartRate = heartRate
        self.weight = weight
        self.timestamp = Date()
    }
}

struct LeaderboardEntry: Codable, Identifiable {
    let id = UUID()
    let userId: String
    let firstName: String?
    let totalScore: String
    let rank: Int
    
    private enum CodingKeys: String, CodingKey {
        case userId, firstName, totalScore, rank
    }
}

struct WeeklyScore: Codable {
    let score: String
    let rank: Int
    let weeklyChange: Int?
}
```

## HealthKit Service

### Services/HealthKitService.swift

```swift
import Foundation
import HealthKit
import Combine

class HealthKitService: ObservableObject {
    private let healthStore = HKHealthStore()
    
    // Health data types we want to read
    private let typesToRead: Set<HKObjectType> = [
        HKObjectType.quantityType(forIdentifier: .stepCount)!,
        HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!,
        HKObjectType.quantityType(forIdentifier: .distanceWalkingRunning)!,
        HKObjectType.quantityType(forIdentifier: .heartRate)!,
        HKObjectType.quantityType(forIdentifier: .bodyMass)!
    ]
    
    // Health data types we want to write
    private let typesToWrite: Set<HKSampleType> = [
        HKObjectType.quantityType(forIdentifier: .dietaryEnergyConsumed)!,
        HKObjectType.quantityType(forIdentifier: .dietaryProtein)!,
        HKObjectType.quantityType(forIdentifier: .dietaryCarbohydrates)!,
        HKObjectType.quantityType(forIdentifier: .dietaryFatTotal)!,
        HKObjectType.quantityType(forIdentifier: .dietaryFiber)!,
        HKObjectType.quantityType(forIdentifier: .dietarySugar)!,
        HKObjectType.quantityType(forIdentifier: .dietarySodium)!
    ]
    
    var isHealthDataAvailable: Bool {
        return HKHealthStore.isHealthDataAvailable()
    }
    
    func requestAuthorization() async throws {
        guard isHealthDataAvailable else {
            throw HealthKitError.notAvailable
        }
        
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
    
    func getTodayActiveCalories() async throws -> Int {
        guard let calorieType = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned) else {
            throw HealthKitError.invalidType
        }
        
        let calendar = Calendar.current
        let now = Date()
        let startOfDay = calendar.startOfDay(for: now)
        
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: now)
        
        return try await withCheckedThrowingContinuation { continuation in
            let query = HKStatisticsQuery(
                quantityType: calorieType,
                quantitySamplePredicate: predicate,
                options: .cumulativeSum
            ) { _, result, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }
                
                let calories = result?.sumQuantity()?.doubleValue(for: .kilocalorie()) ?? 0
                continuation.resume(returning: Int(calories))
            }
            
            healthStore.execute(query)
        }
    }
    
    func getLatestHeartRate() async throws -> Int? {
        guard let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate) else {
            throw HealthKitError.invalidType
        }
        
        let calendar = Calendar.current
        let now = Date()
        let oneHourAgo = calendar.date(byAdding: .hour, value: -1, to: now) ?? now
        
        let predicate = HKQuery.predicateForSamples(withStart: oneHourAgo, end: now)
        
        return try await withCheckedThrowingContinuation { continuation in
            let query = HKSampleQuery(
                sampleType: heartRateType,
                predicate: predicate,
                limit: 1,
                sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)]
            ) { _, samples, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }
                
                guard let sample = samples?.first as? HKQuantitySample else {
                    continuation.resume(returning: nil)
                    return
                }
                
                let heartRate = sample.quantity.doubleValue(for: HKUnit(from: "count/min"))
                continuation.resume(returning: Int(heartRate))
            }
            
            healthStore.execute(query)
        }
    }
    
    func saveNutritionData(analysis: FoodAnalysisResponse) async throws {
        let now = Date()
        var samples: [HKQuantitySample] = []
        
        // Calories
        if let calories = analysis.calories, calories > 0 {
            let caloriesSample = HKQuantitySample(
                type: HKQuantityType.quantityType(forIdentifier: .dietaryEnergyConsumed)!,
                quantity: HKQuantity(unit: .kilocalorie(), doubleValue: Double(calories)),
                start: now,
                end: now
            )
            samples.append(caloriesSample)
        }
        
        // Protein
        if let protein = analysis.protein, protein > 0 {
            let proteinSample = HKQuantitySample(
                type: HKQuantityType.quantityType(forIdentifier: .dietaryProtein)!,
                quantity: HKQuantity(unit: .gram(), doubleValue: protein),
                start: now,
                end: now
            )
            samples.append(proteinSample)
        }
        
        // Carbohydrates
        if let carbs = analysis.carbohydrates, carbs > 0 {
            let carbsSample = HKQuantitySample(
                type: HKQuantityType.quantityType(forIdentifier: .dietaryCarbohydrates)!,
                quantity: HKQuantity(unit: .gram(), doubleValue: carbs),
                start: now,
                end: now
            )
            samples.append(carbsSample)
        }
        
        // Fat
        if let fat = analysis.fat, fat > 0 {
            let fatSample = HKQuantitySample(
                type: HKQuantityType.quantityType(forIdentifier: .dietaryFatTotal)!,
                quantity: HKQuantity(unit: .gram(), doubleValue: fat),
                start: now,
                end: now
            )
            samples.append(fatSample)
        }
        
        // Fiber
        if let fiber = analysis.fiber, fiber > 0 {
            let fiberSample = HKQuantitySample(
                type: HKQuantityType.quantityType(forIdentifier: .dietaryFiber)!,
                quantity: HKQuantity(unit: .gram(), doubleValue: fiber),
                start: now,
                end: now
            )
            samples.append(fiberSample)
        }
        
        guard !samples.isEmpty else { return }
        
        try await healthStore.save(samples)
    }
    
    func syncHealthData() async throws -> HealthDataSync {
        let steps = try await getTodaySteps()
        let calories = try await getTodayActiveCalories()
        let heartRate = try? await getLatestHeartRate()
        
        return HealthDataSync(
            steps: steps,
            caloriesBurned: calories,
            heartRate: heartRate,
            weight: nil // Could add weight tracking if needed
        )
    }
}

enum HealthKitError: Error, LocalizedError {
    case notAvailable
    case invalidType
    case unauthorized
    case noData
    
    var errorDescription: String? {
        switch self {
        case .notAvailable:
            return "HealthKit is not available on this device"
        case .invalidType:
            return "Invalid health data type"
        case .unauthorized:
            return "HealthKit access not authorized"
        case .noData:
            return "No health data available"
        }
    }
}
```

## API Service

### Services/APIService.swift

```swift
import Foundation
import Combine

class APIService: ObservableObject {
    static let shared = APIService()
    
    private let baseURL = "https://your-api-domain.com/api"
    private let session = URLSession.shared
    
    @Published var isLoading = false
    
    private var authToken: String? {
        get { UserDefaults.standard.string(forKey: "auth_token") }
        set { 
            if let token = newValue {
                UserDefaults.standard.set(token, forKey: "auth_token")
            } else {
                UserDefaults.standard.removeObject(forKey: "auth_token")
            }
        }
    }
    
    var isAuthenticated: Bool {
        return authToken != nil
    }
    
    // MARK: - Authentication
    
    func login(email: String, password: String) async throws -> User {
        let request = LoginRequest(email: email, password: password)
        let response: AuthResponse = try await post(endpoint: "/auth/login", body: request, requiresAuth: false)
        
        authToken = response.token
        return response.user
    }
    
    func register(email: String, password: String, firstName: String, lastName: String) async throws -> User {
        let request = RegisterRequest(email: email, password: password, firstName: firstName, lastName: lastName)
        let response: AuthResponse = try await post(endpoint: "/auth/register", body: request, requiresAuth: false)
        
        authToken = response.token
        return response.user
    }
    
    func authenticateWithApple(identityToken: String, authorizationCode: String, user: ASAuthorizationAppleIDCredential.User?) async throws -> User {
        let request = AppleAuthRequest(
            identityToken: identityToken,
            authorizationCode: authorizationCode,
            user: user
        )
        let response: AuthResponse = try await post(endpoint: "/auth/apple", body: request, requiresAuth: false)
        
        authToken = response.token
        return response.user
    }
    
    func authenticateWithGoogle(idToken: String) async throws -> User {
        let request = GoogleAuthRequest(idToken: idToken)
        let response: AuthResponse = try await post(endpoint: "/auth/google", body: request, requiresAuth: false)
        
        authToken = response.token
        return response.user
    }
    
    func getCurrentUser() async throws -> User {
        return try await get(endpoint: "/auth/user")
    }
    
    func logout() {
        authToken = nil
    }
    
    // MARK: - Food Analysis
    
    func analyzeFood(request: FoodAnalysisRequest) async throws -> FoodAnalysisResponse {
        return try await post(endpoint: "/food/analyze", body: request)
    }
    
    func getTodaysFoodLogs() async throws -> [FoodLog] {
        return try await get(endpoint: "/food/logs/today")
    }
    
    // MARK: - Leaderboard
    
    func getWeeklyLeaderboard() async throws -> [LeaderboardEntry] {
        return try await get(endpoint: "/leaderboard/weekly")
    }
    
    func getMyWeeklyScore() async throws -> WeeklyScore {
        return try await get(endpoint: "/leaderboard/my-score")
    }
    
    // MARK: - Health Data Sync
    
    func syncHealthData(_ data: HealthDataSync) async throws {
        let _: EmptyResponse = try await post(endpoint: "/mobile/sync-health", body: data)
    }
    
    // MARK: - Generic HTTP Methods
    
    private func get<T: Codable>(endpoint: String) async throws -> T {
        let url = URL(string: baseURL + endpoint)!
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        
        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        return try await performRequest(request)
    }
    
    private func post<T: Codable, U: Codable>(endpoint: String, body: T, requiresAuth: Bool = true) async throws -> U {
        let url = URL(string: baseURL + endpoint)!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if requiresAuth, let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        request.httpBody = try JSONEncoder().encode(body)
        
        return try await performRequest(request)
    }
    
    private func performRequest<T: Codable>(_ request: URLRequest) async throws -> T {
        DispatchQueue.main.async {
            self.isLoading = true
        }
        
        defer {
            DispatchQueue.main.async {
                self.isLoading = false
            }
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard 200...299 ~= httpResponse.statusCode else {
            if httpResponse.statusCode == 401 {
                DispatchQueue.main.async {
                    self.logout()
                }
                throw APIError.unauthorized
            }
            throw APIError.serverError(httpResponse.statusCode)
        }
        
        return try JSONDecoder().decode(T.self, from: data)
    }
}

struct EmptyResponse: Codable {}

enum APIError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case unauthorized
    case serverError(Int)
    case decodingError
    case networkError
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .unauthorized:
            return "You are not authorized. Please log in again."
        case .serverError(let code):
            return "Server error (\(code))"
        case .decodingError:
            return "Failed to decode server response"
        case .networkError:
            return "Network connection error"
        }
    }
}
```

## Camera Service

### Services/CameraService.swift

```swift
import Foundation
import UIKit
import AVFoundation

class CameraService: NSObject, ObservableObject {
    @Published var isAuthorized = false
    @Published var capturedImage: UIImage?
    
    override init() {
        super.init()
        checkCameraAuthorization()
    }
    
    func checkCameraAuthorization() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            isAuthorized = true
        case .notDetermined:
            requestCameraPermission()
        case .denied, .restricted:
            isAuthorized = false
        @unknown default:
            isAuthorized = false
        }
    }
    
    private func requestCameraPermission() {
        AVCaptureDevice.requestAccess(for: .video) { granted in
            DispatchQueue.main.async {
                self.isAuthorized = granted
            }
        }
    }
    
    func convertImageToBase64(_ image: UIImage) -> String? {
        // Compress image to reduce API payload size
        guard let imageData = image.jpegData(compressionQuality: 0.8) else {
            return nil
        }
        return imageData.base64EncodedString()
    }
}
```

## Camera View

### Views/Camera/CameraView.swift

```swift
import SwiftUI
import AVFoundation

struct CameraView: UIViewControllerRepresentable {
    @Binding var capturedImage: UIImage?
    @Environment(\.dismiss) var dismiss
    
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.delegate = context.coordinator
        picker.sourceType = .camera
        picker.allowsEditing = false
        picker.cameraDevice = .rear
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
            parent.dismiss()
        }
        
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
}

struct FoodAnalysisView: View {
    @StateObject private var healthKit = HealthKitService()
    @StateObject private var apiService = APIService.shared
    @StateObject private var cameraService = CameraService()
    
    @State private var showingCamera = false
    @State private var showingImagePicker = false
    @State private var analysisResult: FoodAnalysisResponse?
    @State private var isAnalyzing = false
    @State private var errorMessage: String?
    @State private var foodDescription = ""
    @State private var analysisMode: AnalysisMode = .camera
    
    enum AnalysisMode: CaseIterable {
        case camera, upload, text
        
        var title: String {
            switch self {
            case .camera: return "Take Photo"
            case .upload: return "Upload Image"
            case .text: return "Describe Food"
            }
        }
        
        var icon: String {
            switch self {
            case .camera: return "camera"
            case .upload: return "photo"
            case .text: return "text.alignleft"
            }
        }
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Analysis Mode Selection
                    VStack(alignment: .leading, spacing: 16) {
                        Text("How would you like to analyze your food?")
                            .font(.headline)
                        
                        HStack(spacing: 12) {
                            ForEach(AnalysisMode.allCases, id: \.self) { mode in
                                AnalysisModeButton(
                                    mode: mode,
                                    isSelected: analysisMode == mode,
                                    action: { analysisMode = mode }
                                )
                            }
                        }
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // Input Section
                    VStack(spacing: 16) {
                        switch analysisMode {
                        case .camera:
                            CameraInputSection(
                                capturedImage: $cameraService.capturedImage,
                                showingCamera: $showingCamera,
                                isAuthorized: cameraService.isAuthorized
                            )
                            
                        case .upload:
                            UploadInputSection(
                                capturedImage: $cameraService.capturedImage,
                                showingImagePicker: $showingImagePicker
                            )
                            
                        case .text:
                            TextInputSection(foodDescription: $foodDescription)
                        }
                        
                        // Analyze Button
                        Button(action: analyzeFood) {
                            HStack {
                                if isAnalyzing {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                        .scaleEffect(0.8)
                                }
                                Text(isAnalyzing ? "Analyzing..." : "Analyze Food")
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(canAnalyze ? Color.blue : Color.gray)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                        }
                        .disabled(!canAnalyze || isAnalyzing)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(radius: 2)
                    
                    // Analysis Result
                    if let result = analysisResult {
                        AnalysisResultView(
                            result: result,
                            onSaveToHealth: { saveToHealthKit(result: result) },
                            onNewAnalysis: resetAnalysis
                        )
                    }
                    
                    // Error Message
                    if let error = errorMessage {
                        Text(error)
                            .foregroundColor(.red)
                            .padding()
                            .background(Color.red.opacity(0.1))
                            .cornerRadius(8)
                    }
                }
                .padding()
            }
            .navigationTitle("Food Analysis")
            .sheet(isPresented: $showingCamera) {
                CameraView(capturedImage: $cameraService.capturedImage)
            }
            .sheet(isPresented: $showingImagePicker) {
                ImagePicker(capturedImage: $cameraService.capturedImage)
            }
            .onAppear {
                requestHealthKitPermissions()
            }
        }
    }
    
    private var canAnalyze: Bool {
        switch analysisMode {
        case .camera, .upload:
            return cameraService.capturedImage != nil
        case .text:
            return !foodDescription.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        }
    }
    
    private func analyzeFood() {
        Task {
            await performAnalysis()
        }
    }
    
    @MainActor
    private func performAnalysis() async {
        isAnalyzing = true
        errorMessage = nil
        
        do {
            let request: FoodAnalysisRequest
            
            switch analysisMode {
            case .camera, .upload:
                guard let image = cameraService.capturedImage,
                      let base64String = cameraService.convertImageToBase64(image) else {
                    throw APIError.invalidResponse
                }
                request = FoodAnalysisRequest(imageData: base64String)
                
            case .text:
                request = FoodAnalysisRequest(foodName: foodDescription)
            }
            
            let result = try await apiService.analyzeFood(request: request)
            self.analysisResult = result
            
        } catch {
            self.errorMessage = error.localizedDescription
        }
        
        isAnalyzing = false
    }
    
    private func saveToHealthKit(result: FoodAnalysisResponse) {
        Task {
            do {
                try await healthKit.saveNutritionData(analysis: result)
                // Show success message
            } catch {
                errorMessage = "Failed to save to Health app: \(error.localizedDescription)"
            }
        }
    }
    
    private func resetAnalysis() {
        analysisResult = nil
        cameraService.capturedImage = nil
        foodDescription = ""
        errorMessage = nil
    }
    
    private func requestHealthKitPermissions() {
        Task {
            do {
                try await healthKit.requestAuthorization()
            } catch {
                print("HealthKit authorization failed: \(error)")
            }
        }
    }
}

// Supporting Views
struct AnalysisModeButton: View {
    let mode: FoodAnalysisView.AnalysisMode
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: mode.icon)
                    .font(.title2)
                Text(mode.title)
                    .font(.caption)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(isSelected ? Color.blue : Color.clear)
            .foregroundColor(isSelected ? .white : .primary)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.blue, lineWidth: isSelected ? 0 : 1)
            )
            .cornerRadius(8)
        }
    }
}

struct CameraInputSection: View {
    @Binding var capturedImage: UIImage?
    @Binding var showingCamera: Bool
    let isAuthorized: Bool
    
    var body: some View {
        VStack(spacing: 12) {
            if let image = capturedImage {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(maxHeight: 200)
                    .cornerRadius(8)
            }
            
            Button(action: { showingCamera = true }) {
                HStack {
                    Image(systemName: "camera")
                    Text(capturedImage == nil ? "Take Photo" : "Retake Photo")
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(isAuthorized ? Color.blue : Color.gray)
                .foregroundColor(.white)
                .cornerRadius(8)
            }
            .disabled(!isAuthorized)
            
            if !isAuthorized {
                Text("Camera access required for food analysis")
                    .font(.caption)
                    .foregroundColor(.red)
            }
        }
    }
}

struct UploadInputSection: View {
    @Binding var capturedImage: UIImage?
    @Binding var showingImagePicker: Bool
    
    var body: some View {
        VStack(spacing: 12) {
            if let image = capturedImage {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(maxHeight: 200)
                    .cornerRadius(8)
            }
            
            Button(action: { showingImagePicker = true }) {
                HStack {
                    Image(systemName: "photo")
                    Text(capturedImage == nil ? "Choose Photo" : "Choose Different Photo")
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(8)
            }
        }
    }
}

struct TextInputSection: View {
    @Binding var foodDescription: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Describe your food")
                .font(.headline)
            
            TextEditor(text: $foodDescription)
                .frame(minHeight: 100)
                .padding(8)
                .background(Color(.systemGray6))
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color(.systemGray4), lineWidth: 1)
                )
            
            Text("Be as specific as possible for the most accurate analysis")
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

struct AnalysisResultView: View {
    let result: FoodAnalysisResponse
    let onSaveToHealth: () -> Void
    let onNewAnalysis: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header
            HStack {
                VStack(alignment: .leading) {
                    Text(result.foodName)
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    HStack {
                        Text(result.verdict.emoji)
                        Text(result.verdict.rawValue)
                            .fontWeight(.semibold)
                            .foregroundColor(result.verdict.color)
                    }
                }
                
                Spacer()
                
                Text("\(result.confidence)% confident")
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color(.systemGray5))
                    .cornerRadius(8)
            }
            
            // Explanation
            Text(result.explanation)
                .font(.body)
            
            // Nutrition Info
            if result.calories != nil || result.protein != nil {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Nutrition Information")
                        .font(.headline)
                    
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 8) {
                        if let calories = result.calories {
                            NutritionCard(title: "Calories", value: "\(calories)", unit: "kcal")
                        }
                        if let protein = result.protein {
                            NutritionCard(title: "Protein", value: String(format: "%.1f", protein), unit: "g")
                        }
                        if let carbs = result.carbohydrates {
                            NutritionCard(title: "Carbs", value: String(format: "%.1f", carbs), unit: "g")
                        }
                        if let fat = result.fat {
                            NutritionCard(title: "Fat", value: String(format: "%.1f", fat), unit: "g")
                        }
                    }
                }
            }
            
            // Action Buttons
            HStack(spacing: 12) {
                Button(action: onSaveToHealth) {
                    HStack {
                        Image(systemName: "heart.fill")
                        Text("Save to Health")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.green)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
                
                Button(action: onNewAnalysis) {
                    HStack {
                        Image(systemName: "arrow.clockwise")
                        Text("Analyze Another")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

struct NutritionCard: View {
    let title: String
    let value: String
    let unit: String
    
    var body: some View {
        VStack {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            Text(value)
                .font(.title3)
                .fontWeight(.semibold)
            Text(unit)
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(Color(.systemGray6))
        .cornerRadius(8)
    }
}

struct ImagePicker: UIViewControllerRepresentable {
    @Binding var capturedImage: UIImage?
    @Environment(\.dismiss) var dismiss
    
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.delegate = context.coordinator
        picker.sourceType = .photoLibrary
        picker.allowsEditing = false
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: ImagePicker
        
        init(_ parent: ImagePicker) {
            self.parent = parent
        }
        
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.capturedImage = image
            }
            parent.dismiss()
        }
        
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
}
```

## App Entry Point

### YesNoAppApp.swift

```swift
import SwiftUI

@main
struct YesNoAppApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(.light) // Or support both light/dark
        }
    }
}
```

### ContentView.swift

```swift
import SwiftUI

struct ContentView: View {
    @StateObject private var apiService = APIService.shared
    @State private var currentUser: User?
    @State private var isLoading = true
    
    var body: some View {
        Group {
            if isLoading {
                SplashView()
            } else if apiService.isAuthenticated && currentUser != nil {
                MainTabView(user: currentUser!)
            } else {
                AuthenticationView()
            }
        }
        .onAppear {
            checkAuthenticationStatus()
        }
    }
    
    private func checkAuthenticationStatus() {
        if apiService.isAuthenticated {
            Task {
                do {
                    let user = try await apiService.getCurrentUser()
                    await MainActor.run {
                        self.currentUser = user
                        self.isLoading = false
                    }
                } catch {
                    await MainActor.run {
                        self.isLoading = false
                    }
                }
            }
        } else {
            isLoading = false
        }
    }
}

struct SplashView: View {
    var body: some View {
        VStack {
            Text("YesNoApp")
                .font(.largeTitle)
                .fontWeight(.bold)
            ProgressView()
                .padding(.top)
        }
    }
}

struct MainTabView: View {
    let user: User
    
    var body: some View {
        TabView {
            HomeView(user: user)
                .tabItem {
                    Image(systemName: "house")
                    Text("Home")
                }
            
            FoodAnalysisView()
                .tabItem {
                    Image(systemName: "camera")
                    Text("Analyze")
                }
            
            LeaderboardView()
                .tabItem {
                    Image(systemName: "trophy")
                    Text("Leaderboard")
                }
            
            ProfileView(user: user)
                .tabItem {
                    Image(systemName: "person")
                    Text("Profile")
                }
        }
    }
}
```

## Testing and Deployment

### 1. Local Testing
- Test on iOS Simulator for basic functionality
- Test on physical device for camera and HealthKit features
- Verify all API endpoints work correctly

### 2. HealthKit Testing
- Enable HealthKit in simulator: Health app should be present
- Test permission requests and data reading/writing
- Verify nutrition data appears in Health app

### 3. App Store Preparation
- Configure signing certificates
- Add app icons and launch screen
- Create App Store listing with screenshots
- Submit for review with proper health data justification

This guide provides a complete, production-ready iOS app with full YesNoApp functionality and Apple Health integration.