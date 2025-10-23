# WinderApp

[![CI/CD Pipeline](https://github.com/marcopersi/winder-app/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/marcopersi/winder-app/actions/workflows/ci-cd.yml)
[![codecov](https://codecov.io/gh/marcopersi/winder-app/branch/main/graph/badge.svg)](https://codecov.io/gh/marcopersi/winder-app)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=marcopersi_winder-app&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=marcopersi_winder-app)

This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

# Most Used Commands

Here are the most frequently used commands for this React Native project:

## Development Commands

```sh
# Start the Metro bundler
npx react-native start

# Run on iOS simulator
cd /Users/marcopersi/development/WinderApp
npx react-native run-ios

#Option 2, a specific simulator
cd /Users/marcopersi/development/WinderApp
npx react-native run-ios --simulator="iPhone 16 Plus"

# Run on Android emulator/device
npx react-native run-android

# Clean Metro cache (useful for debugging)
npx react-native start --reset-cache

# Clean and rebuild iOS project
cd ios && xcodebuild clean && cd .. && npx react-native run-ios

# Clean and rebuild Android project
cd android && ./gradlew clean && cd .. && npx react-native run-android
```

## iOS Specific Commands

```sh
# Install CocoaPods dependencies (run after cloning or updating native deps)
cd ios && pod install && cd ..

# Or using bundle
bundle exec pod install

# Clean derived data (useful when Xcode builds fail)
rm -rf ~/Library/Developer/Xcode/DerivedData/

# Reset iOS simulator
npx react-native run-ios --simulator="iPhone 15"
```

## Android Specific Commands

```sh
# List available Android devices/emulators
adb devices

# Start Android emulator (replace with your AVD name)
emulator -avd Pixel_3a_API_30

# Clean Android build
cd android && ./gradlew clean && cd ..

# Generate debug APK
cd android && ./gradlew assembleDebug && cd ..
```

## Debugging Commands

```sh
# Open React Native debugger menu
# iOS: Cmd + D (in simulator)
# Android: Cmd + M or shake device

# Enable network inspector
npx react-native log-ios     # iOS logs
npx react-native log-android # Android logs

# Reset React Native cache completely
npx react-native start --reset-cache
rm -rf node_modules && npm install
```

## Package Management

```sh
# Install new package
npm install <package-name>

# Install React Native specific packages
npm install <package-name>
npx react-native link <package-name>  # For older RN versions

# Update packages
npm update

# Check for outdated packages
npm outdated
```

## Troubleshooting Commands

```sh
# Complete project reset (nuclear option)
rm -rf node_modules package-lock.json
npm install
cd ios && pod install && cd ..
npx react-native start --reset-cache

# Reset Metro bundler
npx react-native start --reset-cache

# Fix iOS build issues
cd ios && pod deintegrate && pod install && cd ..

# Fix Android build issues
cd android && ./gradlew clean && cd ..
rm -rf android/.gradle
```

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
