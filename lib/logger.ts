// lib/logger.ts

type LogLevel = "debug" | "info" | "warn" | "error";

function log(level: LogLevel, message: string, meta?: unknown) {
  const payload = {
    level,
    message,
    meta,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development") {
    // In dev gewoon naar console
    // eslint-disable-next-line no-console
    console[level === "debug" ? "log" : level](payload);
  } else {
    // In productie kun je dit koppelen aan Sentry, Logtail etc.
    // Voor nu: console
    // eslint-disable-next-line no-console
    console[level === "debug" ? "log" : level](payload);
  }
}

export const logger = {
  debug: (message: string, meta?: unknown) => log("debug", message, meta),
  info: (message: string, meta?: unknown) => log("info", message, meta),
  warn: (message: string, meta?: unknown) => log("warn", message, meta),
  error: (message: string, meta?: unknown) => log("error", message, meta),
};
