export class WriteRtuCommandDto {
    slaveId: number;
    rmuDeviceId: string;
    param: string;
    addr: number;
    value: number;
}
