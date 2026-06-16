import { Injectable } from '@nestjs/common';
import { CreateDeviceModelAlertDto } from './dto/create-device-model-alert.dto';
import { UpdateDeviceModelAlertDto } from './dto/update-device-model-alert.dto';

// import serviceConfig from '../../app_config/service.config.json';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, FindOptionsWhere, In, Repository } from 'typeorm';
import { DeviceModelAlert } from './entities/device-model-alert.entity';
import { FindDeviceModelAlertDto } from './dto/find-device-model-alert.dto';
// import { findAll } from 'src/utils/cmnFn.repository';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import {
  DUPLICATE_RECORD,
  KEY_SEPARATOR,
  NO_RECORD,
} from 'src/app_config/constants';
import { FindDeviceModelAlertByMultipleIDs } from './dto/find-device-model-alert-byMultipleIDs.dto';

@Injectable()
export class DeviceModelAlertService {
  private serviceName = DeviceModelAlertService.name;
  private readonly logger = winstonServerLogger(DeviceModelAlertService.name);
  // private relations = serviceConfig.deviceModelAlert.relations;
  private relation = [];

  constructor(
    @InjectRepository(DeviceModelAlert)
    private readonly repo: Repository<DeviceModelAlert>,
  ) { }

  async create(createDeviceModelAlertDto: CreateDeviceModelAlertDto) {
    const fnName = 'create()';
    const input = `Input : Create Object : ${JSON.stringify(
      createDeviceModelAlertDto,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const createDeviceModelID =
      createDeviceModelAlertDto.deviceModelId ??
      createDeviceModelAlertDto.deviceModel?.id;

    const searchObj: FindDeviceModelAlertDto = {
      alertId: createDeviceModelAlertDto.alertId,
      deviceModelId: createDeviceModelID,
    };

    const rmuDeviceModelID =
      createDeviceModelAlertDto.rmuDeviceModelId ??
      createDeviceModelAlertDto.rmuDeviceModel?.id;
    if (rmuDeviceModelID) {
      searchObj.rmuDeviceModelId = rmuDeviceModelID;
    }

    const result = await this.repo.findOneBy(searchObj);

    if (result) {
      this.logger.error(`${fnName} : ${result.id} already exists`);
      throw new Error(`${DUPLICATE_RECORD} : ${result.id} already exists`);
    } else {
      const deviceModelAlert = this.repo.create(createDeviceModelAlertDto);
      this.logger.debug(
        `${fnName} : Created DeviceModelAlert is : ${JSON.stringify(
          deviceModelAlert,
        )}`,
      );
      return await this.repo.save(deviceModelAlert);
    }
  }

  createBulk(createDeviceModelAlerts: CreateDeviceModelAlertDto[]) {
    const createDeviceModelAlertObjs: CreateDeviceModelAlertDto[] = [];
    for (const createDeviceModelAlert of createDeviceModelAlerts) {
      const createDeviceModelAlertObj = this.repo.create(
        createDeviceModelAlert,
      );
      createDeviceModelAlertObjs.push(createDeviceModelAlertObj);
    }
    return this.repo.save(createDeviceModelAlertObjs);
  }

  // findAll(
  //   searchCriteria: FindDeviceModelAlertDto,
  //   relationsRequired: boolean = false,
  // ) {
  //   const fnName = this.findAll.name;
  //   let relations = relationsRequired ? this.relations : [];
  //   return findAll<DeviceModelAlert>(
  //     this.repo,
  //     fnName,
  //     relations,
  //     searchCriteria,
  //   );
  // }

  // findAllForMaster(
  //   searchCriteria: FindDeviceModelAlertDto,
  //   relationsRequired: boolean = false,
  // ) {
  //   const fnName = this.findAll.name;
  //   let relations = relationsRequired ? this.relations : [];
  //   let newSearchCriteria;
  //   if (
  //     searchCriteria.rmuDeviceModelId &&
  //     searchCriteria.deviceModelId &&
  //     searchCriteria.rmuDeviceModelId
  //       .toString()
  //       .match(searchCriteria.deviceModelId.toString())
  //   ) {
  //     this.logger.debug(
  //       `${fnName} : rmuDeviceModelId and deviceModelId are same`,
  //     );
  //     const rmuDeviceModelSearchCriteria: FindDeviceModelAlertDto = {};
  //     Object.assign(rmuDeviceModelSearchCriteria, searchCriteria);
  //     delete rmuDeviceModelSearchCriteria.deviceModelId;
  //     const deviceModelSearchCriteria: FindDeviceModelAlertDto = {};
  //     Object.assign(deviceModelSearchCriteria, searchCriteria);
  //     delete deviceModelSearchCriteria.rmuDeviceModelId;
  //     this.logger.debug(
  //       `${fnName} : rmuDeviceModelSearchCriteria : ${JSON.stringify(
  //         rmuDeviceModelSearchCriteria,
  //       )}`,
  //     );
  //     this.logger.debug(
  //       `${fnName} : deviceModelSearchCriteria : ${JSON.stringify(
  //         deviceModelSearchCriteria,
  //       )}`,
  //     );
  //     newSearchCriteria = [
  //       deviceModelSearchCriteria,
  //       rmuDeviceModelSearchCriteria,
  //     ];
  //   } else if (
  //     searchCriteria.rmuDeviceModelId &&
  //     !searchCriteria.deviceModelId
  //   ) {
  //     this.logger.debug(
  //       `${fnName} : rmuDeviceModelId is present and deviceModelId is not present`,
  //     );
  //     const rmuDeviceModelSearchCriteria: FindDeviceModelAlertDto = {};
  //     Object.assign(rmuDeviceModelSearchCriteria, searchCriteria);
  //     const deviceModelSearchCriteria: FindDeviceModelAlertDto = {};
  //     Object.assign(deviceModelSearchCriteria, searchCriteria);
  //     deviceModelSearchCriteria.deviceModelId = searchCriteria.rmuDeviceModelId;
  //     delete deviceModelSearchCriteria.rmuDeviceModelId;
  //     this.logger.debug(
  //       `${fnName} : rmuDeviceModelSearchCriteria : ${JSON.stringify(
  //         rmuDeviceModelSearchCriteria,
  //       )}`,
  //     );
  //     this.logger.debug(
  //       `${fnName} : deviceModelSearchCriteria : ${JSON.stringify(
  //         deviceModelSearchCriteria,
  //       )}`,
  //     );
  //     newSearchCriteria = [
  //       deviceModelSearchCriteria,
  //       rmuDeviceModelSearchCriteria,
  //     ];

  //     return this.repo.find({
  //       where: newSearchCriteria,
  //       relations: relations,
  //     });
  //   } else {
  //     this.logger.debug(
  //       `${fnName} : rmuDeviceModelId and deviceModelId are different`,
  //     );
  //     newSearchCriteria = searchCriteria;
  //   }
  //   return this.repo.find({
  //     where: newSearchCriteria,
  //     relations: relations,
  //   });
  // }

  // findOne(
  //   searchCriteria: FindDeviceModelAlertDto,
  //   relationsRequired: boolean = false,
  // ) {
  //   const fnName = this.findOne.name;
  //   let relations = relationsRequired ? this.relations : [];
  //   return this.repo.findOne({
  //     where: searchCriteria,
  //     relations: relations,
  //   });
  // }

  // findByMultipleIDs(searchCriteria: FindDeviceModelAlertByMultipleIDs) {
  //   const searchObject: FindDeviceModelAlertDto = {};
  //   if (searchCriteria.csvAlertIDs) {
  //     searchObject.alertId = In(searchCriteria.csvAlertIDs.split(','));
  //   }
  //   if (searchCriteria.csvDeviceModelIDs) {
  //     searchObject.deviceModelId = In(
  //       searchCriteria.csvDeviceModelIDs.split(','),
  //     );
  //   }
  //   if (searchCriteria.csvRMUDeviceModelIDs) {
  //     searchObject.rmuDeviceModelId = In(
  //       searchCriteria.csvRMUDeviceModelIDs.split(','),
  //     );
  //   }
  //   return this.findAll(searchObject);
  // }

  // /* findOne(id: number) {
  //   return `This action returns a #${id} deviceModelAlert`;
  // } */

  // findOneById(id: string) {
  //   return this.repo.findOne({ where: { id: id } });
  // }

  // async update(
  //   id: string,
  //   updateDeviceModelAlertDto: UpdateDeviceModelAlertDto,
  // ) {
  //   const fnName = this.update.name;
  //   const input = `Input : Id : ${id}, Update Object : ${JSON.stringify(
  //     updateDeviceModelAlertDto,
  //   )}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (
  //     updateDeviceModelAlertDto.deviceModelId ||
  //     updateDeviceModelAlertDto.alertId ||
  //     updateDeviceModelAlertDto.rmuDeviceModelId
  //   ) {
  //     this.logger.error(
  //       `${fnName} : DeviceModelId, RMUDeviceModelId and/or alertId cannot be updated.`,
  //     );
  //     throw new Error(
  //       `DeviceModelId RMUDeviceModelId and/or alertId cannot be updated.`,
  //     );
  //   } else if (updateDeviceModelAlertDto.id == null) {
  //     this.logger.debug(
  //       `${fnName} : DeviceModelAlert Id not found in updateDeviceModelAlertDto`,
  //     );
  //     updateDeviceModelAlertDto.id = id;
  //   } else if (updateDeviceModelAlertDto.id != id) {
  //     this.logger.error(
  //       `${fnName} : DeviceModelAlert Id : ${id} and Update DeviceModelAlert Object Id : ${updateDeviceModelAlertDto.id} do not match`,
  //     );
  //     throw new Error(
  //       `DeviceModelAlert Id : ${id}and Update DeviceModelAlert Object Id : ${updateDeviceModelAlertDto.id} do not match`,
  //     );
  //   }

  //   const mergedDeviceModelAlert = await this.repo.preload(
  //     updateDeviceModelAlertDto,
  //   );

  //   if (mergedDeviceModelAlert == null) {
  //     this.logger.error(
  //       `${fnName} : ${NO_RECORD} : DeviceModelAlert id : ${id} not found`,
  //     );
  //     throw new Error(`${NO_RECORD} : DeviceModelAlert id : ${id} not found`);
  //   } else {
  //     this.logger.debug(
  //       `${fnName} : MergedDeviceModelAlert is : ${JSON.stringify(
  //         mergedDeviceModelAlert,
  //       )}`,
  //     );

  //     return await this.repo.save(mergedDeviceModelAlert);

  //     // const savedDeviceModelAlert = await this.repo.save(mergedDeviceModelAlert);
  //     // this.logger.debug(
  //     //   `${fnName} : Saved DeviceModelAlert is : ${JSON.stringify(savedDeviceModelAlert)}`,
  //     // );
  //     // return savedDeviceModelAlert;
  //   }
  // }

  // async delete(id: string) {
  //   const fnName = this.delete.name;
  //   const input = `Input : DeviceModelAlert Id : ${id} to be deleted`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   const result = await this.repo.delete(id);
  //   if (result.affected === 0) {
  //     this.logger.error(
  //       `${fnName} : ${NO_RECORD} : DeviceModelAlert id : ${id} not found`,
  //     );
  //     throw new Error(`${NO_RECORD} : DeviceModelAlert id : ${id} not found`);
  //   } else {
  //     this.logger.debug(
  //       `${fnName} : DeviceModelAlert id : ${id} deleted successfully`,
  //     );
  //     return result;
  //   }
  // }

  // async softDelete(id: string, deviceModelAlertToBeDeleted: DeviceModelAlert) {
  //   const fnName = this.softDelete.name;
  //   const input = `Input : DeviceModelAlert id : ${id} to be deleted`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   await this.repo.save(deviceModelAlertToBeDeleted);
  //   const result = await this.repo.softDelete(id);

  //   if (result.affected === 0) {
  //     this.logger.error(
  //       `${fnName} : ${NO_RECORD} : DeviceModelAlert id : ${id} not found`,
  //     );
  //     throw new Error(`${NO_RECORD} : DeviceModelAlert id : ${id} not found`);
  //   } else {
  //     this.logger.debug(
  //       `${fnName} : DeviceModelAlert id : ${id} softDeleted successfully`,
  //     );
  //     return result;
  //   }
  // }

  // async restore(id: string) {
  //   const fnName = this.restore.name;
  //   const input = `Input : DeviceModelAlert id : ${id} to be restored`;
  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   // return await this.repo.restore(id);
  //   const result = await this.repo.restore(id);
  //   if (result.affected === 0) {
  //     this.logger.error(
  //       `${fnName} : ${NO_RECORD} : DeviceModelAlert id : ${id} not found`,
  //     );
  //     throw new Error(
  //       `${fnName} : ${NO_RECORD} : DeviceModelAlert id : ${id} not found`,
  //     );
  //   } else {
  //     this.logger.debug(
  //       `${fnName} DeviceModelAlert id : ${id} restored successfully`,
  //     );
  //     let restored = await this.findOneById(id);
  //     if (restored) {
  //       restored.deletedBy = undefined;
  //       await this.repo.save(restored);
  //     }
  //     return restored;
  //   }
  // }
}
