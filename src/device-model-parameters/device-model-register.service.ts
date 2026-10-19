import {
    Injectable
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceModelRegister } from './entities/device-model-register.entity';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { CreateDeviceModelRegisterDto } from './dto/create-device-model-register.dto';
import { KEY_SEPARATOR, NO_RECORD } from 'src/app_config/constants';
import { UpdateDeviceModelRegisterDto } from './dto/update-device-model-register.dto';
import { FindDeviceModelRegisterDto } from './dto/find-device-model-dto';
import serviceConfig from '../app_config/service.config.json';


@Injectable()
export class DeviceModelRegisterService {
    private readonly logger = winstonServerLogger(DeviceModelRegisterService.name);
    private relations = serviceConfig.deviceModelRegister.relations;

    constructor(
        @InjectRepository(DeviceModelRegister) private readonly repo: Repository<DeviceModelRegister>,
    ) { }

    async findParamDetails(deviceModelId: string, metricsAttributeId: string) {
        return await this.repo.findOneBy({
            deviceModelId,
            metricsAttributeId
        })
    }

    async findParamsByModel(deviceModelId: string, deviceTypeId: string) {
        return this.repo.find({
            where: {
                deviceModel: {
                    id: deviceModelId,
                    deviceTypeId
                }
            },
            select: { metricsAttributeId: true },
        });
        //  
        // return rows.map(r => r.metricsAttributeId);
    }

    create(createDeviceModelRegisterDto: CreateDeviceModelRegisterDto) {
        const fnName = this.create.name;
        const input = `Input: create DeviceModelRegister: ${JSON.stringify(createDeviceModelRegisterDto)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        const eventMaster = this.repo.create(createDeviceModelRegisterDto);
        return this.repo.save(eventMaster);
    }

    createBulk(createDeviceModelRegisterDtos: CreateDeviceModelRegisterDto[]) {
        const fnName = this.createBulk.name;
        const input = `Input: Bulk create DeviceModelRegister: ${JSON.stringify(createDeviceModelRegisterDtos)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        const records = this.repo.create(createDeviceModelRegisterDtos);
        return records.length > 0 ? this.repo.save(records) : [];
    }

    async update(id: string, updateDeviceModelRegisterDto: UpdateDeviceModelRegisterDto) {
        const fnName = this.update.name;
        const input = `Input : Id : ${id}, updateDeviceModelRegisterDto : ${JSON.stringify(updateDeviceModelRegisterDto)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        if (updateDeviceModelRegisterDto.id == null) {
            this.logger.debug(`${fnName} : DeviceModelRegister Id not found in updateDeviceModelRegisterDto`);
            updateDeviceModelRegisterDto.id = id;
        }
        else if (updateDeviceModelRegisterDto.id != id) {
            this.logger.error(`${fnName}: DeviceModelRegister Id and Update DeviceModelRegister Object Id do not match`);
            throw new Error('DeviceModelRegister Id and Update DeviceModelRegister Object Id do not match');
        }

        const mergedDeviceModelRegister = await this.repo.preload(updateDeviceModelRegisterDto);

        if (mergedDeviceModelRegister == null) {
            this.logger.error(`${fnName}: ${NO_RECORD} : DeviceModelRegister id : ${id} not found`);
            throw new Error(`${NO_RECORD} : DeviceModelRegister id : ${id} not found`);
        }
        else {
            this.logger.debug(
                `${fnName} : Merged DeviceModelRegister is : ${JSON.stringify(mergedDeviceModelRegister)}`,
            );

            const savedDeviceModelRegister = await this.repo.save(mergedDeviceModelRegister);
            this.logger.debug(
                `${fnName} : Saved DeviceModelRegister is : ${JSON.stringify(mergedDeviceModelRegister)}`,
            );
            return savedDeviceModelRegister;
        }
    }


    findAll(searchCriteria: FindDeviceModelRegisterDto, relationsRequired: boolean = false) {
        const fnName = this.findAll.name;
        const input = `Input : FindAll DeviceModelRegister with searchCriteria : ${JSON.stringify(searchCriteria)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        const relation = relationsRequired ? this.relations : []

        return this.repo.find({
            where: searchCriteria,
            relations: relation
        })
    }

    findOne(searchCriteria: FindDeviceModelRegisterDto, relationsRequired: boolean = false) {
        const fnName = this.findOne.name;
        const input = `Input : FindOne DeviceModelRegister with searchCriteria : ${JSON.stringify(searchCriteria)}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        const relation = relationsRequired ? this.relations : []

        return this.repo.findOne({
            where: searchCriteria,
            relations: relation
        })
    }

    findOneById(id: string, relationsRequired: boolean = false) {
        const fnName = this.findOneById.name;
        const input = `Input : FindOne DeviceModelRegister by id : ${id}`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        const relation = relationsRequired ? this.relations : []

        return this.repo.findOne({
            where: { id },
            relations: relation
        })
    }

    async delete(id: string) {
        const fnName = this.delete.name;
        const input = `DeviceModelRegister Id : ${id} to be deleted`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        const result = await this.repo.delete(id);

        if (result.affected === 0) {
            this.logger.error(`${fnName} : ${NO_RECORD} : DeviceModelRegister id : ${id} not found`);
            throw new Error(`${NO_RECORD} : DeviceModelRegister id : ${id} not found`);
        }
        else {
            this.logger.debug(`${fnName} : DeviceModelRegister id : ${id} deleted successfully`);
            return result;
        }
    }

    async softDelete(id: string, userId: string) {
        const fnName = this.softDelete.name;
        const input = `DeviceModelRegister Id : ${id} to be softDeleted`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        const DeviceModelRegisterToBeDeleted = await this.findOneById(id);

        if (!DeviceModelRegisterToBeDeleted) {
            this.logger.error(`${NO_RECORD}: DeviceModelRegister id: ${id} not found`);
            throw new Error(`DeviceModelRegister id: ${id} not found`);
        }

        DeviceModelRegisterToBeDeleted.deletedBy = userId
        await this.repo.save(DeviceModelRegisterToBeDeleted);
        const result = await this.repo.softDelete(id);

        if (result.affected === 0) {
            throw new Error(`${fnName} : ${NO_RECORD} : DeviceModelRegister id : ${id} not found`);
        }
        else {
            this.logger.debug(
                `${fnName} : DeviceModelRegister id : ${id} softDeleted successfully`,
            );
            return result;
        }
    }

    async restore(id: string) {
        const fnName = this.restore.name;
        const input = `Input : DeviceModelRegister id : ${id} to be restored`;

        this.logger.debug(fnName + KEY_SEPARATOR + input);

        const result = await this.repo.restore(id);
        if (result.affected === 0) {
            this.logger.error(
                `${fnName} : ${NO_RECORD} : DeviceModelRegister id : ${id} not found`,
            );
            throw new Error(`${NO_RECORD} : DeviceModelRegister id : ${id} not found`);
        }
        else {
            this.logger.debug(`${fnName} DeviceModelRegister id : ${id} restored successfully`);
            this.logger.debug(`${fnName}: Calling update service`);
            return this.update(id, { deletedBy: null }) // to make deltedby null we have to change deletedby defination in entity (see entity)
        }
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