// src/utils/securityLogger.js
const logger = {
    log: (event, details, severity = 'med') => {
        try {
            const logEntry = {
                timestamp: new Date().toISOString(),
                event,
                severity,
                ...details,
                location: window.location.href,
                userAgent: navigator.userAgent
            };

            // Mask sensitive data
            if (logEntry.token) {
                logEntry.token = `...${logEntry.token.slice(-8)}`;
            }

            // Send to security monitoring service (only in production)
            if (process.env.NODE_ENV === 'production') {
                this._sendToMonitoring(logEntry);
            }

            // Local console logging
            const level = severity === 'high' ? 'error' :
                severity === 'med' ? 'warn' : 'info';
            console[level]('SECURITY:', logEntry);
        } catch (e) {
            console.error('Logging failed:', e);
        }
    },

    // Add this method to avoid undefined reference
    _sendToMonitoring: (logEntry) => {
        try {
            if (process.env.NODE_ENV === 'production' && navigator.sendBeacon) {
                const endpoint = '/api/security-logs';
                const blob = new Blob([JSON.stringify(logEntry)], {
                    type: 'application/json'
                });
                navigator.sendBeacon(endpoint, blob);
            }
        } catch (e) {
            console.error('Monitoring send failed:', e);
        }
    },

    log: (event, details, severity = 'med') => {
        try {
            const logEntry = {
                timestamp: new Date().toISOString(),
                event,
                severity,
                ...details,
                location: window.location.href,
                userAgent: navigator.userAgent
            };

            if (logEntry.token) {
                logEntry.token = `...${logEntry.token.slice(-8)}`;
            }

            // Call the monitoring method
            logger._sendToMonitoring(logEntry);

            // Local console logging
            const level = severity === 'high' ? 'error' :
                severity === 'med' ? 'warn' : 'info';
            console[level]('SECURITY:', logEntry);
        } catch (e) {
            console.error('Logging failed:', e);
        }
    },

    // Specific log methods
    info: (event, details) => logger.log(event, details, 'low'),
    warn: (event, details) => logger.log(event, details, 'med'),
    error: (event, details) => logger.log(event, details, 'high'),

    // Specialized methods
    tokenValidation: (details) =>
        logger.log('TOKEN_VALIDATION', details, 'med'),

    accessViolation: (route, user) =>
        logger.log('ACCESS_VIOLATION', {
            attemptedRoute: route,
            userRole: user?.role
        }, 'high'),

    sessionEvent: (eventType, details) =>
        logger.log(`SESSION_${eventType.toUpperCase()}`, details, 'low')
};

export default logger;