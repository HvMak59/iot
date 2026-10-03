import { Injectable, Logger } from '@nestjs/common';
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