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

import {
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class WriteRtuCommandDto {
    @IsString()
    assetId: string;

    @IsOptional()
    @IsInt()
    slaveId?: string;

    @IsOptional()
    @IsString()
    clientDeviceId?: string;

    @IsString()
    param: string;

    @IsInt()
    addr: number;

    @IsNumber()
    value: number;
}