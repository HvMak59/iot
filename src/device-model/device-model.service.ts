import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Response } from 'express';
// import {
//   findAll,
//   deleteRec,
//   softDelete,
//   restore,
// } from '../../utils/cmnFn.repository';

// import serviceConfig from '../../app_config/service.config.json';

import { DeviceModel } from './entities/device-model.entity';
import { CreateDeviceModelDto } from './dto/create-device-model.dto';
import { UpdateDeviceModelDto } from './dto/update-device-model.dto';
import { FindDeviceModelDto } from './dto/find-device-model.dto';
import _ from 'lodash';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import {
  DUPLICATE_RECORD,
  KEY_SEPARATOR,
  NO_RECORD,
} from 'src/app_config/constants';
import { FindDeviceModelAlertByMultipleIDs } from 'src/device-model-alert/dto/find-device-model-alert-byMultipleIDs.dto';
import { FindAlertDto } from 'src/alert/dto/find-alert.dto';
import { AlertMaster } from 'src/alert-master/entities/alert-master.entity';
import { FindAlertMasterDto } from 'src/alert-master/dto/find-alert-master.dto';
// import { FindAlertMasterDto } from 'src/alert-master/dto/find-alert-master.dto';
// import { FindAlertMasterIdentifierDto } from 'src/alert-master-identifier/dto/find-alert-master-identifier.dto';

@Injectable()
export class DeviceModelService {
  private serviceName = DeviceModelService.name;
  private readonly logger = winstonServerLogger(DeviceModelService.name);
  constructor(
    @InjectRepository(DeviceModel)
    private readonly repo: Repository<DeviceModel>,
  ) { }

  async create(createDeviceModelDto: CreateDeviceModelDto) {
    const fnName = this.create.name;
    const result = await this.repo.findOneBy({
      deviceManufacturerId: createDeviceModelDto.deviceManufacturerId,
      name: createDeviceModelDto.name,
    });
    if (result) {
      this.logger.debug(`${fnName} : ${result.id} already exists`);
      throw new Error(`${DUPLICATE_RECORD} : ${result.id} already exists`); //.json(org);
    } else {
      const deviceModel = this.repo.create(createDeviceModelDto);
      const createdDeviceModel = await this.repo.save(deviceModel);
      this.logger.debug(`${fnName} : ${createdDeviceModel.id} created`);
      return createdDeviceModel;
    }
  }

  findAll(
    searchCriteria: FindDeviceModelDto,
    relationsRequired: boolean = false,
  ) {
    return this.repo.find({
      where: searchCriteria,
      relations: {
        origDeviceModel: true,
      },
    });
  }
  // findAllWthAMIs(
  //   searchCriteria: FindDeviceModelDto,
  //   relationsRequired: boolean = false,
  // ) {
  //   return this.repo.find({
  //     where: searchCriteria,
  //     relations: {
  //       alertMasterIdentifiers: true,
  //     },
  //   });
  // }

