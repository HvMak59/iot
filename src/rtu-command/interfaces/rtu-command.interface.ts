export interface RtuReadCommand {
    msgId: string;
    timestamp: string;
    type: string;
    slaveId: string;
    param: string;
    addr: string;
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
    addr: string;
    param: string;
    value: string;
    dataType: string;
    valueType: string;
}

export type RtuCommand = RtuReadCommand | RtuWriteCommand;
