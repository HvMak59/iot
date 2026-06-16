import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptions, ILike, In, IsNull, Repository } from 'typeorm';
// import {
//   findAll,
//   deleteRec,
//   softDelete,
//   restore,
// } from '../../utils/cmnFn.repository';

// import serviceConfig from '../../app_config/service.config.json';

import { Device } from './entities/device.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { FindDeviceDto } from './dto/find-device.dto';
import { HttpService } from '@nestjs/axios';
import {
  DUPLICATE_RECORD,
  KEY_SEPARATOR,
  NO_RECORD,
} from 'src/app_config/constants';
import { FindDevicesFromMultipleIDs } from './dto/find-device-from-multiple-IDs.dto';
import _ from 'lodash';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { Relations } from 'src/utils/enums';

// import { FindVirtualDeviceDto } from 'src/virtual-device/dto/find-virtual-device.dto';
import { FindAssetDto } from 'src/asset/dto/find-asset.dto';
import { DeviceDto } from 'src/iot-server/dto/device.dto';
import { Relations } from 'src/utils/enums';
import { DeviceTypeMetricsAttribute } from 'src/device-type-metrics-attribute/entities/device-type-metrics-attribute.entity';
import { FindOrgDto } from 'src/org/dto/find-org.dto';
import { FindDeviceModelDto } from 'src/device-model/dto/find-device-model.dto';
import { FindVirtualDeviceDto } from 'src/virtual-device/dto/find-virtual-device.dto';
// import { FindOrgDto } from 'src/org/dto/find-org.dto';
// import { FindDeviceModelDto } from 'src/device-model/dto/find-device-model.dto';
// import { DeviceTypeMetricsAttribute } from 'src/device-type-metrics-attribute/entities/device-type-metrics-attribute.entity';

@Injectable()
export class DeviceService {
  private serviceName = '';
  // private serviceName = serviceConfig.device.serviceName;
  // private eagerRelations = serviceConfig.device.eagerRelations;
  // private eagerRelationsWOTxns = serviceConfig.device.relationsWOTxns;
  // private relations = serviceConfig.device.relations;
  // private relationsWOTxns = serviceConfig.device.relationsWOTxns;
  // private combinedRelations = _.union(this.relations, this.eagerRelations);
  private readonly logger = winstonServerLogger(DeviceService.name);
  constructor(
    @InjectRepository(Device)
    private readonly repo: Repository<Device>,
    private httpService: HttpService, //@InjectRepository(Asset) private readonly assetRepo: Repository<Asset>,
  ) { }

  async create(createDeviceDto: CreateDeviceDto) {
    const fnName = 'create()';
    const input = `Input : ${JSON.stringify(createDeviceDto)}`;
    this.logger.debug(`${fnName} : ${input}`);
    let result;
    result = await this.repo.findOneBy({
      deviceModelId: createDeviceDto.deviceModelId,
      serialNo: createDeviceDto.serialNo,
    });
    this.logger.debug('Device found : ' + JSON.stringify(result));
    if (result === null) {
      const deviceObj = this.repo.create(createDeviceDto);
      return await this.repo.save(deviceObj);
    } else {
      const errMsg = `${DUPLICATE_RECORD} : ${createDeviceDto.serialNo} already exists`;
      this.logger.error(`${fnName} : ${errMsg}`);
      throw new Error(errMsg);
    }
  }

