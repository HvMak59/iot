export interface RtuReadCommand {
    msgId: string;
    timestamp: string;
    type: string;
    slaveId: number;
    param: string;
    addr: number;
    dataType: string;
    valueType: string;
    multiplier: number;
    fieldSize: number;
}

export interface RtuWriteCommand {
    slaveId: number;
    msgId: string;
    timestamp: string;
    type: string;
    addr: number;
    param: string;
    value: number;
    dataType: string;
    valueType: string;
}

export type RtuCommand = RtuReadCommand | RtuWriteCommand;