  findAlertsFromMultipleIDs(searchObj: FindDeviceModelAlertByMultipleIDs) {
    const fnName = this.findAlertsFromMultipleIDs.name;
    const input = `Input : Find DeviceModel Alerts with searchCriteria : ${JSON.stringify(
      searchObj,
    )}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const findDeviceModelDTO: FindDeviceModelDto =
      this.getFindDeviceModelDTO(searchObj);
    return this.repo.find({
      where: findDeviceModelDTO,
      relations: {
        alertMasterIdentifiers: {
          alertMasterRecs: true,
        },
      },
    });
  }

  getFindDeviceModelDTO(searchObj: FindDeviceModelAlertByMultipleIDs) {
    const fnName = this.getFindDeviceModelDTO.name;
    const input = `Input : Find DeviceModel with searchCriteria : ${JSON.stringify(
      searchObj,
    )}`;
    const searchCriteria: FindDeviceModelDto = {};
    this.logger.debug(fnName + KEY_SEPARATOR + input);
    if (
      searchObj.csvDeviceModelIDs != null &&
      searchObj.csvDeviceModelIDs.length > 0
    ) {
      const csvDeviceModelIDs = searchObj.csvDeviceModelIDs;
      const deviceModelIDs = csvDeviceModelIDs.split(',');
      const uniqueDeviceModelIDs = _.uniq(deviceModelIDs);
      this.logger.debug(
        `${fnName} : DeviceModelIDs found in searchObj : ${JSON.stringify([
          ...uniqueDeviceModelIDs,
        ])}`,
      );
      // If csvDeviceModelIDs is present, use it to find DeviceModels
      // Split the CSV string into an array and use it in the search criteria
      this.logger.debug(
        `${fnName} : Creating searchCriteria with csvDeviceModelIDs`,
      );
      searchCriteria.id = In(uniqueDeviceModelIDs);
    }
    if (searchObj.csvAlertIDs != null && searchObj.csvAlertIDs.length > 0) {
      const alertIDs = searchObj.csvAlertIDs.split(',');
      const uniqueAlertIDs = _.uniq(alertIDs);
      this.logger.debug(
        `${fnName} : AlertIDs found in searchObj : ${JSON.stringify([
          ...uniqueAlertIDs,
        ])}`,
      );
      const findAlertMasterDto: FindAlertMasterDto = {
        alertId: In(uniqueAlertIDs),
      };
      this.logger.debug(
        `${fnName} : findAlertMasterDto is : ${JSON.stringify(
          findAlertMasterDto,
        )}`,
      );
      searchCriteria.alertMasterIdentifiers = {
        alertMasterRecs: findAlertMasterDto,
      };
      this.logger.debug(
        `${fnName} : searchCriteria.alertMasterIdentifiers is : ${JSON.stringify(
          searchCriteria.alertMasterIdentifiers,
        )}`,
      );
    } else {
      this.logger.debug(`${fnName} : csvAlertIDs is not available.`);
    }
    this.logger.debug(
      `${fnName} : Returned searchCriteria is ${JSON.stringify(
        searchCriteria,
      )}`,
    );
    return searchCriteria;
  }
}


/* const msgTemplate = DeviceModel.name + ' findAlertsFromMultipleIDs()';
  }

  // /* findAllWthRelations() {
  //   const msgTemplate = 'Find ' + this.serviceName + 's' + ' with relations';
  //   return findAll<Device>(
  //     this.repo,
  //     msgTemplate,
  //     serviceConfig.device.relations,
  //   );
  // } */

// findOneById(id: string) {
//   //try {
//   return this.repo.findOne({ where: { id: id } });
// }

// findOneByIdWthRelations(id: string) {
//   const msgTemplate = DeviceModel.name + ' findOneByIdWthRelations()';
//   //return findOne<Device>(this.repo, id, msgTemplate, "asset-type", "asset");
//   return this.repo.findOne({
//     where: {
//       id: id,
//     },
//     relations: serviceConfig.deviceModel.relations,
//   });
//   /* try {
//     return await this.repo.findOne({
//       where: {
//         id: id,
//       },
//       relations: serviceConfig.deviceModel.relations,
//     });
//   } catch (error) {
//     throw new Error(error as string);
//   } */
// }

// findFromCSVIDs(
//   csvIDs: string,
//   csvDeviceTypeIDs?: string,
//   relationsFlag = false,
// ) {
//   const relations = relationsFlag ? serviceConfig.deviceModel.relations : [];
//   //try {
//   if (csvDeviceTypeIDs && csvDeviceTypeIDs.length > 0) {
//     return this.repo.find({
//       where: {
//         id: In(csvIDs.split(',')),
//         deviceTypeId: In(csvDeviceTypeIDs!.split(',')),
//       },
//       relations: relations,
//     });
//   } else {
//     return this.repo.find({
//       where: {
//         id: In(csvIDs.split(',')),
//       },
//       relations: relations,
//     });
//   }
//   /* } catch (error) {
//     const errMsg = getTryCatchErrorStr(error);
//     throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
//   } */
// }

// async findUnits(csvIDs: string) {
//   //try {
//   return this.repo.find({
//     where: {
//       id: In(csvIDs.split(',')),
//     },
//     relations: {
//       deviceModelAttributes: {
//         metricsAttribute: true,
//       },
//     },
//   });
//   /* } catch (error) {
//     const errMsg = getTryCatchErrorStr(error);
//     this.logger.error(`${msgTemplate} : ${event} : ${errMsg}`);
//     throw new HttpException(errMsg, HttpStatus.INTERNAL_SERVER_ERROR);
//   } finally {
//     this.logger.debug(`${msgTemplate} : End`);
//   } */
// }

// async update(id: string, updateDeviceModelDto: UpdateDeviceModelDto) {
//   const fnName = 'update()';
//   if (updateDeviceModelDto.id == null) {
//     this.logger.debug(
//       `${fnName} : DeviceModel Id not found in UpdateDeviceModelDto`,
//     );
//     updateDeviceModelDto.id = id;
//   } else if (updateDeviceModelDto.id != id) {
//     const errMsg = `DeviceModel Id : ${id} and Update DeviceModel object Id : ${updateDeviceModelDto.id} do not match`;
//     this.logger.error(`${fnName} : ${errMsg}`);
//     throw new Error(errMsg);
//   }
//   const mergedDeviceModel = await this.repo.preload(updateDeviceModelDto);
//   this.logger.debug(
//     `${fnName} : Merged DeviceModel is : ${JSON.stringify(
//       mergedDeviceModel,
//     )}`,
//   );
//   if (mergedDeviceModel == null) {
//     this.logger.error(
//       `${fnName} : ${NO_RECORD} : Devicemodel Id : ${id} not found`,
//     );
//     throw new Error(`${NO_RECORD} : Devicemodel Id : ${id} not found`);
//   } else {
//     return await this.repo.save(mergedDeviceModel);
//   }
// }

// delete(id: string) {
//   const msgTemplate = 'Delete ' + this.serviceName;
//   return deleteRec<DeviceModel>(this.repo, id, msgTemplate);
// }

// softDelete(id: string) {
//   const msgTemplate = 'Soft delete ' + this.serviceName;
//   return softDelete<DeviceModel>(this.repo, id, msgTemplate);
// }

// restore(id: string) {
//   const msgTemplate = 'Restore ' + this.serviceName;
//   return restore<DeviceModel>(this.repo, id, msgTemplate);
// }