  async findAll(searchCriteria: FindDeviceDto, relation: Relations) {
    const fnName = this.findAll.name;
    const input = `Input : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    const devices = await this.repo.find({
      // where: searchCriteria, instead of this use bewlow code 
      where: {
        ...searchCriteria,
        searchTerm: searchCriteria.searchTerm
          ? ILike(`%${searchCriteria.searchTerm}%`)
          : undefined,
      },
      relations: this.getRelations(relation),
    });
    return devices.map((device) => new DeviceDto(device));
  }

  // async findAll(searchCriteria: FindDeviceDto, relation: Relations) {
  //   const msgTemplate = 'Find ' + this.serviceName + 's';
  //   // const devices = await findAll<Device>(
  //   //   this.repo,
  //   //   msgTemplate,
  //   //   this.getRelations(relation),
  //   //   searchCriteria,
  //   // );
  //   // return devices.map((device) => new DeviceDto(device));
  //   console.log("in service");
  //   const devices = await this.repo.find({
  //     where: searchCriteria,
  //     relations: []
  //   });
  //   // console.log("devices found", devices);
  //   return devices.map((device) => new DeviceDto(device));
  // }
  async findCount(findDevicesFromMultipleIDs: FindDevicesFromMultipleIDs) {
    const fnName = 'findCount()';
    const input = `Input : ${JSON.stringify(findDevicesFromMultipleIDs)}`;
    this.logger.debug(`${fnName} : ${input}`);
    const devices = await this.findAllByMultipleIDs2(
      findDevicesFromMultipleIDs,
      Relations.NONE,
    );
    return devices?.length;
  }

  // findAllByMultipleIDs(
  //   findDevicesFromMultipleIDs: FindDevicesFromMultipleIDs,
  //   relationsRequired = Relations.NONE,
  // ) {
  //   // const relations = this.getRelations(relationsRequired);
  //   const searchObject = this.getFindDeviceDTOFromMultipleIDs(
  //     findDevicesFromMultipleIDs,
  //   );
  //   if (_.isEmpty(searchObject)) {
  //     if (
  //       findDevicesFromMultipleIDs.csvOrgIDs &&
  //       findDevicesFromMultipleIDs.csvOrgIDs.length > 0
  //     ) {
  //       return this.repo.find({
  //         where: {
  //           ownerOrgId: In(findDevicesFromMultipleIDs.csvOrgIDs.split(',')),
  //         },
  //         relations: relations,
  //       });
  //     } else if (
  //       findDevicesFromMultipleIDs.csvAssetIDs &&
  //       findDevicesFromMultipleIDs.csvAssetIDs.length > 0
  //     ) {
  //       return this.repo.find({
  //         where: {
  //           virtualDevice: {
  //             assetId: In(findDevicesFromMultipleIDs.csvAssetIDs.split(',')),
  //           },
  //         },
  //         relations: relations,
  //       });
  //     } else if (
  //       findDevicesFromMultipleIDs.csvVirtualDeviceIDs &&
  //       findDevicesFromMultipleIDs.csvVirtualDeviceIDs.length > 0
  //     ) {
  //       return this.repo.find({
  //         where: {
  //           virtualDeviceId: In(
  //             findDevicesFromMultipleIDs.csvVirtualDeviceIDs.split(','),
  //           ),
  //         },
  //         relations: relations,
  //       });
  //     }
  //   } else {
  //     return this.repo.find({
  //       where: searchObject,
  //       relations: relations,
  //     });
  //   }
  // }

  findAllByMultipleIDs2(
    findDevicesFromMultipleIDs: FindDevicesFromMultipleIDs,
    relationsRequired: Relations | string[] = Relations.NONE,
  ) {
    const findDeviceDTO = this.getFindDeviceDTOFromMultipleIDs2(
      findDevicesFromMultipleIDs,
    );
    const fnName = 'findAllByMultipleIDs2()';
    const msgTemplate = DeviceService.name + '.' + 'findAllByMultipleIDs2()';

    this.logger.debug(
      `${fnName} : findDeviceDTO : ${JSON.stringify(findDeviceDTO)}`,
    );
    return this.repo.find({
      where: findDeviceDTO,
      relations: {
        // ownerOrg: true,
        virtualDevice: {
          asset: true,
        },
        deviceModel: true,
        currentOpenAlerts: true,
        // deviceModelState: true,
        // currentTelemetryPayloads: true,
      },
    });
  }

  // findUnAttachedDevicesByMultipleIDs(
  //   findDevicesFromMultipleIDs: FindDevicesFromMultipleIDs,
  //   relationsRequired: Relations | string[] = Relations.NONE,
  // ) {
  //   const fnName = 'findUnattachedDevicesByMultipleIDs()';
  //   const msgTemplate =
  //     DeviceService.name + '.' + 'findUnattachedDevicesByMultipleIDs()';

  //   // const findDeviceDTOs = this.getFindDeviceDTOFromMultipleIDs2(
  //   //   findDevicesFromMultipleIDs,
  //   // );

  //   for (const findDeviceDTO of findDeviceDTOs) {
  //     findDeviceDTO.virtualDeviceId = IsNull();
  //   }

  //   this.logger.debug(
  //     `${fnName} : findDeviceDTO : ${JSON.stringify(findDeviceDTOs)}`,
  //   );
  //   return this.repo.find({
  //     where: findDeviceDTOs,
  //     relations: {
  //       // ownerOrg: true,
  //       virtualDevice: {
  //         asset: true,
  //       },
  //       deviceModel: true,
  //       /* currentOpenAlerts: true,
  //       deviceModelState: true,
  //       currentTelemetryPayloads: true, */
  //     },
  //   });
  //   //return findAll<Device>(this.repo, msgTemplate, relations, findDeviceDTO);
  // }

  private getFindDeviceDTOFromMultipleIDs(
    findDevicesFromMultipleIDs: FindDevicesFromMultipleIDs,
  ) {
    const findDeviceDTO: FindDeviceDto = {};
    findDevicesFromMultipleIDs.csvOrgIDs
      ? (findDeviceDTO.ownerOrgId = In(
        findDevicesFromMultipleIDs.csvOrgIDs.split(','),
      ))
      : null;
    findDevicesFromMultipleIDs.csvDeviceIDs
      ? (findDeviceDTO.id = In(
        findDevicesFromMultipleIDs.csvDeviceIDs.split(','),
      ))
      : null;
    findDevicesFromMultipleIDs.csvVirtualDeviceIDs
      ? (findDeviceDTO.virtualDeviceId = In(
        findDevicesFromMultipleIDs.csvVirtualDeviceIDs.split(','),
      ))
      : null;
    findDevicesFromMultipleIDs.csvSerialNos
      ? (findDeviceDTO.serialNo = In(
        findDevicesFromMultipleIDs.csvSerialNos.split(','),
      ))
      : null;
    findDevicesFromMultipleIDs.csvClientDeviceIDs
      ? (findDeviceDTO.clientDeviceId = In(
        findDevicesFromMultipleIDs.csvClientDeviceIDs.split(','),
      ))
      : null;
    findDevicesFromMultipleIDs.csvDeviceModelIDs
      ? (findDeviceDTO.deviceModelId = In(
        findDevicesFromMultipleIDs.csvDeviceModelIDs.split(','),
      ))
      : null;
    return findDeviceDTO;
  }
  async findOneById(id: string, relations: Relations = Relations.MIN_WO_TXNS) {
    const device = await this.repo.findOne({
      where: { id: id },
      // relations: this.getRelations(relations),
    });
    if (device == null) {
      return null;
    } else {
      return new DeviceDto(device);
    }
  }

  findOneByIdWthRelations(id: string) {
    return this.repo.findOne({
      where: {
        id: id,
      },
      // relations: this.combinedRelations,
    });
  }

  async findWithDeviceTypeByAssetID(assetId: string) {
    const devices = await this.repo.find({
      select: {
        id: true,
        deviceModel: {
          id: true,
          //deviceTypeId: true,
          deviceType: {
            id: true,
            deviceTypeMetricsAttributes: {
              id: true,
              deviceTypeId: true,
              metricsAttributeId: true,
            },
          },
        },
      },
      where: {
        virtualDevice: {
          asset: {
            id: assetId,
          },
        },
      },
      relations: {
        //virtualDevice: true,
        deviceModel: {
          deviceType: {
            deviceTypeMetricsAttributes: true,
          },
        },
      },
    });
    const deviceTypeMetricsAttributes: DeviceTypeMetricsAttribute[] = [];
    const deviceTypeMetricsAttributeSet = new Set<string>();
    for (const device of devices) {
      for (const dtma of device.deviceModel.deviceType
        .deviceTypeMetricsAttributes) {
        if (
          !deviceTypeMetricsAttributeSet.has(
            dtma.deviceTypeId + '-' + dtma.metricsAttributeId,
          )
        ) {
          deviceTypeMetricsAttributes.push(dtma);
          deviceTypeMetricsAttributeSet.add(
            dtma.deviceTypeId + '-' + dtma.metricsAttributeId,
          );
        }
      }
      //if (device.deviceModel && device.deviceModel.deviceType) {
      /* deviceTypeMetricsAttributes.push(
        ...device.deviceModel.deviceType.deviceTypeMetricsAttributes,
      ); */
    }
    //}
    return deviceTypeMetricsAttributes;
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto) {
    const fnName = this.update.name;
    const input =
      'Input : id : ' +
      id +
      ' updateDevice : ' +
      JSON.stringify(updateDeviceDto);
    this.logger.debug(`${fnName} : ${input}`);
    if (id == null) {
      throw new Error('Device id is not available');
    } else if (updateDeviceDto.id == null) {
      updateDeviceDto.id = id;
    } else if (updateDeviceDto.id != id) {
      throw new Error('Device id does not match with update device object');
    }
    const mergedDevice = await this.repo.preload(updateDeviceDto);
    this.logger.debug(
      `${fnName} : mergedDevice : ${JSON.stringify(mergedDevice)}`,
    );
    if (mergedDevice == null) {
      throw new Error(`Device id ${id} does not exist`);
    } else {
      return await this.repo.save(mergedDevice);
    }
  }

  async attachVirtualDevice(id: string, updateDeviceDto: UpdateDeviceDto) {
    const fnName = 'attachVirtualDevice()';
    const input = `Input : DeviceId : ${id} and Device object to be Attached is : ${JSON.stringify(
      updateDeviceDto,
    )}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const device = await this.findOneById(id);

    if (device == null) {
      throw new Error(`Device id : ${id} not found`);
    } else {
      if (device.virtualDeviceId) {
        this.logger.error(
          `${fnName} : DeviceId : ${id} already attached with VirtualDeviceId : ${device.virtualDeviceId}`,
        );
        throw new Error(
          `Device already attached with VirtualDeviced : ${device.virtualDeviceId}`,
        );
      } else {
        if (updateDeviceDto.id == null) {
          this.logger.debug(
            `${fnName} : Device id not available in updateDeviceDto`,
          );
          updateDeviceDto.id = id;
        } else if (updateDeviceDto.id != id) {
          this.logger.error(
            `${fnName} : Device id : ${id} and AttachDevice device id : ${updateDeviceDto.id} do not match`,
          );
          throw new Error(`Device id and AttachDevice device id do not match`);
        }

        return await this.update(id, updateDeviceDto);
      }
    }
  }

