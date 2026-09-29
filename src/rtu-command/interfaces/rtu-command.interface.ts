export type RtuCommandType = 'read' | 'write';

// export interface RtuReadCommand {
//     msgId: string;
//     timestamp: string;

//     type: 'read';

//     slaveId: number;

//     param: string;

//     addr: number;

//     dataType: string;

//     valueType: string;

//     multiplier: number;

//     fieldSize: number;
// }

// export interface RtuWriteCommand {
//     msgId: string;
//     timestamp: string;

//     type: 'write';

//     slaveId: number;

//     param: string;

//     newValue: number | string | boolean;

//     dataType: string;

//     valueType: string;

//     multiplier: number;

//     fieldSize: number;
// }

export interface RtuReadCommand {
    msgId: string;
    timestamp: string;
    type: string;
    slaveId: string;
    param: string;
    addr: number;
    dataType: string;
    valueType: string;
    multiplier: number;
    fieldSize: number;
}

export interface RtuWriteCommand {
    slaveId: string;
    msgId: string;
    timestamp: string;
    type: string;
    addr: number;
    param: string;
    value: number;
    dataType: string;
    valueType: string;
    // multiplier: number;
    // fieldSize: number;
}

export type RtuCommand =
    | RtuReadCommand
    | RtuWriteCommand;

/**
 * We intentionally keep response flexible because the exact
 * RMU Cmd/Pub response structure has not been supplied yet.
 */
export interface RtuResponse {
    msgId?: string;

    timestamp?: string;

    type?: string;

    slaveId?: number | string;

    param?: string;

    value?: unknown;

    status?: string;

    error?: string;

    [key: string]: unknown;
}

export interface RtuResolvedTarget {
    assetId: string;

    deviceId: string;

    clientDeviceId: string;

    slaveId: number;
}

export interface PendingRtuRequest {
    msgId: string;

    assetId: string;

    deviceId: string;

    clientDeviceId: string;

    slaveId: number;

    command: RtuCommand;

    createdAt: number;

    // timeoutHandle: NodeJS.Timeout;

    resolve: (response: RtuResponse) => void;

    reject: (error: Error) => void;
}