// src/utils/securityLogger.js
const logger = {
  _sendToMonitoring: (logEntry) => {
    try {
      if (process.env.NODE_ENV === 'production' && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(logEntry)], { type: 'application/json' });
        navigator.sendBeacon('/api/security-logs', blob);
      }
    } catch (e) {
      console.error('Monitoring send failed:', e);
    }
  },

  log: (event, details = {}, severity = 'med') => {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        event,
        severity,
        ...details,
        location: typeof window !== 'undefined' ? window.location.href : 'server',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
      };

      if (logEntry.token) logEntry.token = `...${logEntry.token.slice(-8)}`;

      logger._sendToMonitoring(logEntry);

      const level = severity === 'high' ? 'error' :
                    severity === 'med' ? 'warn' : 'info';
      console[level]('SECURITY:', logEntry);
    } catch (e) {
      console.error('Logging failed:', e);
    }
  },

  info: (event, details) => logger.log(event, details, 'low'),
  warn: (event, details) => logger.log(event, details, 'med'),
  error: (event, details) => logger.log(event, details, 'high'),
  tokenValidation: (details) => logger.log('TOKEN_VALIDATION', details, 'med'),
  accessViolation: (route, user) =>
    logger.log('ACCESS_VIOLATION', { attemptedRoute: route, userRole: user?.role }, 'high'),
  sessionEvent: (eventType, details) =>
    logger.log(`SESSION_${eventType.toUpperCase()}`, details, 'low')
};

export default logger;
