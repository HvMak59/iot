export class ReadRtuCommandDto {
    slaveId: string;
    rmuDeviceId: string;
    param: string;
    addr: string;
}

export class sendRtuCommandDto {
    slaveId: string;
    rmuDeviceId: string;
    type: string;
    param: string;
    addr: string;
    value: string;
}