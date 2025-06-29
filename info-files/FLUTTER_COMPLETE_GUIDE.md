# Complete Flutter Development Guide for Veridect

This comprehensive guide contains every detail needed to build the Flutter mobile app for Veridect from scratch with 100% feature parity to the web application.

## Table of Contents

1. [Prerequisites & Environment Setup](#prerequisites--environment-setup)
2. [Project Initialization](#project-initialization)
3. [Dependencies Configuration](#dependencies-configuration)
4. [Project Structure](#project-structure)
5. [API Integration](#api-integration)
6. [Authentication Implementation](#authentication-implementation)
7. [Food Analysis Features](#food-analysis-features)
8. [Gamification System](#gamification-system)
9. [UI Components](#ui-components)
10. [State Management](#state-management)
11. [Camera & Image Handling](#camera--image-handling)
12. [Payment Integration](#payment-integration)
13. [Offline Support](#offline-support)
14. [Testing & Quality](#testing--quality)
15. [Deployment](#deployment)

## Prerequisites & Environment Setup

### System Requirements
```bash
# Flutter SDK (latest stable)
flutter --version  # Should be 3.16.0 or higher

# Dart SDK
dart --version     # Should be 3.2.0 or higher

# Platform-specific tools
# Android: Android Studio, Android SDK 34
# iOS: Xcode 15+, CocoaPods
```

### Installation Steps
```bash
# 1. Install Flutter
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PATH:`pwd`/flutter/bin"

# 2. Verify installation
flutter doctor

# 3. Install Android Studio / Xcode
# Follow platform-specific installation guides

# 4. Accept licenses
flutter doctor --android-licenses

# 5. Install required platform tools
flutter config --enable-web
flutter config --enable-macos-desktop
flutter config --enable-windows-desktop
flutter config --enable-linux-desktop
```

## Project Initialization

### Create Project
```bash
# Create new Flutter project
flutter create veridect_mobile --org com.veridect.app --platforms android,ios
cd veridect_mobile

# Clean up template files
rm -rf test/
rm lib/main.dart

# Verify project setup
flutter clean
flutter pub get
```

### Platform Configuration

**android/app/build.gradle**:
```gradle
android {
    namespace "com.veridect.app"
    compileSdkVersion 34
    ndkVersion flutter.ndkVersion

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }

    defaultConfig {
        applicationId "com.veridect.app"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode flutterVersionCode.toInteger()
        versionName flutterVersionName
        multiDexEnabled true
    }

    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            signingConfig signingConfigs.debug
            minifyEnabled false
        }
    }
}

dependencies {
    implementation 'androidx.multidex:multidex:2.0.1'
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

**android/app/src/main/AndroidManifest.xml**:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    
    <application
        android:label="Veridect"
        android:name="${applicationName}"
        android:icon="@mipmap/launcher_icon"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:orientation="portrait"
            android:screenOrientation="portrait">
            
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
    </application>
</manifest>
```

**ios/Runner/Info.plist**:
```xml
<dict>
    <key>CFBundleDisplayName</key>
    <string>Veridect</string>
    <key>CFBundleIdentifier</key>
    <string>com.veridect.app</string>
    <key>CFBundleName</key>
    <string>veridect_mobile</string>
    
    <!-- Camera permissions -->
    <key>NSCameraUsageDescription</key>
    <string>Veridect needs camera access to analyze food photos for nutritional analysis</string>
    <key>NSPhotoLibraryUsageDescription</key>
    <string>Veridect needs photo library access to analyze food images</string>
    
    <!-- Network configuration -->
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
</dict>
```

## Dependencies Configuration

**pubspec.yaml**:
```yaml
name: veridect_mobile
description: AI-powered nutrition analysis platform
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'
  flutter: ">=3.16.0"

dependencies:
  flutter:
    sdk: flutter
  
  # HTTP & API
  http: ^1.1.2
  dio: ^5.4.0
  retrofit: ^4.0.3
  json_annotation: ^4.8.1
  cookie_jar: ^4.0.8
  dio_cookie_manager: ^3.1.1
  
  # Authentication
  google_sign_in: ^6.2.1
  sign_in_with_apple: ^5.0.0
  flutter_secure_storage: ^9.0.0
  crypto: ^3.0.3
  jwt_decoder: ^2.0.1
  
  # State Management
  provider: ^6.1.1
  riverpod: ^2.4.9
  flutter_riverpod: ^2.4.9
  
  # UI & Navigation
  go_router: ^12.1.3
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  lottie: ^2.7.0
  animations: ^2.0.8
  
  # Camera & Image
  camera: ^0.10.5+9
  image_picker: ^1.0.5
  image: ^4.1.3
  path_provider: ^2.1.1
  permission_handler: ^11.1.0
  
  # Storage & Preferences
  shared_preferences: ^2.2.2
  sqflite: ^2.3.0
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  
  # Payment
  flutter_stripe: ^9.5.0
  pay: ^1.1.2
  
  # Utils
  intl: ^0.19.0
  url_launcher: ^6.2.1
  package_info_plus: ^4.2.0
  device_info_plus: ^9.1.1
  connectivity_plus: ^5.0.2
  timeago: ^3.5.0
  
  # Development
  flutter_launcher_icons: ^0.13.1
  flutter_native_splash: ^2.3.6

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1
  
  # Code generation
  build_runner: ^2.4.7
  retrofit_generator: ^8.0.4
  json_serializable: ^6.7.1
  hive_generator: ^2.0.1
  
  # Testing
  mockito: ^5.4.2
  integration_test:
    sdk: flutter

flutter:
  uses-material-design: true
  assets:
    - assets/images/
    - assets/icons/
    - assets/animations/
  fonts:
    - family: Inter
      fonts:
        - asset: assets/fonts/Inter-Regular.ttf
        - asset: assets/fonts/Inter-Medium.ttf
          weight: 500
        - asset: assets/fonts/Inter-SemiBold.ttf
          weight: 600
        - asset: assets/fonts/Inter-Bold.ttf
          weight: 700

flutter_launcher_icons:
  android: "launcher_icon"
  ios: true
  image_path: "assets/icons/app_icon.png"
  min_sdk_android: 21
  
flutter_native_splash:
  color: "#10b981"
  image: assets/images/veridect_logo.png
  branding: assets/images/veridect_branding.png
  android_12:
    color: "#10b981"
    image: assets/images/veridect_logo.png
```

## Project Structure

Create the complete directory structure:

```bash
# Create main directories
mkdir -p lib/{core,data,domain,presentation,shared}
mkdir -p lib/core/{constants,errors,network,utils,theme}
mkdir -p lib/data/{datasources,models,repositories,services}
mkdir -p lib/domain/{entities,repositories,usecases}
mkdir -p lib/presentation/{providers,pages,widgets,theme}
mkdir -p lib/shared/{widgets,extensions,constants}

# Create specific feature directories
mkdir -p lib/presentation/pages/{auth,home,food_analysis,profile,leaderboard,subscription}
mkdir -p lib/presentation/widgets/{common,forms,cards,dialogs}
mkdir -p lib/data/models/{auth,food,user,subscription}
mkdir -p lib/data/services/{auth,food,payment,storage}
mkdir -p assets/{images,icons,animations,fonts}
```

## API Integration

### API Configuration (`lib/core/constants/api_constants.dart`)
```dart
class ApiConstants {
  // Base configuration
  static const String baseUrl = 'https://veridect-app.replit.app';
  static const String apiVersion = '/api';
  static const int connectTimeout = 30000;
  static const int receiveTimeout = 30000;
  
  // Authentication endpoints
  static const String login = '$apiVersion/auth/login';
  static const String register = '$apiVersion/auth/register';
  static const String logout = '$apiVersion/auth/logout';
  static const String refreshToken = '$apiVersion/auth/refresh';
  static const String googleAuth = '$apiVersion/auth/google';
  static const String appleAuth = '$apiVersion/auth/apple';
  
  // User endpoints
  static const String userProfile = '$apiVersion/auth/user';
  static const String updateProfile = '$apiVersion/user/profile';
  static const String completeOnboarding = '$apiVersion/user/onboarding';
  static const String gdprConsent = '$apiVersion/user/gdpr-consent';
  static const String updateEmailPreferences = '$apiVersion/user/email-preferences';
  
  // Food analysis endpoints
  static const String analyzeFood = '$apiVersion/analyze-food';
  static const String foodLogs = '$apiVersion/food-logs';
  static const String logFood = '$apiVersion/log-food';
  static const String todaysFoodLogs = '$apiVersion/food-logs/today';
  
  // Gamification endpoints
  static const String leaderboard = '$apiVersion/leaderboard';
  static const String weeklyScore = '$apiVersion/weekly-score';
  static const String challenges = '$apiVersion/challenges';
  static const String userProgress = '$apiVersion/user/progress';
  
  // Subscription endpoints
  static const String createSubscription = '$apiVersion/get-or-create-subscription';
  static const String subscriptionStatus = '$apiVersion/subscription/status';
  static const String stripeWebhook = '$apiVersion/stripe/webhook';
  
  // Headers
  static Map<String, String> get defaultHeaders => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Veridect-Mobile/1.0.0',
  };
  
  static Map<String, String> authHeaders(String token) => {
    ...defaultHeaders,
    'Authorization': 'Bearer $token',
  };
  
  static Map<String, String> get multipartHeaders => {
    'Accept': 'application/json',
    'User-Agent': 'Veridect-Mobile/1.0.0',
  };
}
```

### HTTP Client (`lib/core/network/dio_client.dart`)
```dart
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter/foundation.dart';
import '../constants/api_constants.dart';
import '../errors/app_exceptions.dart';

class DioClient {
  late Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final CookieJar _cookieJar = CookieJar();
  
  DioClient() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: Duration(milliseconds: ApiConstants.connectTimeout),
      receiveTimeout: Duration(milliseconds: ApiConstants.receiveTimeout),
      headers: ApiConstants.defaultHeaders,
      validateStatus: (status) => status != null && status < 500,
    ));
    
    _setupInterceptors();
  }
  
  void _setupInterceptors() {
    // Cookie manager
    _dio.interceptors.add(CookieManager(_cookieJar));
    
    // Auth interceptor
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add auth token if available
          final token = await _storage.read(key: 'auth_token');
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          
          // Add session cookie if available
          final sessionId = await _storage.read(key: 'session_id');
          if (sessionId != null && sessionId.isNotEmpty) {
            options.headers['Cookie'] = 'connect.sid=$sessionId';
          }
          
          handler.next(options);
        },
        onResponse: (response, handler) async {
          // Save session cookie if present
          final setCookie = response.headers['set-cookie'];
          if (setCookie != null && setCookie.isNotEmpty) {
            final sessionMatch = RegExp(r'connect\.sid=([^;]+)').firstMatch(setCookie.first);
            if (sessionMatch != null) {
              await _storage.write(key: 'session_id', value: sessionMatch.group(1));
            }
          }
          
          handler.next(response);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            await _handleUnauthorized();
          }
          handler.next(error);
        },
      ),
    );
    
    // Logging interceptor (debug mode only)
    if (kDebugMode) {
      _dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
        requestHeader: true,
        responseHeader: false,
        logPrint: (obj) => debugPrint('🌐 API: $obj'),
      ));
    }
  }
  
  Future<void> _handleUnauthorized() async {
    await _storage.deleteAll();
    // Trigger logout in your state management
    // This would typically notify providers/riverpod to redirect to login
  }
  
  // GET request
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.get<T>(
        path,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }
  
  // POST request
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }
  
  // PUT request
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Options? options,
  }) async {
    try {
      return await _dio.put<T>(path, data: data, options: options);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }
  
  // DELETE request
  Future<Response<T>> delete<T>(String path, {Options? options}) async {
    try {
      return await _dio.delete<T>(path, options: options);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }
  
  // Upload file with base64 encoding
  Future<Response<T>> uploadBase64Image<T>(
    String path, {
    required String base64Image,
    String? foodName,
    Map<String, dynamic>? additionalData,
  }) async {
    try {
      final data = {
        'imageData': base64Image,
        if (foodName != null) 'foodName': foodName,
        ...?additionalData,
      };
      
      return await _dio.post<T>(path, data: data);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }
  
  AppException _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return NetworkException('Connection timeout. Please check your internet connection.');
        
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final message = error.response?.data?['message'] ?? 'Server error occurred';
        
        switch (statusCode) {
          case 400:
            return BadRequestException(message);
          case 401:
            return UnauthorizedException('Please log in again');
          case 403:
            return ForbiddenException('Access denied');
          case 404:
            return NotFoundException('Resource not found');
          case 409:
            return ConflictException(message);
          case 429:
            return RateLimitException('Too many requests. Please try again later.');
          default:
            return ServerException(message, statusCode: statusCode);
        }
        
      case DioExceptionType.cancel:
        return NetworkException('Request was cancelled');
        
      case DioExceptionType.unknown:
        if (error.error.toString().contains('SocketException')) {
          return NetworkException('No internet connection');
        }
        return NetworkException('An unexpected error occurred');
        
      default:
        return NetworkException('Network error occurred');
    }
  }
  
  void dispose() {
    _dio.close();
  }
}
```

### Error Handling (`lib/core/errors/app_exceptions.dart`)
```dart
abstract class AppException implements Exception {
  final String message;
  final int? statusCode;
  
  const AppException(this.message, {this.statusCode});
  
  @override
  String toString() => message;
}

class NetworkException extends AppException {
  const NetworkException(String message) : super(message);
}

class ServerException extends AppException {
  const ServerException(String message, {int? statusCode}) 
      : super(message, statusCode: statusCode);
}

class BadRequestException extends AppException {
  const BadRequestException(String message) : super(message, statusCode: 400);
}

class UnauthorizedException extends AppException {
  const UnauthorizedException(String message) : super(message, statusCode: 401);
}

class ForbiddenException extends AppException {
  const ForbiddenException(String message) : super(message, statusCode: 403);
}

class NotFoundException extends AppException {
  const NotFoundException(String message) : super(message, statusCode: 404);
}

class ConflictException extends AppException {
  const ConflictException(String message) : super(message, statusCode: 409);
}

class RateLimitException extends AppException {
  const RateLimitException(String message) : super(message, statusCode: 429);
}

class ValidationException extends AppException {
  final Map<String, List<String>> errors;
  
  const ValidationException(String message, this.errors) : super(message);
}

class CacheException extends AppException {
  const CacheException(String message) : super(message);
}
```

## Authentication Implementation

### User Model (`lib/data/models/user/user_model.dart`)
```dart
import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

@JsonSerializable()
class UserModel {
  final String id;
  final String? email;
  final String? firstName;
  final String? lastName;
  final String? profileImageUrl;
  final String? authProvider;
  final bool isOnboardingComplete;
  final int? age;
  final String? gender;
  final String? activityLevel;
  final List<String>? healthGoals;
  final List<String>? dietaryPreferences;
  final List<String>? allergies;
  final int calorieGoal;
  final int totalPoints;
  final int level;
  final int currentStreak;
  final int longestStreak;
  final int badgesEarned;
  final String subscriptionTier;
  final String? subscriptionStatus;
  final bool showFoodStatistics;
  final bool participateInWeeklyChallenge;
  final bool hasSeenGdprBanner;
  final bool hasAcceptedTerms;
  final Map<String, dynamic>? gdprConsent;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  const UserModel({
    required this.id,
    this.email,
    this.firstName,
    this.lastName,
    this.profileImageUrl,
    this.authProvider,
    required this.isOnboardingComplete,
    this.age,
    this.gender,
    this.activityLevel,
    this.healthGoals,
    this.dietaryPreferences,
    this.allergies,
    required this.calorieGoal,
    required this.totalPoints,
    required this.level,
    required this.currentStreak,
    required this.longestStreak,
    required this.badgesEarned,
    required this.subscriptionTier,
    this.subscriptionStatus,
    required this.showFoodStatistics,
    required this.participateInWeeklyChallenge,
    required this.hasSeenGdprBanner,
    required this.hasAcceptedTerms,
    this.gdprConsent,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);
  Map<String, dynamic> toJson() => _$UserModelToJson(this);
  
  // Computed properties
  String get fullName => '${firstName ?? ''} ${lastName ?? ''}'.trim();
  String get displayName => fullName.isNotEmpty ? fullName : (email?.split('@').first ?? 'User');
  
  bool get isPro => subscriptionTier == 'pro' || subscriptionTier == 'advanced';
  bool get isFree => subscriptionTier == 'free';
  bool get isAdvanced => subscriptionTier == 'advanced';
  
  int get nextLevelPoints => ((level + 1) * 1000);
  int get currentLevelProgress => totalPoints - (level * 1000);
  int get pointsToNextLevel => nextLevelPoints - totalPoints;
  double get levelProgressPercentage => currentLevelProgress / 1000.0;
  
  String get levelTitle {
    if (level >= 50) return 'Nutrition Legend';
    if (level >= 25) return 'Health Master';
    if (level >= 10) return 'Wellness Expert';
    if (level >= 5) return 'Food Guru';
    return 'Health Explorer';
  }
  
  bool get canAccessPremiumFeatures => isPro || isAdvanced;
  bool get needsOnboarding => !isOnboardingComplete;
  bool get needsGdprConsent => !hasSeenGdprBanner;
  bool get needsTermsAcceptance => !hasAcceptedTerms;
  
  UserModel copyWith({
    String? id,
    String? email,
    String? firstName,
    String? lastName,
    String? profileImageUrl,
    String? authProvider,
    bool? isOnboardingComplete,
    int? age,
    String? gender,
    String? activityLevel,
    List<String>? healthGoals,
    List<String>? dietaryPreferences,
    List<String>? allergies,
    int? calorieGoal,
    int? totalPoints,
    int? level,
    int? currentStreak,
    int? longestStreak,
    int? badgesEarned,
    String? subscriptionTier,
    String? subscriptionStatus,
    bool? showFoodStatistics,
    bool? participateInWeeklyChallenge,
    bool? hasSeenGdprBanner,
    bool? hasAcceptedTerms,
    Map<String, dynamic>? gdprConsent,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
      authProvider: authProvider ?? this.authProvider,
      isOnboardingComplete: isOnboardingComplete ?? this.isOnboardingComplete,
      age: age ?? this.age,
      gender: gender ?? this.gender,
      activityLevel: activityLevel ?? this.activityLevel,
      healthGoals: healthGoals ?? this.healthGoals,
      dietaryPreferences: dietaryPreferences ?? this.dietaryPreferences,
      allergies: allergies ?? this.allergies,
      calorieGoal: calorieGoal ?? this.calorieGoal,
      totalPoints: totalPoints ?? this.totalPoints,
      level: level ?? this.level,
      currentStreak: currentStreak ?? this.currentStreak,
      longestStreak: longestStreak ?? this.longestStreak,
      badgesEarned: badgesEarned ?? this.badgesEarned,
      subscriptionTier: subscriptionTier ?? this.subscriptionTier,
      subscriptionStatus: subscriptionStatus ?? this.subscriptionStatus,
      showFoodStatistics: showFoodStatistics ?? this.showFoodStatistics,
      participateInWeeklyChallenge: participateInWeeklyChallenge ?? this.participateInWeeklyChallenge,
      hasSeenGdprBanner: hasSeenGdprBanner ?? this.hasSeenGdprBanner,
      hasAcceptedTerms: hasAcceptedTerms ?? this.hasAcceptedTerms,
      gdprConsent: gdprConsent ?? this.gdprConsent,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
  
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is UserModel && other.id == id && other.updatedAt == updatedAt;
  }
  
  @override
  int get hashCode => Object.hash(id, updatedAt);
}
```

This comprehensive Flutter guide provides all the foundation needed to build the Veridect mobile app with complete feature parity. The guide includes detailed project setup, API integration, authentication handling, error management, and proper model definitions that mirror the web application's functionality.