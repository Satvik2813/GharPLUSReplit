# GharPlus - Smart Indian Household Manager

A Flutter mobile app for smart household management built for Indian families.

## Features

- **Login Screen** - Google Sign-In + OTP via phone (+91)
- **Home Dashboard** - Weekly budget tracker, festival events, grocery stats, Order Now CTA
- **Meal Planner** - 7-day AI-powered Indian meal plan with day selector
- **Family Manager** - Household members, roles, invite codes, admin controls
- **Budget Tracker** - Weekly budget card, monthly savings report, Smart Swap savings
- **Minani AI** - Floating AI assistant for recipes, tips, and home remedies

## Design

- Dark theme (`#0A0A0A` background)
- Warm orange (`#E67E22`) primary accent
- Red (`#C62828`) for budget/spending cards
- Inter font family

## Getting Started in Android Studio

1. Install [Flutter SDK](https://flutter.dev/docs/get-started/install)
2. Install [Android Studio](https://developer.android.com/studio)
3. Install the Flutter and Dart plugins in Android Studio
4. Clone this repository
5. Open the `gharplus_flutter` folder in Android Studio
6. Run `flutter pub get` in the terminal
7. Connect an Android device or start an emulator
8. Run `flutter run`

## Project Structure

```
gharplus_flutter/
├── lib/
│   ├── main.dart              # App entry point
│   ├── theme.dart             # Colors & theme
│   ├── screens/
│   │   ├── login_screen.dart  # Login with Google/OTP
│   │   ├── main_nav.dart      # Bottom navigation
│   │   ├── home_screen.dart   # Dashboard
│   │   ├── plan_screen.dart   # Meal planner
│   │   ├── family_screen.dart # Family management
│   │   ├── budget_screen.dart # Budget tracker
│   │   └── minani_chat_screen.dart # AI chat
│   └── widgets/
│       ├── gharplus_header.dart # App header bar
│       └── minani_fab.dart      # Floating AI button
├── assets/
│   └── images/
│       └── logo.png           # GharPlus app logo
├── android/                   # Android project files
└── pubspec.yaml               # Dependencies
```

## Dependencies

- `shared_preferences` - Local storage
- `provider` - State management
- `http` - API calls
- `google_sign_in` - Google authentication
- `intl` - Date formatting
- `google_fonts` - Typography
- `percent_indicator` - Circular progress bars

## Color Palette

| Name | Hex |
|------|-----|
| Background | `#0A0A0A` |
| Surface | `#1A1A1A` |
| Primary (Orange) | `#E67E22` |
| Red Card | `#C62828` |
| Text Primary | `#FFFFFF` |
| Text Secondary | `#AAAAAA` |
