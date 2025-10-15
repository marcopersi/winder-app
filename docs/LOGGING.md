# Logger Configuration

## Overview
The app uses a centralized logger system that allows you to control verbosity per module.

## Log Levels
- `debug`: Detailed information for debugging
- `info`: General information (default)
- `warn`: Warning messages
- `error`: Error messages only
- `none`: Disable logging

## Configuration

### Global Settings
Located in `src/utils/logger.ts`:

```typescript
// Development: show debug logs
const GLOBAL_LOG_LEVEL: LogLevel = __DEV__ ? 'debug' : 'info';
```

### Module-Specific Settings
You can control each module independently:

```typescript
const MODULE_CONFIG: Record<string, LoggerConfig> = {
  filterOptions: { level: 'info', enabled: true },  // Only info and above
  wines: { level: 'info', enabled: true },
  auth: { level: 'info', enabled: true },
  referenceData: { level: 'info', enabled: true },
  swipe: { level: 'warn', enabled: true },  // Only warnings
  app: { level: 'info', enabled: true },
};
```

## Usage in Code

```typescript
import { logger } from '../utils/logger';

// Debug logs (only in development)
logger.filterOptions.debug('Loading options...');

// Info logs (production-safe)
logger.filterOptions.info('Loaded 78 grapes');

// Warnings
logger.wines.warn('Slow query detected');

// Errors (always shown)
logger.wines.error('Failed to load wines:', error);
```

## Enable Debug Mode

### Method 1: Change Global Level
In `src/utils/logger.ts`:
```typescript
const GLOBAL_LOG_LEVEL: LogLevel = 'debug';  // Show all logs
```

### Method 2: Enable Specific Module
```typescript
const MODULE_CONFIG = {
  filterOptions: { level: 'debug', enabled: true },  // Show debug for this module
  // ...
};
```

### Method 3: Runtime (Advanced)
```typescript
import { LoggerConfig } from '../utils/logger';

// Enable debug for all modules
LoggerConfig.enableDebug();

// Disable a specific module
LoggerConfig.disableModule('swipe');
```

## Production Settings
For production builds, set:
```typescript
const GLOBAL_LOG_LEVEL: LogLevel = 'info';  // Hide debug logs
```

## Output Examples

**Debug mode:**
```
🔍 [FilterOptions] Loading all filter options for language: de
🔍 [FilterOptions] Fetching grape options...
📊 [FilterOptions] Loaded 78 grape options
📊 [ReferenceData] Initializing...
📊 [ReferenceData] Loaded 4 wine colors
```

**Info mode (production):**
```
📊 [FilterOptions] Loaded 78 grape options
📊 [ReferenceData] Initialized successfully
```

**Error only:**
```
❌ [FilterOptions] Failed to load colors: Network error
```
