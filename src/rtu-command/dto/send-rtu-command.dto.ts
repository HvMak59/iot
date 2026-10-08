export class sendRtuCommandDto {
    slaveId?: number | undefined;
    rmuDeviceId: string;
    type: string;
    param: string;
    addr: number;
    value?: number | undefined;
}