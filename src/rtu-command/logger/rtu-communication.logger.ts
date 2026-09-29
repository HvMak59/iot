// import { Injectable, OnModuleDestroy } from '@nestjs/common';
// import {
//     createLogger,
//     format,
//     transports,
//     Logger,
// } from 'winston';
// import * as fs from 'fs';
// import * as path from 'path';

// @Injectable()
// export class RtuCommunicationLogger
//     implements OnModuleDestroy {
//     private readonly logger: Logger;

//     constructor() {
//         const logDirectory = path.resolve(
//             process.cwd(),
//             'logs',
//             'rtu',
//         );

//         fs.mkdirSync(logDirectory, {
//             recursive: true,
//         });

//         this.logger = createLogger({
//             level: 'info',

//             format: format.combine(
//                 format.timestamp({
//                     format: 'YYYY-MM-DD HH:mm:ss.SSS',
//                 }),
//                 format.json(),
//             ),

//             transports: [
//                 new transports.File({
//                     filename: path.join(
//                         logDirectory,
//                         'rtu-communication.log',
//                     ),

//                     maxsize: 20 * 1024 * 1024,

//                     maxFiles: 10,

//                     tailable: true,
//                 }),
//             ],
//         });
//     }

//     logOutgoing(data: Record<string, unknown>): void {
//         this.logger.info({
//             direction: 'OUT',
//             ...data,
//         });
//     }

//     logIncoming(data: Record<string, unknown>): void {
//         this.logger.info({
//             direction: 'IN',
//             ...data,
//         });
//     }

//     logTimeout(data: Record<string, unknown>): void {
//         this.logger.warn({
//             direction: 'TIMEOUT',
//             ...data,
//         });
//     }

//     logError(data: Record<string, unknown>): void {
//         this.logger.error({
//             direction: 'ERROR',
//             ...data,
//         });
//     }

//     logInfo(data: Record<string, unknown>): void {
//         this.logger.info({
//             direction: 'INFO',
//             ...data,
//         });
//     }

//     onModuleDestroy(): void {
//         this.logger.close();
//     }
// }

import {
    Injectable,
    Logger,
} from '@nestjs/common';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RtuCommunicationLogger {
    private readonly logger =
        new Logger(
            RtuCommunicationLogger.name,
        );

    // private readonly logDirectory =
    //     path.join(
    //         process.cwd(),
    //         'logs',
    //         'rtu',
    //     );

    private readonly logDirectory = path.join(
        process.cwd(),
        'src',
        'rtu-command',
        'logs'
    );

    private readonly logFile =
        path.join(
            this.logDirectory,
            'rtu-communication.log',
        );

    constructor() {
        this.ensureLogDirectory();

        this.logger.log(
            `RTU communication log file: ${this.logFile}`,
        );
    }

    private ensureLogDirectory(): void {
        fs.mkdirSync(
            this.logDirectory,
            {
                recursive: true,
            },
        );
    }

    // ---------------------------------------------------------
    // OUTGOING
    // ---------------------------------------------------------

    logOutgoing(data: {
        // assetId: string;
        // deviceId: string;
        // clientDeviceId: string;
        // slaveId: number;
        msgId: string;
        topic: string;
        command: unknown;
    }): void {
        this.write({
            direction: 'OUTGOING',
            timestamp: new Date().toISOString(),
            ...data,
        });
    }

    // ---------------------------------------------------------
    // INCOMING
    // ---------------------------------------------------------

    logIncoming(data: {
        topic: string;
        response: unknown;
    }): void {
        this.write({
            direction: 'INCOMING',
            timestamp: new Date().toISOString(),
            ...data,
        });
    }

    // ---------------------------------------------------------
    // ERROR
    // ---------------------------------------------------------

    logError(data: Record<string, unknown>): void {
        this.write({
            direction: 'ERROR',
            timestamp: new Date().toISOString(),
            ...data,
        });
    }

    // ---------------------------------------------------------
    // WRITE FILE
    // ---------------------------------------------------------

    private write(
        data: Record<string, unknown>,
    ): void {
        try {
            const line =
                JSON.stringify(data) +
                '\n';

            fs.appendFileSync(
                this.logFile,
                line,
                {
                    encoding: 'utf8',
                },
            );
        } catch (error) {
            this.logger.error(
                `Failed to write RTU communication log: ${error instanceof Error
                    ? error.message
                    : String(error)
                }`,
            );
        }
    }
}