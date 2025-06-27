# Veridect Flutter Development Guide

## Overview

This guide provides comprehensive instructions for reproducing the Veridect AI-powered nutrition analysis platform in Flutter. Veridect is a live revenue-generating application with patent-pending AI technology that provides personalized "Yes/No/OK" food verdicts through Google Gemini AI integration.

## Business Model & Subscription Tiers

### Revenue Model
- **Free Tier** (€0): 5 analyses per day, basic nutritional info, simple verdicts
- **Pro Tier** (€12/year - billed yearly in advance): Unlimited analyses, food logging, challenges, leaderboard, personalization
- **Advanced Tier** (€50/month - coming soon): Medical features, priority support, advanced analytics

Note: Pro tier is billed yearly in advance (€12/year) not monthly. This is a key business model difference from other apps.

## Key Features to Implement

### Core Features
- Multi-provider authentication (Email/Password, Google, Apple ID)
- Camera-based food analysis with Google Gemini AI
- Real-time food verdicts (YES/NO/OK) with explanations and calorie estimates
- Dual point system (lifetime points for levels, weekly points for leaderboards)
- Position-ranked weekly leaderboards (#1, #2, #3, etc.)
- Daily challenges and streak tracking with bonus point awards
- Comprehensive gamification with milestone rewards (Health Expert/Master/Legend)
- Interface preference toggles (calorie counter, food statistics visibility)
- GDPR compliance with consent management
- Spanish contact information (info@veridect.com, +34 672 810 584)

### Advanced Features (Pro/Advanced Tiers)
- Food logging history with "Yum/Nah" tracking
- Weekly challenge participation with opt-out capability
- Progress tracking with level progression (1000 points per level)
- Community leaderboards with real-time rank updates
- Personalized AI analysis based on health goals and dietary preferences
- Nutritional insights and detailed food analysis reports

## Dual Point System Architecture

Veridect implements a sophisticated dual point tracking system that the Flutter app must replicate exactly:

### Point System Components
- **Lifetime Points (totalPoints)**: NEVER RESET - accumulate forever for level progression (1000 points per level)
- **Weekly Points**: RESET every Monday midnight Madrid time - used for leaderboard competition
- **Point Synchronization**: Both systems receive identical point amounts each week
- **Consistent Scoring**: YES=10, OK=5, NO=2 points plus bonus points from challenges

### Point Sources
1. **Food Logging**: Points awarded when user clicks "Yum" button after analysis
2. **Bonus Challenges**: 
   - 3 consecutive YES foods: +50 points
   - 5 analyses in one day: +25 points  
   - 10 analyses in one day: +50 points
   - 5 YES foods in one day: +100 points
   - First analysis of the day: +25 points
3. **Milestone Rewards**:
   - Health Expert (15 YES foods): +250 points
   - Health Master (30 YES foods): +500 points
   - Health Legend (50 YES foods): +1000 points

### Implementation Requirements
```dart
class PointSystem {
  final ApiService _apiService;
  
  PointSystem(this._apiService);
  
  // Dual tracking - both counters must be updated simultaneously
  Future<void> awardFoodPoints(String verdict, String userId) async {
    final points = _getPointsForVerdict(verdict); // YES=10, OK=5, NO=2
    await _apiService.updateLifetimePoints(userId, points);
    await _apiService.updateWeeklyPoints(userId, points);
  }
  
  Future<void> awardBonusPoints(String bonusType, int points, String userId) async {
    await _apiService.updateLifetimePoints(userId, points);
    await _apiService.updateWeeklyPoints(userId, points);
    await _apiService.markBonusAwarded(userId, bonusType);
  }
  
  int _getPointsForVerdict(String verdict) {
    switch (verdict) {
      case 'YES': return 10;
      case 'OK': return 5;
      case 'NO': return 2;
      default: return 0;
    }
  }
}
```

## Interface Preference System

The app must implement user-configurable interface toggles (Pro tier only):

### Toggle Controls
- **Show Calorie Counter**: Controls visibility of daily calorie tracking cards
- **Show Food Statistics**: Controls visibility of Yes/OK/No verdict statistics
- **Weekly Challenge Participation**: Allows users to opt out of leaderboard competition

### Implementation
```dart
class InterfacePreferences {
  final bool showCalorieCounter;
  final bool showFoodStats;
  final bool participateInWeeklyChallenge;
  
  const InterfacePreferences({
    this.showCalorieCounter = true,
    this.showFoodStats = true,
    this.participateInWeeklyChallenge = true,
  });
  
  factory InterfacePreferences.fromJson(Map<String, dynamic> json) {
    return InterfacePreferences(
      showCalorieCounter: json['showCalorieCounter'] ?? true,
      showFoodStats: json['showFoodStats'] ?? true,
      participateInWeeklyChallenge: json['participateInWeeklyChallenge'] ?? true,
    );
  }
}

// Usage in UI
Widget _buildHomeContent(User user) {
  final preferences = user.privacySettings;
  
  return Column(
    children: [
      if (preferences?.showCalorieCounter == true && user.subscriptionTier == 'pro')
        const CalorieDashboardCard(),
      if (preferences?.showFoodStats == true && user.subscriptionTier == 'pro')
        const FoodStatsCard(),
    ],
  );
}
```

## Calorie Consistency System

The Flutter app must implement the comprehensive calorie consistency system for accurate food analysis:

### Key Components
- **Food Name Normalization**: Standardize food names for cache lookup consistency
- **Calorie Reference Ranges**: Use established calorie ranges for validation
- **Post-Processing Validation**: Apply nutritional value validation after AI analysis
- **Intelligent Caching**: Cache results by normalized food name and user profile

### Implementation Requirements
```dart
class CalorieConsistencyManager {
  static const Map<String, List<int>> _referenceRanges = {
    'apple': [80, 120],
    'banana': [90, 140],
    'chicken breast': [150, 200],
    'rice': [130, 180],
    'pasta': [160, 220],
    // Add comprehensive food database
  };
  
  String normalizeFoodName(String foodName) {
    return foodName
        .toLowerCase()
        .replaceAll(RegExp(r'\s+'), ' ')
        .trim();
  }
  
  int validateCalories(int calories, String foodName) {
    final normalizedName = normalizeFoodName(foodName);
    final range = _referenceRanges[normalizedName];
    
    if (range != null && (calories < range[0] || calories > range[1])) {
      return (range[0] + range[1]) ~/ 2; // Return average if out of range
    }
    
    return calories;
  }
  
  String getCacheKey({String? foodName, String? imageData, Map<String, dynamic>? userProfile}) {
    final parts = <String>[];
    
    if (foodName != null) {
      parts.add('food:${normalizeFoodName(foodName)}');
    }
    
    if (imageData != null) {
      // Create hash of image data for caching
      parts.add('img:${imageData.hashCode}');
    }
    
    if (userProfile != null) {
      final profileHash = userProfile.toString().hashCode;
      parts.add('profile:$profileHash');
    }
    
    return parts.join('|');
  }
}
```

## Project Structure

### Development Environment
- **Framework**: Flutter 3.16.0+
- **Dart SDK**: 3.2.0+
- **State Management**: Provider or Riverpod
- **HTTP Client**: Dio for API requests
- **Local Storage**: shared_preferences and secure_storage
- **Camera**: camera plugin
- **Image Processing**: image_picker and image plugins

### Project Structure
```
lib/
├── main.dart
├── app/
│   ├── app.dart
│   ├── router.dart
│   └── theme/
├── core/
│   ├── constants/
│   ├── utils/
│   ├── services/
│   └── extensions/
├── data/
│   ├── models/
│   ├── repositories/
│   ├── datasources/
│   └── local/
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── usecases/
├── presentation/
│   ├── pages/
│   ├── widgets/
│   ├── providers/
│   └── theme/
└── features/
    ├── auth/
    ├── food_analysis/
    ├── profile/
    ├── leaderboard/
    ├── progress/
    ├── subscription/
    └── challenges/
```

## Core Dependencies

Add these dependencies to your `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  provider: ^6.1.1
  
  # HTTP & API
  dio: ^5.4.0
  json_annotation: ^4.8.1
  
  # Local Storage
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0
  
  # Camera & Images
  camera: ^0.10.5
  image_picker: ^1.0.4
  image: ^4.1.3
  
  # UI Components
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.0
  
  # Authentication
  google_sign_in: ^6.1.6
  sign_in_with_apple: ^5.0.0
  
  # Payments
  flutter_stripe: ^10.1.0
  
  # Utils
  intl: ^0.18.1
  crypto: ^3.0.3
  
dev_dependencies:
  flutter_test:
    sdk: flutter
  json_serializable: ^6.7.1
  build_runner: ^2.4.7
```

## Data Models

### User Model
```dart
import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';

@JsonSerializable()
class User {
  final String id;
  final String? email;
  final String? firstName;
  final String? lastName;
  final String? profileImageUrl;
  final String subscriptionTier;
  final int calorieGoal;
  final int currentStreak;
  final int totalPoints;
  final int currentLevel;
  final PrivacySettings? privacySettings;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  
  User({
    required this.id,
    this.email,
    this.firstName,
    this.lastName,
    this.profileImageUrl,
    required this.subscriptionTier,
    required this.calorieGoal,
    required this.currentStreak,
    required this.totalPoints,
    required this.currentLevel,
    this.privacySettings,
    this.createdAt,
    this.updatedAt,
  });
  
  String get displayName {
    if (firstName != null && lastName != null) {
      return '$firstName $lastName';
    } else if (firstName != null) {
      return firstName!;
    } else {
      return email ?? 'User';
    }
  }
  
  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}

@JsonSerializable()
class PrivacySettings {
  final bool shareDataForResearch;
  final bool allowMarketing;
  final bool shareWithHealthProviders;
  final bool showCalorieCounter;
  final bool participateInWeeklyChallenge;
  final bool showFoodStats;
  
  PrivacySettings({
    required this.shareDataForResearch,
    required this.allowMarketing,
    required this.shareWithHealthProviders,
    required this.showCalorieCounter,
    required this.participateInWeeklyChallenge,
    required this.showFoodStats,
  });
  
  factory PrivacySettings.fromJson(Map<String, dynamic> json) => _$PrivacySettingsFromJson(json);
  Map<String, dynamic> toJson() => _$PrivacySettingsToJson(this);
}
```

### Food Analysis Model
```dart
@JsonSerializable()
class FoodAnalysisRequest {
  final String? imageData;
  final String? foodName;
  final DateTime timestamp;
  
  FoodAnalysisRequest({
    this.imageData,
    this.foodName,
    required this.timestamp,
  });
  
  factory FoodAnalysisRequest.fromJson(Map<String, dynamic> json) => _$FoodAnalysisRequestFromJson(json);
  Map<String, dynamic> toJson() => _$FoodAnalysisRequestToJson(this);
}

@JsonSerializable()
class FoodAnalysisResponse {
  final String foodName;
  final FoodVerdict verdict;
  final String explanation;
  final int? calories;
  final double? protein;
  final double? carbohydrates;
  final double? fat;
  final double? fiber;
  final double? sugar;
  final double? sodium;
  final int confidence;
  final String? portion;
  final List<String>? alternatives;
  
  FoodAnalysisResponse({
    required this.foodName,
    required this.verdict,
    required this.explanation,
    this.calories,
    this.protein,
    this.carbohydrates,
    this.fat,
    this.fiber,
    this.sugar,
    this.sodium,
    required this.confidence,
    this.portion,
    this.alternatives,
  });
  
  factory FoodAnalysisResponse.fromJson(Map<String, dynamic> json) => _$FoodAnalysisResponseFromJson(json);
  Map<String, dynamic> toJson() => _$FoodAnalysisResponseToJson(this);
}

enum FoodVerdict {
  @JsonValue('YES')
  yes,
  @JsonValue('NO') 
  no,
  @JsonValue('OK')
  ok,
}
```

## Authentication Implementation

### Multi-Provider Authentication Service
```dart
class AuthService {
  final Dio _dio;
  final FlutterSecureStorage _secureStorage;
  
  AuthService(this._dio, this._secureStorage);
  
  Future<User?> loginWithEmail(String email, String password) async {
    try {
      final response = await _dio.post('/api/auth/login', data: {
        'email': email,
        'password': password,
      });
      
      final authResponse = AuthResponse.fromJson(response.data);
      await _secureStorage.write(key: 'auth_token', value: authResponse.token);
      return authResponse.user;
    } catch (e) {
      throw AuthException('Login failed: ${e.toString()}');
    }
  }
  
  Future<User?> registerWithEmail(String email, String password, String firstName, String lastName) async {
    try {
      final response = await _dio.post('/api/auth/register', data: {
        'email': email,
        'password': password,
        'firstName': firstName,
        'lastName': lastName,
      });
      
      final authResponse = AuthResponse.fromJson(response.data);
      await _secureStorage.write(key: 'auth_token', value: authResponse.token);
      return authResponse.user;
    } catch (e) {
      throw AuthException('Registration failed: ${e.toString()}');
    }
  }
  
  Future<User?> loginWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
      if (googleUser == null) return null;
      
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      
      final response = await _dio.post('/api/auth/google', data: {
        'idToken': googleAuth.idToken,
      });
      
      final authResponse = AuthResponse.fromJson(response.data);
      await _secureStorage.write(key: 'auth_token', value: authResponse.token);
      return authResponse.user;
    } catch (e) {
      throw AuthException('Google sign-in failed: ${e.toString()}');
    }
  }
  
  Future<User?> loginWithApple() async {
    try {
      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );
      
      final response = await _dio.post('/api/auth/apple', data: {
        'identityToken': credential.identityToken,
        'authorizationCode': credential.authorizationCode,
        'user': {
          'name': {
            'givenName': credential.givenName,
            'familyName': credential.familyName,
          },
          'email': credential.email,
        },
      });
      
      final authResponse = AuthResponse.fromJson(response.data);
      await _secureStorage.write(key: 'auth_token', value: authResponse.token);
      return authResponse.user;
    } catch (e) {
      throw AuthException('Apple sign-in failed: ${e.toString()}');
    }
  }
  
  Future<void> logout() async {
    await _secureStorage.delete(key: 'auth_token');
    await GoogleSignIn().signOut();
  }
}
```

## Food Analysis Implementation

### Camera Integration
```dart
class CameraService {
  CameraController? _controller;
  
  Future<void> initializeCamera() async {
    final cameras = await availableCameras();
    if (cameras.isEmpty) throw Exception('No cameras available');
    
    _controller = CameraController(
      cameras.first,
      ResolutionPreset.high,
      enableAudio: false,
    );
    
    await _controller!.initialize();
  }
  
  Future<String?> captureImage() async {
    if (_controller == null || !_controller!.value.isInitialized) {
      throw Exception('Camera not initialized');
    }
    
    final XFile image = await _controller!.takePicture();
    final bytes = await image.readAsBytes();
    return base64Encode(bytes);
  }
  
  void dispose() {
    _controller?.dispose();
  }
}
```

### Food Analysis Service
```dart
class FoodAnalysisService {
  final Dio _dio;
  final CalorieConsistencyManager _consistencyManager;
  
  FoodAnalysisService(this._dio, this._consistencyManager);
  
  Future<FoodAnalysisResponse> analyzeFood({
    String? imageData,
    String? foodName,
  }) async {
    try {
      final request = FoodAnalysisRequest(
        imageData: imageData,
        foodName: foodName,
        timestamp: DateTime.now(),
      );
      
      final response = await _dio.post(
        '/api/food/analyze',
        data: request.toJson(),
      );
      
      final analysisResult = FoodAnalysisResponse.fromJson(response.data);
      
      // Apply calorie consistency validation
      if (analysisResult.calories != null) {
        final validatedCalories = _consistencyManager.validateCalories(
          analysisResult.calories!,
          analysisResult.foodName,
        );
        
        return FoodAnalysisResponse(
          foodName: analysisResult.foodName,
          verdict: analysisResult.verdict,
          explanation: analysisResult.explanation,
          calories: validatedCalories,
          protein: analysisResult.protein,
          carbohydrates: analysisResult.carbohydrates,
          fat: analysisResult.fat,
          fiber: analysisResult.fiber,
          sugar: analysisResult.sugar,
          sodium: analysisResult.sodium,
          confidence: analysisResult.confidence,
          portion: analysisResult.portion,
          alternatives: analysisResult.alternatives,
        );
      }
      
      return analysisResult;
    } catch (e) {
      throw FoodAnalysisException('Food analysis failed: ${e.toString()}');
    }
  }
  
  Future<void> logFood(FoodAnalysisResponse analysis, bool isYum) async {
    try {
      await _dio.post('/api/food/log', data: {
        'foodName': analysis.foodName,
        'verdict': analysis.verdict.toString().split('.').last.toUpperCase(),
        'calories': analysis.calories,
        'isLogged': isYum,
        'explanation': analysis.explanation,
        'confidence': analysis.confidence,
      });
    } catch (e) {
      throw FoodAnalysisException('Food logging failed: ${e.toString()}');
    }
  }
}
```

## Subscription & Payment Integration

### Stripe Integration
```dart
class SubscriptionService {
  final Dio _dio;
  
  SubscriptionService(this._dio);
  
  Future<void> initializeStripe() async {
    // Initialize Stripe with publishable key
    Stripe.publishableKey = 'pk_live_...'; // Your Stripe publishable key
  }
  
  Future<void> createSubscription(String priceId) async {
    try {
      // Create subscription on backend
      final response = await _dio.post('/api/create-subscription', data: {
        'priceId': priceId,
      });
      
      final clientSecret = response.data['clientSecret'];
      
      // Present payment sheet
      await Stripe.instance.presentPaymentSheet();
      
    } catch (e) {
      throw SubscriptionException('Subscription creation failed: ${e.toString()}');
    }
  }
  
  Future<List<SubscriptionTier>> getSubscriptionTiers() async {
    try {
      final response = await _dio.get('/api/subscription-tiers');
      return (response.data as List)
          .map((tier) => SubscriptionTier.fromJson(tier))
          .toList();
    } catch (e) {
      throw SubscriptionException('Failed to load subscription tiers: ${e.toString()}');
    }
  }
}
```

## UI Implementation Examples

### Home Screen with Interface Preferences
```dart
class HomeScreen extends StatelessWidget {
  const HomeScreen({Key? key}) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Consumer<UserProvider>(
      builder: (context, userProvider, child) {
        final user = userProvider.user;
        if (user == null) return const LoginScreen();
        
        return Scaffold(
          body: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildWelcomeHeader(user),
                  const SizedBox(height: 20),
                  
                  // Conditional UI based on preferences and tier
                  if (_shouldShowCalorieCounter(user))
                    const CalorieDashboardCard(),
                  
                  const SizedBox(height: 16),
                  const QuickAnalysisCard(),
                  
                  const SizedBox(height: 16),
                  if (_shouldShowFoodStats(user))
                    const FoodStatsCard(),
                  
                  const SizedBox(height: 16),
                  if (user.subscriptionTier == 'pro' || user.subscriptionTier == 'advanced')
                    const ChallengesCard(),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
  
  bool _shouldShowCalorieCounter(User user) {
    return user.privacySettings?.showCalorieCounter == true && 
           (user.subscriptionTier == 'pro' || user.subscriptionTier == 'advanced');
  }
  
  bool _shouldShowFoodStats(User user) {
    return user.privacySettings?.showFoodStats == true && 
           (user.subscriptionTier == 'pro' || user.subscriptionTier == 'advanced');
  }
  
  Widget _buildWelcomeHeader(User user) {
    return Row(
      children: [
        if (user.profileImageUrl != null)
          CircleAvatar(
            radius: 24,
            backgroundImage: CachedNetworkImageProvider(user.profileImageUrl!),
          )
        else
          const CircleAvatar(
            radius: 24,
            child: Icon(Icons.person),
          ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Hello, ${user.firstName ?? 'there'}!',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              Text(
                'Level ${user.currentLevel} • ${user.totalPoints} points',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
```

### Food Analysis Screen
```dart
class FoodAnalysisScreen extends StatefulWidget {
  const FoodAnalysisScreen({Key? key}) : super(key: key);
  
  @override
  State<FoodAnalysisScreen> createState() => _FoodAnalysisScreenState();
}

class _FoodAnalysisScreenState extends State<FoodAnalysisScreen> {
  final CameraService _cameraService = CameraService();
  final TextEditingController _foodNameController = TextEditingController();
  FoodAnalysisResponse? _analysisResult;
  bool _isAnalyzing = false;
  
  @override
  void initState() {
    super.initState();
    _cameraService.initializeCamera();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Analyze Food'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Camera preview or image input
            Expanded(
              flex: 2,
              child: _buildCameraSection(),
            ),
            
            const SizedBox(height: 16),
            
            // Text input for food name
            TextField(
              controller: _foodNameController,
              decoration: const InputDecoration(
                labelText: 'Or describe your food',
                border: OutlineInputBorder(),
                hintText: 'e.g., grilled chicken salad',
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Analysis button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isAnalyzing ? null : _analyzeFood,
                child: _isAnalyzing
                    ? const CircularProgressIndicator()
                    : const Text('Analyze Food'),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Analysis result
            if (_analysisResult != null)
              Expanded(
                flex: 3,
                child: _buildAnalysisResult(_analysisResult!),
              ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildAnalysisResult(FoodAnalysisResponse result) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Verdict badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: _getVerdictColor(result.verdict),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                result.verdict.toString().split('.').last.toUpperCase(),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            
            const SizedBox(height: 12),
            
            // Food name and calories
            Text(
              result.foodName,
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            
            if (result.calories != null)
              Text(
                '${result.calories} calories',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
            
            const SizedBox(height: 12),
            
            // Explanation
            Text(
              result.explanation,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            
            const Spacer(),
            
            // Action buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _logFood(result, true),
                    icon: const Icon(Icons.thumb_up),
                    label: const Text('Yum'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _logFood(result, false),
                    icon: const Icon(Icons.thumb_down),
                    label: const Text('Nah'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
  
  Color _getVerdictColor(FoodVerdict verdict) {
    switch (verdict) {
      case FoodVerdict.yes:
        return Colors.green;
      case FoodVerdict.ok:
        return Colors.orange;
      case FoodVerdict.no:
        return Colors.red;
    }
  }
  
  Future<void> _analyzeFood() async {
    if (_foodNameController.text.isEmpty) {
      // Capture image from camera
      final imageData = await _cameraService.captureImage();
      if (imageData == null) return;
      
      setState(() => _isAnalyzing = true);
      
      try {
        final result = await context.read<FoodAnalysisService>().analyzeFood(
          imageData: imageData,
        );
        setState(() => _analysisResult = result);
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Analysis failed: ${e.toString()}')),
        );
      } finally {
        setState(() => _isAnalyzing = false);
      }
    } else {
      // Analyze by text
      setState(() => _isAnalyzing = true);
      
      try {
        final result = await context.read<FoodAnalysisService>().analyzeFood(
          foodName: _foodNameController.text,
        );
        setState(() => _analysisResult = result);
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Analysis failed: ${e.toString()}')),
        );
      } finally {
        setState(() => _isAnalyzing = false);
      }
    }
  }
  
  Future<void> _logFood(FoodAnalysisResponse result, bool isYum) async {
    try {
      await context.read<FoodAnalysisService>().logFood(result, isYum);
      
      if (isYum) {
        // Award points through point system
        final user = context.read<UserProvider>().user;
        if (user != null) {
          await context.read<PointSystem>().awardFoodPoints(
            result.verdict.toString().split('.').last.toUpperCase(),
            user.id,
          );
        }
      }
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(isYum ? 'Food logged!' : 'Thanks for the feedback!')),
      );
      
      Navigator.of(context).pop();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Logging failed: ${e.toString()}')),
      );
    }
  }
  
  @override
  void dispose() {
    _cameraService.dispose();
    _foodNameController.dispose();
    super.dispose();
  }
}
```

## GDPR Compliance Implementation

### Privacy Consent Management
```dart
class PrivacyConsentDialog extends StatefulWidget {
  const PrivacyConsentDialog({Key? key}) : super(key: key);
  
  @override
  State<PrivacyConsentDialog> createState() => _PrivacyConsentDialogState();
}

class _PrivacyConsentDialogState extends State<PrivacyConsentDialog> {
  bool _shareDataForResearch = false;
  bool _allowMarketing = false;
  bool _shareWithHealthProviders = false;
  bool _showCalorieCounter = true;
  bool _participateInWeeklyChallenge = true;
  bool _showFoodStats = true;
  
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Privacy & Data Preferences'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'To provide you with the best experience, we need your consent for the following data usage:',
              style: TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 16),
            
            _buildConsentItem(
              'AI Training & Research',
              'Help improve our AI by anonymously sharing your food analysis data',
              _shareDataForResearch,
              (value) => setState(() => _shareDataForResearch = value),
            ),
            
            _buildConsentItem(
              'Weekly Nutrition Emails',
              'Receive weekly nutrition tips and insights',
              _allowMarketing,
              (value) => setState(() => _allowMarketing = value),
            ),
            
            _buildConsentItem(
              'Health Provider Integration',
              'Allow sharing anonymized data with healthcare providers',
              _shareWithHealthProviders,
              (value) => setState(() => _shareWithHealthProviders = value),
            ),
            
            const Divider(),
            const Text('Interface Preferences:', style: TextStyle(fontWeight: FontWeight.bold)),
            
            _buildConsentItem(
              'Show Calorie Counter',
              'Display daily calorie tracking',
              _showCalorieCounter,
              (value) => setState(() => _showCalorieCounter = value),
            ),
            
            _buildConsentItem(
              'Weekly Challenge Participation',
              'Participate in community leaderboards',
              _participateInWeeklyChallenge,
              (value) => setState(() => _participateInWeeklyChallenge = value),
            ),
            
            _buildConsentItem(
              'Show Food Statistics',
              'Display Yes/OK/No food statistics',
              _showFoodStats,
              (value) => setState(() => _showFoodStats = value),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _saveConsent,
          child: const Text('Save Preferences'),
        ),
      ],
    );
  }
  
  Widget _buildConsentItem(String title, String description, bool value, Function(bool) onChanged) {
    return CheckboxListTile(
      title: Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
      subtitle: Text(description, style: const TextStyle(fontSize: 12)),
      value: value,
      onChanged: (newValue) => onChanged(newValue ?? false),
      controlAffinity: ListTileControlAffinity.leading,
    );
  }
  
  Future<void> _saveConsent() async {
    try {
      final privacySettings = PrivacySettings(
        shareDataForResearch: _shareDataForResearch,
        allowMarketing: _allowMarketing,
        shareWithHealthProviders: _shareWithHealthProviders,
        showCalorieCounter: _showCalorieCounter,
        participateInWeeklyChallenge: _participateInWeeklyChallenge,
        showFoodStats: _showFoodStats,
      );
      
      await context.read<UserService>().updatePrivacySettings(privacySettings);
      Navigator.of(context).pop();
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Privacy preferences saved!')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to save preferences: ${e.toString()}')),
      );
    }
  }
}
```

## Deployment Configuration

### Environment Configuration
```dart
class Environment {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://your-api-domain.com',
  );
  
  static const String stripePublishableKey = String.fromEnvironment(
    'STRIPE_PUBLISHABLE_KEY',
    defaultValue: 'pk_live_...',
  );
  
  static const String googleClientId = String.fromEnvironment(
    'GOOGLE_CLIENT_ID',
    defaultValue: 'your-google-client-id',
  );
  
  static const String appleClientId = String.fromEnvironment(
    'APPLE_CLIENT_ID',
    defaultValue: 'your-apple-client-id',
  );
}
```

### Build Configuration
```yaml
# android/app/build.gradle
android {
    compileSdkVersion 34
    defaultConfig {
        applicationId "com.veridect.app"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}

# ios/Runner/Info.plist
<key>CFBundleIdentifier</key>
<string>com.veridect.app</string>
<key>CFBundleDisplayName</key>
<string>Veridect</string>
```

## Testing Strategy

### Unit Tests
```dart
// test/services/point_system_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';

void main() {
  group('PointSystem', () {
    late PointSystem pointSystem;
    late MockApiService mockApiService;
    
    setUp(() {
      mockApiService = MockApiService();
      pointSystem = PointSystem(mockApiService);
    });
    
    test('should award correct points for YES verdict', () async {
      await pointSystem.awardFoodPoints('YES', 'user123');
      
      verify(mockApiService.updateLifetimePoints('user123', 10)).called(1);
      verify(mockApiService.updateWeeklyPoints('user123', 10)).called(1);
    });
    
    test('should award bonus points for challenges', () async {
      await pointSystem.awardBonusPoints('3_yes_streak', 50, 'user123');
      
      verify(mockApiService.updateLifetimePoints('user123', 50)).called(1);
      verify(mockApiService.updateWeeklyPoints('user123', 50)).called(1);
      verify(mockApiService.markBonusAwarded('user123', '3_yes_streak')).called(1);
    });
  });
}
```

## Performance Optimization

### Image Processing Optimization
```dart
class ImageProcessor {
  static Future<String> compressAndEncodeImage(XFile imageFile) async {
    final bytes = await imageFile.readAsBytes();
    final image = img.decodeImage(bytes);
    
    if (image == null) throw Exception('Failed to decode image');
    
    // Resize image if too large
    final resized = image.width > 1024 || image.height > 1024
        ? img.copyResize(image, width: 1024, height: 1024)
        : image;
    
    // Compress as JPEG
    final compressed = img.encodeJpg(resized, quality: 85);
    return base64Encode(compressed);
  }
}
```

## Security Considerations

### API Security
```dart
class ApiService {
  final Dio _dio;
  final FlutterSecureStorage _secureStorage;
  
  ApiService(this._dio, this._secureStorage) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add auth token to all requests
          final token = await _secureStorage.read(key: 'auth_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          // Handle 401 errors by refreshing token or redirecting to login
          if (error.response?.statusCode == 401) {
            await _secureStorage.delete(key: 'auth_token');
            // Navigate to login screen
          }
          handler.next(error);
        },
      ),
    );
  }
}
```

This comprehensive Flutter guide provides all the necessary components to reproduce the Veridect app with 100% feature parity, including the dual point system, interface preferences, subscription management, and GDPR compliance.