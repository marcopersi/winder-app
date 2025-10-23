# CI/CD Quick Reference

## 🚀 Quick Start

```bash
# 1. Set up GitHub Secrets (see docs/CI-CD-SETUP.md)
# 2. Push to main or create PR
# 3. Watch Actions tab for build status
```

## 📊 Status Badges

Add to your README:
```markdown
[![CI/CD Pipeline](https://github.com/marcopersi/winder-app/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/marcopersi/winder-app/actions)
[![codecov](https://codecov.io/gh/marcopersi/winder-app/branch/main/graph/badge.svg)](https://codecov.io/gh/marcopersi/winder-app)
```

## 🔍 Local Checks (Before Pushing)

```bash
# Run all pre-push checks
npm run lint              # Lint code
npx tsc --noEmit         # Type check
npm test                 # Run tests
npm audit                # Check vulnerabilities

# iOS build check
cd ios && xcodebuild -workspace WinderApp.xcworkspace \
  -scheme WinderApp -sdk iphonesimulator clean build

# Android build check
cd android && ./gradlew assembleDebug
```

## 📝 Workflow Triggers

| Event | Branches | Jobs |
|-------|----------|------|
| `push` | `main`, `develop` | All jobs |
| `pull_request` | `main`, `develop` | All jobs + dependency review |

## 🎯 Jobs Overview

| Job | Duration | Runner | Purpose |
|-----|----------|--------|---------|
| `lint` | ~2 min | ubuntu | ESLint + TypeScript |
| `test` | ~3 min | ubuntu | Jest tests + coverage |
| `security` | ~5 min | ubuntu | Vulnerability scanning |
| `build-ios` | ~15 min | macos-14 | iOS build + tests |
| `build-android` | ~8 min | ubuntu | Android APK |
| `code-quality` | ~4 min | ubuntu | SonarCloud analysis |

## 🔐 Required Secrets

| Secret | Required | Purpose |
|--------|----------|---------|
| `SONAR_TOKEN` | Optional | Code quality analysis |
| `CODECOV_TOKEN` | Optional | Coverage reporting |
| `SNYK_TOKEN` | Optional | Security scanning |

## 🐛 Debugging Failed Builds

### Lint Failures
```bash
# Check locally
npm run lint

# Fix automatically
npm run lint -- --fix
```

### Test Failures
```bash
# Run tests locally
npm test

# Run specific test
npm test -- CharacteristicFilter.test.tsx

# Update snapshots
npm test -- -u
```

### iOS Build Failures
```bash
# Clean and rebuild
cd ios
rm -rf build Pods Podfile.lock
bundle exec pod install
cd ..
npx react-native run-ios
```

### Android Build Failures
```bash
# Clean gradle
cd android
./gradlew clean
./gradlew assembleDebug --stacktrace
```

### Type Check Failures
```bash
# Check types
npx tsc --noEmit

# Common fixes:
# - Add missing type annotations
# - Update imports
# - Check tsconfig.json
```

## 📦 Dependency Updates

Dependabot automatically creates PRs for:
- **npm packages** (weekly, Monday)
- **CocoaPods** (weekly, Monday)
- **Gradle** (weekly, Monday)
- **GitHub Actions** (weekly, Monday)

### Merge Dependabot PRs
```bash
# 1. Review changes in PR
# 2. Wait for CI to pass
# 3. Test locally if needed
# 4. Approve and merge
```

## 🔄 Manual Workflow Run

1. Go to Actions tab
2. Select workflow
3. Click "Run workflow"
4. Select branch
5. Click "Run workflow"

## 📈 Viewing Reports

### Test Coverage
```bash
# Local HTML report
npm test -- --coverage
open coverage/lcov-report/index.html

# Online
https://codecov.io/gh/marcopersi/winder-app
```

### Code Quality
```bash
# Online dashboard
https://sonarcloud.io/project/overview?id=marcopersi_winder-app
```

### Security Vulnerabilities
```bash
# Local check
npm audit

# Online
https://github.com/marcopersi/winder-app/security
```

## 🚨 Common Issues & Solutions

### "Out of GitHub Actions minutes"
- **Solution**: Use self-hosted runners or upgrade plan
- **Free tier**: 2,000 minutes/month

### "iOS build timeout"
- **Solution**: Increase timeout in workflow
```yaml
timeout-minutes: 30  # Default is 360
```

### "CocoaPods install failed"
- **Solution**: Clear cache and retry
```yaml
- name: Clear CocoaPods cache
  run: pod cache clean --all
```

### "Android SDK not found"
- **Solution**: Verify ANDROID_HOME
```yaml
- name: Setup Android SDK
  uses: android-actions/setup-android@v3
```

## ⚡ Performance Optimization

### Cache Dependencies
```yaml
# npm cache
- uses: actions/setup-node@v4
  with:
    cache: 'npm'

# Gradle cache
- uses: gradle/gradle-build-action@v2
  with:
    cache-read-only: false
```

### Parallel Jobs
```yaml
# Run iOS and Android in parallel
build-ios:
  needs: [lint, test]  # Don't wait for security

build-android:
  needs: [lint, test]  # Run at same time as iOS
```

### Skip CI
Add to commit message:
```bash
git commit -m "docs: update README [skip ci]"
```

## 📞 Support

- **Workflow issues**: Check logs in Actions tab
- **SonarCloud**: https://community.sonarsource.com
- **Codecov**: https://community.codecov.com
- **GitHub Actions**: https://github.com/community

## 🔗 Quick Links

- [Actions Dashboard](https://github.com/marcopersi/winder-app/actions)
- [Security Alerts](https://github.com/marcopersi/winder-app/security)
- [Dependabot PRs](https://github.com/marcopersi/winder-app/pulls?q=is%3Apr+author%3Aapp%2Fdependabot)
- [Full Setup Guide](docs/CI-CD-SETUP.md)
