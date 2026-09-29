// import {
//     IsInt,
//     IsNotEmpty,
//     IsOptional,
//     IsString,
//     Max,
//     Min,
// } from 'class-validator';

// export class ReadRtuCommandDto {
//     @IsString()
//     @IsNotEmpty()
//     assetId: string;

//     @IsString()
//     @IsNotEmpty()
//     param: string;

//     @IsInt()
//     @Min(0)
//     @Max(65535)
//     addr: number;

//     /**
//      * Normally obtained from CurrentTelemetryPayload.
//      *
//      * Required only when current telemetry does not contain
//      * the slave ID.
//      */
//     @IsOptional()
//     @IsInt()
//     @Min(0)
//     @Max(247)
//     slaveId?: number;

//     /**
//      * Normally resolved through CurrentTelemetryPayload -> Device.
//      *
//      * Can be supplied manually when telemetry/device mapping
//      * is unavailable.
//      */
//     @IsOptional()
//     @IsString()
//     @IsNotEmpty()
//     clientDeviceId?: string;
// }



import {
    IsInt,
    IsOptional,
    IsString,
} from 'class-validator';

export class ReadRtuCommandDto {
    @IsString()
    assetId: string;

    @IsOptional()
    @IsInt()
    slaveId?: string;

    @IsOptional()
    @IsString()
    // clientDeviceId?: string;
    rmuDeviceId?: string;

    @IsString()
    param: string;

    @IsInt()
    addr: number;
}