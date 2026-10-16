import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MetricsAttributeAdaptor } from '../metrics-attribute-adaptor/entities/metrics-attribute-adaptor.entity';
import { DeviceModelParameter } from './entities/device-model-parameter.entity';

@Injectable()
export class DeviceModelParameterService {
    constructor(
        @InjectRepository(DeviceModelParameter) private readonly repo: Repository<DeviceModelParameter>,
    ) { }

    async findParamDetails(deviceModelId: string, attribute: string) {
        return await this.repo.findOneBy({
            deviceModelId,
            attribute
        })
    }
    // async findParameter(
    //     deviceModelId: string,
    //     parameterName: string,
    // ) {
    //     const name = parameterName.trim();

    //     const parameter = await this.repo.findOne({
    //         where: {
    //             deviceModelId,
    //             parameterName: name,
    //             isActive: true,
    //         },
    //     });

    //     if (!parameter) {
    //         throw new NotFoundException(
    //             `RTU parameter "${name}" is not configured for this device model`,
    //         );
    //     }

    //     // Require an existing application-attribute mapping for this source name.
    //     const adaptor = await this.adaptorRepository.findOne({
    //         where: {
    //             deviceModelId,
    //             sourceAttribute: name,
    //             isActive: true,
    //         },
    //     });

    //     if (!adaptor) {
    //         throw new NotFoundException(
    //             `No active MetricsAttributeAdaptor mapping exists for "${name}" on this device model`,
    //         );
    //     }

    //     this.validateConfiguration(parameter);

    //     return parameter;
    // }

    // async findAvailableParameters(deviceModelId: string) {
    //     const parameters = await this.repo.find({
    //         where: {
    //             deviceModelId,
    //             isActive: true,
    //         },
    //         order: {
    //             parameterName: 'ASC',
    //         },
    //     });

    //     // Show only parameters that are also mapped to standard application attributes.
    //     const mappedParameters = await Promise.all(
    //         parameters.map(async (parameter) => {
    //             const adaptor = await this.adaptorRepository.findOne({
    //                 where: {
    //                     deviceModelId,
    //                     sourceAttribute: parameter.parameterName,
    //                     isActive: true,
    //                 },
    //                 select: {
    //                     id: true,
    //                 },
    //             });

    //             return adaptor ? parameter : null;
    //         }),
    //     );

    //     return mappedParameters
    //         .filter((parameter): parameter is DeviceModelParameter => !!parameter)
    //         .map((parameter) => ({
    //             parameterName: parameter.parameterName,
    //         }));
    // }

    // async findAvailableParameters(deviceModelId: string) {
    //     const [parameters, adaptors] = await Promise.all([
    //         this.repo.find({
    //             where: {
    //                 deviceModelId,
    //                 isActive: true,
    //             },
    //             select: {
    //                 parameterName: true,
    //             },
    //             order: {
    //                 parameterName: 'ASC',
    //             },
    //         }),

    //         this.adaptorRepository.find({
    //             where: {
    //                 deviceModelId,
    //                 isActive: true,
    //             },
    //             select: {
    //                 sourceAttribute: true,
    //             },
    //         }),
    //     ]);

    //     const mappedNames = new Set(
    //         adaptors.map((adaptor) => adaptor.sourceAttribute),
    //     );

    //     return parameters
    //         .filter((parameter) => mappedNames.has(parameter.parameterName))
    //         .map((parameter) => ({
    //             parameterName: parameter.parameterName,
    //         }));
    // }

    // private validateConfiguration(
    //     parameter: DeviceModelParameter,
    // ): void {
    //     if (!parameter.parameterAddress?.trim()) {
    //         throw new Error(
    //             `RTU address is missing for parameter "${parameter.parameterName}"`,
    //         );
    //     }

    //     if (
    //         !Number.isFinite(parameter.parameterMultiplier) ||
    //         parameter.parameterMultiplier === 0
    //     ) {
    //         throw new Error(
    //             `Invalid multiplier for parameter "${parameter.parameterName}"`,
    //         );
    //     }

    //     if (
    //         !Number.isInteger(parameter.parameterFieldSize) ||
    //         parameter.parameterFieldSize < 1
    //     ) {
    //         throw new Error(
    //             `Invalid field size for parameter "${parameter.parameterName}"`,
    //         );
    //     }

    //     if (
    //         !parameter.parameterDataType?.trim() ||
    //         !parameter.parameterValueType?.trim()
    //     ) {
    //         throw new Error(
    //             `RTU data type or value type is missing for parameter "${parameter.parameterName}"`,
    //         );
    //     }
    // }
}