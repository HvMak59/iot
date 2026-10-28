import {
    IsIn,
    IsNumber,
    IsString,
    IsUUID,
    MaxLength,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RtuParameterCommandDto {

    virtualDeviceId: string;
    parameterName: string;
}

export class RtuParameterWriteDto extends RtuParameterCommandDto {
    @Type(() => Number)
    @IsNumber({ allowNaN: false, allowInfinity: false })
    value: number;
}