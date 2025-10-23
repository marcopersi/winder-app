# CI/CD Setup Guide

## Overview
This project uses GitHub Actions for automated CI/CD with the following features:
- ✅ Linting & Type Checking
- ✅ Unit Tests with Coverage
- ✅ Security & Vulnerability Scanning
- ✅ iOS & Android Builds
- ✅ Code Quality Analysis
- ✅ Automated Dependency Updates

## Required GitHub Secrets

### 1. SonarCloud (Optional but Recommended)
1. Go to [SonarCloud](https://sonarcloud.io)
2. Sign up/login with GitHub
3. Create new organization or use existing
4. Add project: `marcopersi/winder-app`
5. Copy the token
6. Add to GitHub Secrets:
   - Name: `SONAR_TOKEN`
   - Value: Your SonarCloud token

### 2. Codecov (Optional)
1. Go to [Codecov](https://codecov.io)
2. Login with GitHub
3. Add repository
4. Copy the token
5. Add to GitHub Secrets:
   - Name: `CODECOV_TOKEN`
   - Value: Your Codecov token

### 3. Snyk (Optional)
1. Go to [Snyk](https://snyk.io)
2. Login with GitHub
3. Get API token from Account Settings
4. Add to GitHub Secrets:
   - Name: `SNYK_TOKEN`
   - Value: Your Snyk API token

## Setting Up Secrets

Navigate to: `https://github.com/marcopersi/winder-app/settings/secrets/actions`

Click "New repository secret" and add:

```
SONAR_TOKEN: <your-sonarcloud-token>
CODECOV_TOKEN: <your-codecov-token>
SNYK_TOKEN: <your-snyk-token>
```

## Workflow Jobs

### 1. Lint & Type Check (`lint`)
- Runs ESLint on all TypeScript/JavaScript files
- Performs TypeScript type checking
- **Runs on**: Every push and PR

### 2. Unit Tests (`test`)
- Runs Jest test suite
- Generates coverage report
- Uploads coverage to Codecov
- **Runs on**: Every push and PR

### 3. Security Scan (`security`)
- `npm audit`: Checks for known vulnerabilities
- OWASP Dependency Check: Deep security analysis
- Snyk: Additional vulnerability scanning
- **Runs on**: Every push and PR

### 4. iOS Build (`build-ios`)
- Runs on macOS runner
- Installs CocoaPods dependencies
- Builds iOS app for simulator
- Runs iOS tests
- **Runs on**: After lint & test pass

### 5. Android Build (`build-android`)
- Builds Android Debug APK
- Runs Android unit tests
- Uploads APK as artifact
- **Runs on**: After lint & test pass

### 6. Code Quality (`code-quality`)
- Runs SonarCloud analysis
- Tracks code smells, bugs, vulnerabilities
- Monitors code coverage trends
- **Runs on**: Every push and PR

### 7. Dependency Review (`dependency-review`)
- Reviews new dependencies in PRs
- Checks for security issues
- **Runs on**: Pull requests only

## Branch Protection Rules (Recommended)

Go to: `Settings > Branches > Branch protection rules`

For `main` branch:
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging:
  - `lint`
  - `test`
  - `build-ios`
  - `build-android`
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging

## Local Setup

### Run all checks locally:
```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit

# Tests
npm test

# Security audit
npm audit

# iOS build
cd ios && xcodebuild -workspace WinderApp.xcworkspace -scheme WinderApp -sdk iphonesimulator clean build

# Android build
cd android && ./gradlew assembleDebug
```

## Dependabot

Dependabot will automatically:
- Check for dependency updates weekly (Mondays)
- Create PRs for npm, CocoaPods, Gradle, and GitHub Actions
- Label PRs appropriately
- Request review from @marcopersi

### Configure Dependabot
Edit `.github/dependabot.yml` to customize:
- Update frequency
- Number of open PRs
- Reviewers
- Labels

## Viewing Results

### Workflow Runs
- GitHub: `Actions` tab
- See detailed logs, artifacts, and test results

### Code Coverage
- Codecov dashboard: `https://codecov.io/gh/marcopersi/winder-app`

### Code Quality
- SonarCloud dashboard: `https://sonarcloud.io/project/overview?id=marcopersi_winder-app`

### Security Vulnerabilities
- GitHub Security tab: `Security > Dependabot alerts`
- Snyk dashboard: `https://app.snyk.io`

## Troubleshooting

### iOS Build Fails
```yaml
# Update iOS runner version in ci-cd.yml:
runs-on: macos-14  # or macos-13, macos-latest
```

### Android Build Fails
```yaml
# Update Java version in ci-cd.yml:
java-version: '17'  # or '11'
```

### Out of GitHub Actions Minutes
- Free tier: 2,000 minutes/month
- Consider:
  - Running fewer jobs
  - Using self-hosted runners
  - Upgrading GitHub plan

### Self-Hosted Runners (Advanced)
For faster builds and unlimited minutes:
1. Go to: `Settings > Actions > Runners > New self-hosted runner`
2. Follow setup instructions
3. Update workflow with: `runs-on: self-hosted`

## Best Practices

### 1. Keep Secrets Secure
- Never commit secrets to repository
- Rotate tokens regularly
- Use GitHub Secrets for sensitive data

### 2. Monitor Build Times
- iOS builds: ~10-15 min
- Android builds: ~5-10 min
- Optimize by caching dependencies

### 3. Review Security Alerts
- Check Dependabot PRs weekly
- Review security scan results
- Update vulnerable dependencies promptly

### 4. Code Quality
- Keep test coverage above 80%
- Address SonarCloud issues
- Follow TypeScript best practices

## Cost Optimization

### Free Tier Limits
- **GitHub Actions**: 2,000 minutes/month
- **SonarCloud**: Free for open source
- **Codecov**: Free for open source
- **Snyk**: Free for open source (limited)

### Reduce Build Time
```yaml
# Cache npm dependencies
- uses: actions/setup-node@v4
  with:
    cache: 'npm'

# Cache CocoaPods
- uses: ruby/setup-ruby@v1
  with:
    bundler-cache: true
```

## Support

For issues with:
- **CI/CD Workflow**: Check workflow logs in Actions tab
- **SonarCloud**: https://community.sonarsource.com
- **Codecov**: https://community.codecov.com
- **Snyk**: https://support.snyk.io

## Next Steps

1. ✅ Commit workflow files to repository
2. ✅ Set up required GitHub secrets
3. ✅ Enable branch protection rules
4. ✅ Push code and watch first workflow run
5. ✅ Configure SonarCloud project
6. ✅ Review and merge first Dependabot PR

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [React Native CI/CD Guide](https://reactnative.dev/docs/ci-cd)
- [SonarCloud Setup](https://docs.sonarcloud.io/getting-started/overview/)
- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot)
