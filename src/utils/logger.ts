type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getConfiguredLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  if (envLevel && envLevel in LOG_LEVELS) {
    return envLevel as LogLevel;
  }
  return "info";
}

const configuredLevel = getConfiguredLevel();
const configuredLevelNum = LOG_LEVELS[configuredLevel];

function formatTimestamp(): string {
  return new Date().toISOString();
}

function formatMessage(level: LogLevel, message: string, data?: Record<string, unknown>): string {
  const base = {
    timestamp: formatTimestamp(),
    level,
    message,
    ...(data ?? {}),
  };
  return JSON.stringify(base);
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= configuredLevelNum;
}

/**
 * Write log message to stderr only.
 * IMPORTANT: MCP over stdio requires stdout to be reserved for JSON-RPC messages only.
 * All application logs MUST go to stderr to avoid corrupting the protocol.
 */
function writeToStderr(message: string): void {
  process.stderr.write(message + "\n");
}

export const logger = {
  debug(message: string, data?: Record<string, unknown>): void {
    if (shouldLog("debug")) {
      writeToStderr(formatMessage("debug", message, data));
    }
  },

  info(message: string, data?: Record<string, unknown>): void {
    if (shouldLog("info")) {
      writeToStderr(formatMessage("info", message, data));
    }
  },

  warn(message: string, data?: Record<string, unknown>): void {
    if (shouldLog("warn")) {
      writeToStderr(formatMessage("warn", message, data));
    }
  },

  error(message: string, data?: Record<string, unknown>): void {
    if (shouldLog("error")) {
      writeToStderr(formatMessage("error", message, data));
    }
  },

  child(context: Record<string, unknown>) {
    return {
      debug: (message: string, data?: Record<string, unknown>) =>
        logger.debug(message, { ...context, ...data }),
      info: (message: string, data?: Record<string, unknown>) =>
        logger.info(message, { ...context, ...data }),
      warn: (message: string, data?: Record<string, unknown>) =>
        logger.warn(message, { ...context, ...data }),
      error: (message: string, data?: Record<string, unknown>) =>
        logger.error(message, { ...context, ...data }),
    };
  },
};

export default logger;