  async detachVirtualDevice(id: string, updateDeviceDto: UpdateDeviceDto) {
    const fnName = 'detchVirtualDevice()';
    const input = `Input : DeviceId : ${id} and Device object to be Detach is : ${JSON.stringify(
      updateDeviceDto,
    )}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const device = await this.findOneById(id);

    if (device == null) {
      throw new Error(`Device id : ${id} not found`);
    } else {
      if (device.virtualDeviceId == null) {
        this.logger.error(
          `${fnName} : DeviceId : ${id} not attached with any VirtualDevice`,
        );
        throw new Error(`DeviceId : ${id} not attached with any VirtualDevice`);
      } else {
        if (updateDeviceDto.id == null) {
          this.logger.debug(
            `${fnName} : Device id not available in updateDeviceDto`,
          );
          updateDeviceDto.id = id;
        } else if (updateDeviceDto.id != id) {
          this.logger.error(
            `${fnName} : Device id : ${id} and DetachDevice object id : ${updateDeviceDto.id} does not match`,
          );
          throw new Error(
            `Device id and DetachDevice object id does not match`,
          );
        }

        return await this.update(id, updateDeviceDto);
      }
    }
  }

  // delete(id: string) {
  //   const msgTemplate = 'Delete ' + this.serviceName;
  //   return deleteRec<Device>(this.repo, id, msgTemplate);
  // }

  // softDelete(id: string) {
  //   const msgTemplate = 'Soft delete ' + this.serviceName;
  //   return softDelete<Device>(this.repo, id, msgTemplate);
  // }

  // restore(id: string) {
  //   const msgTemplate = 'Restore ' + this.serviceName;
  //   return restore<Device>(this.repo, id, msgTemplate);
  // }

  /*Use findAllByMultipleIDs*/
  /*  fromOwnerOrgIDs(csvOwnerOrgIDs: string) {
    return this.repo.find({
      where: { ownerOrgId: In(csvOwnerOrgIDs.split(',')) },
      order: { id: 'ASC' },
    });
  }

  fromDeviceIDs(csvDeviceIDs: string) {
    return this.repo.find({
      where: { id: In(csvDeviceIDs.split(',')) },
      order: { id: 'ASC' },
    });
  } */

  /*This won't work till VirtualDevice needs to be attached to Device */
  findAllByAssetIDs(csvAssetIDs: string) {
    return this.repo.find({
      where: {
        virtualDevice: {
          assetId: In(csvAssetIDs.split(',')),
        },
      },
      // relations: serviceConfig.device.eagerRelations,
      order: { id: 'ASC' },
    });
  }

  /*This won't work till VirtualDevice needs to be attached to Device */
  fromSpecificAssetTypesAndOrgs(csvAssetTypeIDs: string, csvOrgIDs: string) {
    return this.repo.find({
      where: {
        virtualDevice: {
          asset: {
            orgId: In(csvOrgIDs.split(',')),
            assetTypeId: In(csvAssetTypeIDs.split(',')),
          },
        },
      },
      order: { id: 'ASC' },
    });
  }

  /* This won't work. deviceModel.deviceMeasurements does not exist */
  async findDeviceAndAttributeMetrics(id: string) {
    const msgTemplate =
      'Find ' + this.serviceName + ' with Device and Device measurements';
    //return findOne<DeviceInstance>(this.repo, id, msgTemplate, "asset-type", "asset");
    return this.repo.findOne({
      where: {
        id: id,
      },
      relations: ['deviceModel', 'deviceModel.deviceMeasurements'],
    });
  }

  /* Device groups moved to virtual device */
  /*  async findDeviceGroups(id: string) {
    const msgTemplate = 'Find ' + this.serviceName + ' with Device groups';
    //return findOne<DeviceInstance>(this.repo, id, msgTemplate, "asset-type", "asset");
    try {
      return await this.repo.findOne({
        where: {
          id: id,
        },
        relations: ['deviceGroups'],
      });
    } catch (error) {
      this.logger.error(`${msgTemplate} : ${id} : ${error}`);
      throw new Error(error as string);
    }
  } */

  /*This won't work till VirtualDevice needs to be attached to Device */
  findVirtualDevice(id: string) {
    const fnName = 'findVirtualDevice()';
    return this.repo.findOne({
      where: {
        id: id,
      },
      relations: {
        virtualDevice: true,
      },
    });
  }

  findDvceAndDvceModel(csvDeviceIds: string, assetID?: string) {
    const deviceIds = csvDeviceIds.split(',');
    const searchObject: FindDeviceDto = {
      id: In(deviceIds),
    };
    assetID ? (searchObject.virtualDevice = { assetId: assetID }) : null;
    return this.repo.find({
      where: searchObject,
      relations: {
        deviceModel: true,
      },
    });
  }

  validateDevice(csvClientDeviceIds: string, assetID?: string) {
    const clientDeviceIds = csvClientDeviceIds.split(',');
    const searchObject: FindDeviceDto = {
      clientDeviceId: In(clientDeviceIds),
    };
    if (assetID) {
      searchObject.virtualDevice = { assetId: assetID };
    }
    /* const searchObject: FindDeviceDto = {
      clientDeviceId: In(clientDeviceIds),
      virtualDevice: { assetId: assetID },
    }; */
    return this.repo.find({
      where: searchObject,
      relations: {
        deviceModel: true,
        virtualDevice: true,
      },
    });
  }

  getRelations(relation: Relations) {
    let relations;
    switch (relation) {
      case Relations.NONE:
        relations = [];
        break;
      case Relations.MIN:
        // relations = this.eagerRelations;
        break;
      case Relations.MIN_WO_TXNS:
        // relations = this.eagerRelationsWOTxns;
        break;
      case Relations.ALL:
        // relations = this.combinedRelations;
        break;
      case Relations.ALL_WO_TXNS:
        // relations = this.relationsWOTxns;
        break;
      default:
        this.logger.error(`Invalid relation ${relation}`);
        break;
    }
    return relations;
  }

  getFindDeviceDTOFromMultipleIDs2(
    searchCriteria: FindDevicesFromMultipleIDs,
  ): FindDeviceDto[] {
    const fnName = 'getFindDeviceDTOFromMultipleIDs2()';
    const findDeviceDTOForDeviceOrg: FindDeviceDto = {};
    const findDeviceDTOForAsset: FindDeviceDto = {};
    //const findVirtualDeviceDTO: FindVirtualDeviceDto = {};
    const findVirtualDeviceDTO2: FindVirtualDeviceDto = {};
    //const findAssetDTO: FindAssetDto = {};
    const findAssetDTO2: FindAssetDto = {};
    const findDeviceDTOs: FindDeviceDto[] = [];
    const findOrgDTO: FindOrgDto = {};
    const findDeviceModelDTO: FindDeviceModelDto = {};
    if (searchCriteria.csvOrgIDs && searchCriteria.csvOrgIDs.length > 0) {
      /* findDeviceDTOForDeviceOrg.ownerOrgId = In(
        searchCriteria.csvOrgIDs.split(','),
      ); */
      const orgIDs = searchCriteria.csvOrgIDs.split(',');
      const uniqueOrgIDs = _.uniq(orgIDs);
      findAssetDTO2.orgId = In(uniqueOrgIDs);
    }
    /* if (searchCriteria.csvOrgIDs && searchCriteria.csvOrgIDs.length > 0) {
      findAssetDTO.orgId = In(searchCriteria.csvOrgIDs.split(','));
    } */
    if (
      searchCriteria.csvOwnerOrgIDs &&
      searchCriteria.csvOwnerOrgIDs.length > 0
    ) {
      const ownerOrgIDs = searchCriteria.csvOwnerOrgIDs.split(',');
      const uniqueOwnerOrgIDs = _.uniq(ownerOrgIDs);
      findOrgDTO.id = In(uniqueOwnerOrgIDs);
    }
    if (_.keys(findOrgDTO).length > 0) {
      // findDeviceDTOForDeviceOrg.ownerOrg = findOrgDTO; // uncommnt
    }

    if (
      searchCriteria.csvAssetTypeIDs &&
      searchCriteria.csvAssetTypeIDs.length > 0
    ) {
      const assetTypeIDs = searchCriteria.csvAssetTypeIDs.split(',');
      const uniqueAssetTypeIDs = _.uniq(assetTypeIDs);
      findAssetDTO2.assetTypeId = In(uniqueAssetTypeIDs);
    }
    if (searchCriteria.csvAssetIDs && searchCriteria.csvAssetIDs.length > 0) {
      findAssetDTO2.id = In(searchCriteria.csvAssetIDs.split(','));
    }
    if (_.keys(findAssetDTO2).length > 0) {
      // findVirtualDeviceDTO2.asset = findAssetDTO2;  // uncommnt
    }
    if (
      searchCriteria.csvVirtualDeviceIDs &&
      searchCriteria.csvVirtualDeviceIDs.length > 0
    ) {
      const virtualDeviceIDs = searchCriteria.csvVirtualDeviceIDs.split(',');
      const uniqueVirtualDeviceIDs = _.uniq(virtualDeviceIDs);
      // findVirtualDeviceDTO2.id = In(uniqueVirtualDeviceIDs); // uncommnt
    }
    if (_.keys(findVirtualDeviceDTO2).length > 0) {
      // findDeviceDTOForAsset.virtualDevice = findVirtualDeviceDTO2; // uncommnt
    }
    if (searchCriteria.csvDeviceIDs && searchCriteria.csvDeviceIDs.length > 0) {
      const deviceIDs = searchCriteria.csvDeviceIDs.split(',');
      const uniqueDeviceIDs = _.uniq(deviceIDs);
      findDeviceDTOForDeviceOrg.id = In(uniqueDeviceIDs);
      findDeviceDTOForAsset.id = In(uniqueDeviceIDs);
    }

    if (
      searchCriteria.csvDeviceTypeIDs &&
      searchCriteria.csvDeviceTypeIDs.length > 0
    ) {
      const deviceTypeIDs = searchCriteria.csvDeviceTypeIDs.split(',');
      const uniqueDeviceTypeIDs = _.uniq(deviceTypeIDs);
      findDeviceModelDTO.deviceTypeId = In(uniqueDeviceTypeIDs);
      findDeviceDTOForDeviceOrg.deviceModel = findDeviceModelDTO;
      findDeviceDTOForAsset.deviceModel = findDeviceModelDTO;
    }
    _.keys(findDeviceDTOForDeviceOrg).length > 0
      ? findDeviceDTOs.push(findDeviceDTOForDeviceOrg)
      : null;
    _.keys(findDeviceDTOForAsset).length > 0
      ? findDeviceDTOs.push(findDeviceDTOForAsset)
      : null;
    //findDeviceDTOs.push(findDeviceDTOForDeviceOrg);
    //if (_.keys(findAssetDTO2).length > 0) {
    //Object.assign(findAssetDTO2, findAssetDTO);
    //Object.assign(findVirtualDeviceDTO2, findVirtualDeviceDTO);
    //Object.assign(findDeviceDTOForAsset, findDeviceDTOForDeviceOrg);
    //findVirtualDeviceDTO2.asset = findAssetDTO2;
    //findDeviceDTOForAsset.virtualDevice = findVirtualDeviceDTO2;
    //delete findDeviceDTOForAsset.ownerOrgId;
    //findDeviceDTOs.push(findDeviceDTOForAsset);
    //}
    this.logger.debug(
      `${fnName} : FindDeviceDTOs : ${JSON.stringify([...findDeviceDTOs])}`,
    );
    return findDeviceDTOs;
  }

  // findbyDeviceIdandStateCode(deviceId: string, stateCode: string) {
  //   const fnName = `findbyDeviceIdandStateCode()`;
  //   this.logger.info(
  //     `${fnName} : Start : Input :deviceId:${deviceId} , stateCode: ${stateCode} `,
  //   );
  //   return this.repo.find({
  //     where: {
  //       id: deviceId,
  //       deviceModel: {
  //         deviceModelStates: {
  //           stateCode: stateCode,
  //         },
  //       },
  //     },
  //     relations: { deviceModel: { deviceModelStates: true } },
  //   });
  // }
}
