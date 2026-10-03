import {
    createLogger,
    format,
    Logger,
    transports,
} from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const rtuLoggerMap: Map<string, Logger> = new Map();

export const winstonRtuCommunicationLoggerSeparate = (
    serviceName: string,
): Logger => {
    if (rtuLoggerMap.has(serviceName)) {
        return rtuLoggerMap.get(serviceName)!;
    }

    const myFormat = format.printf((info) => {
        return `[${info.level}] [${info.timestamp}] [${serviceName}] ${info.message}`;
    });

    const logger = createLogger({
        level: 'debug',

        format: format.combine(
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss.SSS',
            }),
            myFormat,
        ),

        transports: [
            // ---------------------------------------------------------
            // CONSOLE
            // ---------------------------------------------------------
            new transports.Console({
                format: format.combine(
                    format.colorize(),
                    format.timestamp({
                        format: 'YYYY-MM-DD HH:mm:ss.SSS',
                    }),
                    myFormat,
                ),
            }),

            // ---------------------------------------------------------
            // RTU COMMUNICATION LOG
            // ---------------------------------------------------------
            new DailyRotateFile({
                filename:
                    'logs/rtu/rtu-communication.%DATE%.log',

                datePattern: 'YYYY-MM-DD',

                maxFiles: '10d',
            }),

            // ---------------------------------------------------------
            // RTU ERROR LOG
            // ---------------------------------------------------------
            new DailyRotateFile({
                filename:
                    'logs/rtu/rtu-communication.%DATE%.error',

                level: 'error',

                datePattern: 'YYYY-MM-DD',

                maxFiles: '10d',
            }),
        ],
    });

    rtuLoggerMap.set(serviceName, logger);

    return logger;
};