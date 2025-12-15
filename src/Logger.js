const axios = require('axios');
const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../logs');
        this.logFile = path.join(this.logDir, 'app.log');
        this.errorLogFile = path.join(this.logDir, 'error.log');
        
        // Ensure log directory exists
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    log(level, message, context = {}) {
        const timestamp = new Date().toISOString();
        const contextStr = Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : '';
        const logEntry = `[${timestamp}] [${level}] ${message}${contextStr}\n`;

        const file = level === 'ERROR' ? this.errorLogFile : this.logFile;
        
        fs.appendFileSync(file, logEntry);
        
        // Also log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log(logEntry.trim());
        }
    }

    info(message, context = {}) {
        this.log('INFO', message, context);
    }

    warning(message, context = {}) {
        this.log('WARNING', message, context);
    }

    error(message, context = {}) {
        this.log('ERROR', message, context);
    }

    debug(message, context = {}) {
        if (process.env.NODE_ENV === 'development') {
            this.log('DEBUG', message, context);
        }
    }

    apiRequest(method, params = {}) {
        this.info(`VoIP.ms API Request: ${method}`, { params });
    }

    apiResponse(method, success, data = null) {
        if (success) {
            this.info(`VoIP.ms API Success: ${method}`);
        } else {
            this.error(`VoIP.ms API Error: ${method}`, { error: data });
        }
    }
}

module.exports = new Logger();
