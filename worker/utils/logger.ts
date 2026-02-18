/**
* Worker Logger
*
* Simple logger with timestamps and log levels
* In production, you might use Winston or Pino
*/
export const logger = {
    info: (...args: any[]) => {
        console.log(`[${new Date().toISOString()}] [INFO]`, ...args);
    },
    warn: (...args: any[]) => {
        console.warn(`[${new Date().toISOString()}] [WARN]`, ...args);
    },
    error: (...args: any[]) => {
        console.error(`[${new Date().toISOString()}] [ERROR]`, ...args);
    },
    debug: (...args: any[]) => {
        if (process.env.DEBUG === 'true') {
            console.debug(`[${new Date().toISOString()}] [DEBUG]`, ...args);
        }
    }
};
