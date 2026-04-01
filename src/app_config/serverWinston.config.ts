import { createLogger, format, Logger, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

//const date = new Date();
//const month = date.getMonth() + 1;

//const fileName = date.getFullYear() + "-" + month + "-" + date.getDate();

const loggerMap: Map<string, Logger> = new Map();

export const winstonServerLogger = (serviceName: string) => {
  if (loggerMap.has(serviceName)) {
    return loggerMap.get(serviceName)!;
  } else {
    const myFormat = format.printf((info) => {
      return `[${info.level}] [${info.timestamp}] [${serviceName}] ${info.message}`;
    });
    const logger = createLogger({
      level: 'debug',
      format: format.combine(
        /*format.colorize(),*/
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        format.colorize(),
        myFormat,
      ),
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            myFormat,
          ),
        }),
        new DailyRotateFile({
          filename: `logs/server.%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          //zippedArchive: true,
          //maxSize: '20m',
          maxFiles: '10d',
          // frequency : '1m'
        }),
        new DailyRotateFile({
          filename: `logs/server.%DATE%.error`,
          level: 'error',
          datePattern: 'YYYY-MM-DD',
          //zippedArchive: true,
          // maxSize: '20m',
          maxFiles: '10d',
          //frequency:'1m'
        }),
      ],
    });
    loggerMap.set(serviceName, logger);
    return logger;
  }
};

export const winstonStandAloneLogger = (serviceName: string) => {
  if (loggerMap.has(serviceName)) {
    return loggerMap.get(serviceName)!;
  } else {
    const myFormat = format.printf((info) => {
      return `[${info.level}] [${info.timestamp}] [${serviceName}] ${info.message}`;
    });
    const logger = createLogger({
      level: 'debug',
      format: format.combine(
        /*format.colorize(),*/
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        format.colorize(),
        myFormat,
      ),
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            myFormat,
          ),
        }),
        new DailyRotateFile({
          filename: `logs/Standalone.%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          //zippedArchive: true,
          //maxSize: '20m',
          maxFiles: '10d',
          // frequency : '1m'
        }),
        new DailyRotateFile({
          filename: `logs/Standalone.%DATE%.error`,
          level: 'error',
          datePattern: 'YYYY-MM-DD',
          //zippedArchive: true,
          // maxSize: '20m',
          maxFiles: '10d',
          //frequency:'1m'
        }),
      ],
    });
    loggerMap.set(serviceName, logger);
    return logger;
  }
};

export const winstonScheduledServiceLogger = (serviceName: string) => {
  if (loggerMap.has(serviceName)) {
    return loggerMap.get(serviceName)!;
  } else {
    const myFormat = format.printf((info) => {
      return `[${info.level}] [${info.timestamp}] [${serviceName}] ${info.message}`;
    });
    const logger = createLogger({
      level: 'debug',
      format: format.combine(
        /*format.colorize(),*/
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        format.colorize(),
        myFormat,
      ),
      transports: [
        /* new transports.Console({
          format: format.combine(
            format.colorize(),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            myFormat,
          ),
        }), */
        new DailyRotateFile({
          filename: `logs/ScheduledService.%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          //zippedArchive: true,
          //maxSize: '20m',
          maxFiles: '10d',
          // frequency : '1m'
        }),
        new DailyRotateFile({
          filename: `logs/ScheduledService.%DATE%.error`,
          level: 'error',
          datePattern: 'YYYY-MM-DD',
          //zippedArchive: true,
          // maxSize: '20m',
          maxFiles: '10d',
          //frequency:'1m'
        }),
      ],
    });
    loggerMap.set(serviceName, logger);
    return logger;
  }
};
