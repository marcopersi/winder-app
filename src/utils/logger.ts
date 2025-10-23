/**
 * Centralized Logger Configuration
 * 
 * Usage:
 * import { logger } from '../utils/logger';
 * logger.filterOptions.debug('Loading options...');
 * logger.wines.info('Found wines:', count);
 * logger.auth.error('Login failed:', error);
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

interface LoggerConfig {
  level: LogLevel;
  enabled: boolean;
}

// Global configuration - set to 'info' for production, 'debug' for development
const GLOBAL_LOG_LEVEL: LogLevel = __DEV__ ? 'debug' : 'info';

// Module-specific configuration
const MODULE_CONFIG: Record<string, LoggerConfig> = {
  filterOptions: { level: 'info', enabled: true },  // Set to 'info' to hide debug logs
  wines: { level: 'info', enabled: true },
  auth: { level: 'info', enabled: true },
  referenceData: { level: 'info', enabled: true },
  swipe: { level: 'warn', enabled: true },  // Only warnings and errors
  app: { level: 'info', enabled: true },
};

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
};

class ModuleLogger {
  constructor(
    private readonly moduleName: string,
    private readonly config: LoggerConfig
  ) {}

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    
    const globalLevel = LOG_LEVELS[GLOBAL_LOG_LEVEL];
    const moduleLevel = LOG_LEVELS[this.config.level];
    const currentLevel = LOG_LEVELS[level];
    
    return currentLevel >= Math.max(globalLevel, moduleLevel);
  }

  private formatMessage(level: string, ...args: any[]): any[] {
    const emoji = {
      debug: '🔍',
      info: '📊',
      warn: '⚠️',
      error: '❌',
    }[level] || '📝';
    
    return [`${emoji} [${this.moduleName}]`, ...args];
  }

  debug(...args: any[]) {
    if (this.shouldLog('debug')) {
      console.log(...this.formatMessage('debug', ...args));
    }
  }

  info(...args: any[]) {
    if (this.shouldLog('info')) {
      console.log(...this.formatMessage('info', ...args));
    }
  }

  warn(...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(...this.formatMessage('warn', ...args));
    }
  }

  error(...args: any[]) {
    if (this.shouldLog('error')) {
      console.error(...this.formatMessage('error', ...args));
    }
  }
}

// Create module-specific loggers
export const logger = {
  filterOptions: new ModuleLogger('FilterOptions', MODULE_CONFIG.filterOptions),
  wines: new ModuleLogger('Wines', MODULE_CONFIG.wines),
  auth: new ModuleLogger('Auth', MODULE_CONFIG.auth),
  referenceData: new ModuleLogger('ReferenceData', MODULE_CONFIG.referenceData),
  swipe: new ModuleLogger('Swipe', MODULE_CONFIG.swipe),
  app: new ModuleLogger('App', MODULE_CONFIG.app),
};

/**
 * Quick configuration helpers
 */
export const LoggerConfig = {
  /** Enable debug mode for all modules */
  enableDebug: () => {
    for (const config of Object.values(MODULE_CONFIG)) {
      config.level = 'debug';
    }
  },
  
  /** Set production mode (info and above only) */
  setProduction: () => {
    for (const config of Object.values(MODULE_CONFIG)) {
      config.level = 'info';
    }
  },
  
  /** Disable specific module */
  disableModule: (moduleName: keyof typeof MODULE_CONFIG) => {
    MODULE_CONFIG[moduleName].enabled = false;
  },
  
  /** Enable specific module */
  enableModule: (moduleName: keyof typeof MODULE_CONFIG) => {
    MODULE_CONFIG[moduleName].enabled = true;
  },
};
