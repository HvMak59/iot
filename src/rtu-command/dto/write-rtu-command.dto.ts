// import {
//     IsInt,
//     IsNotEmpty,
//     IsOptional,
//     IsString,
//     Max,
//     Min,
// } from 'class-validator';

// export class WriteRtuCommandDto {
//     @IsString()
//     @IsNotEmpty()
//     assetId: string;

//     @IsString()
//     @IsNotEmpty()
//     param: string;

//     /**
//      * Protocol may allow numeric/string/boolean values.
//      */
//     @IsNotEmpty()
//     newValue: number | string | boolean;

//     @IsOptional()
//     @IsInt()
//     @Min(0)
//     @Max(247)
//     slaveId?: number;

//     @IsOptional()
//     @IsString()
//     @IsNotEmpty()
//     clientDeviceId?: string;
// }


export class WriteRtuCommandDto {
    // assetId: string;
    slaveId: string;
    // clientDeviceId?: string;
    rmuDeviceId: string;
    param: string;
    addr: string;
    value: string;
}
