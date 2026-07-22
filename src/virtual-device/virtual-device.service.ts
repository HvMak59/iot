import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { In, IsNull, Repository, TreeRepository } from 'typeorm';
// import {
//   deleteRec,
//   findAll,
//   restore,
//   softDelete,
// } from 'src/utils/cmnFn.repository';
// import { CreateVirtualDeviceDto } from './dto/create-virtual-device.dto';
import { FindVirtualDeviceDto } from './dto/find-virtual-device.dto';
// import { UpdateVirtualDeviceDto } from './dto/update-virtual-device.dto';
import { VirtualDevice } from './entities/virtual-device.entity';


// import serviceConfig from '../../app_config/service.config.json';
import * as _ from 'lodash';
// import {
//   DUPLICATE_RECORD,
//   NO_RECORD,
//   UPDATE_VIRTUAL_DEVICE_GROUP_FROM_VIRTUAL_DEVICE_URL,
//   VIRTUAL_DEVICE_GROUP_URL,
// } from 'src/app_config/constants';
// import { DUPLICATE_RECORD, KEY_SEPARATOR, NO_RECORD } from 'src/app_config/constants';
import { HttpService } from '@nestjs/axios';
// import { getTokenString, throwErrIfSrvcRespFailure } from 'src/utils/others';
import { firstValueFrom } from 'rxjs';
// import { winstonServerLogger } from 'src/app_config/serverWinston.config (1)';
import { Device } from 'src/device/entities/device.entity';
import { DeviceService } from 'src/device/device.service';
import { ATTACH_DEVICE_URL, DETACH_DEVICE_URL, DEVICE_URL, DUPLICATE_RECORD, KEY_SEPARATOR, NO_RECORD, UPDATE_VIRTUAL_DEVICE_GROUP_FROM_VIRTUAL_DEVICE_URL, VIRTUAL_DEVICE_GROUP_URL, VIRTUAL_DEVICE_URL } from 'src/app_config/constants';
import { getTokenString, throwErrIfSrvcRespFailure } from 'src/utils/others';
import { VirtualDeviceGroup } from 'src/virtual-device-group/entities/virtual-device-group.entity';
import { Response } from 'express';
import { aggregationStatus, Relations } from 'src/utils/enums';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { MetricsAttributeAggregationService } from 'src/metrics-attribute-aggregation/metrics-attribute-aggregation.service';
import { VirtualDeviceGroupService } from 'src/virtual-device-group/virtual-device-group.service';
import { GroupMetricsAttributeAggregationService } from 'src/group-metrics-attribute-aggregation/group-metrics-attribute-aggregation.service';
import { PeriodTelemetryPayloadAudit } from 'src/period-telemetry-payload-audit/entities/period-telemetry-payload-audit.entity';
import { CreateVirtualDeviceDto } from './dto/create-virtual-device.dto';
// import { DeviceService } from 'src/device/device.service';
// import { Device } from 'src/device/entities/device.entity';
// import { DeviceModel } from 'src/device-model/entities/device-model.entity';
// import { VirtualDeviceGroup } from 'src/virtual-device-group/entities/virtual-device-group.entity';
// import { Relations } from 'src/utils/enums';


@Injectable()
export class VirtualDeviceService {
  private readonly logger = winstonServerLogger(VirtualDeviceService.name);
  private readonly eagerRelations = [
    "parent",
    "device",
    "virtualDeviceGroups",
    "currentTelemetryPayloads",
    "currentOpenAlerts"
  ] //serviceConfig.virtualDevice.eagerRelations;
  private readonly relations = [
    "parent",
    "children",
    "asset",
    "device",
    "currentTelemetryPayloads",
    "sourceRelations",
    "targetRelations",
    "currentOpenAlerts",
    "alerts",
    "virtualDeviceGroups"
  ]//serviceConfig.virtualDevice.relations;
  private readonly combinedRelations = _.union(
    this.relations,
    this.eagerRelations,
  );
  private schema;
  private appServer;
  private appPort;
  private baseURL;
  constructor(
    @InjectRepository(VirtualDevice)
    // private readonly repo: Repository<VirtualDevice>,
    // @InjectRepository(VirtualDeviceGroup)
    // private readonly vdgRepo: Repository<VirtualDeviceGroup>,
    // @InjectRepository(VirtualDevice) private readonly repo: Repository<VirtualDevice>,
    @InjectRepository(VirtualDevice) private readonly repo: TreeRepository<VirtualDevice>,
    private readonly deviceService: DeviceService,
    private readonly httpService: HttpService,
    private readonly metricsAttributeAggregationService: MetricsAttributeAggregationService,
    private readonly virtualDeviceGroupService: VirtualDeviceGroupService,
    private readonly groupMetricsAttributeAggregationService: GroupMetricsAttributeAggregationService,
  ) {
    this.schema = process.env['SCHEMA'];
    this.appServer = process.env['APP_SERVER'];
    this.appPort = process.env['APP_PORT'];
    this.baseURL = `${this.schema}://${this.appServer}:${this.appPort}`;
    this.baseURL = 'http://localhost:3000'
  }
  //   async create(createVirtualDeviceDto: CreateVirtualDeviceDto, token: string) {
  //     const fnName = 'create()'
  //     const input = `Create object : ${JSON.stringify(createVirtualDeviceDto)}`

  //     this.logger.debug(fnName + KEY_SEPARATOR + input)

  //     let result = await this.repo.findOneBy({
  //       assetId: createVirtualDeviceDto.assetId,
  //       name: createVirtualDeviceDto.name,
  //     });
  //     if (result != null) {
  //       throw new Error(
  //         `${DUPLICATE_RECORD} : ${createVirtualDeviceDto.assetId}${KEY_SEPARATOR}${createVirtualDeviceDto.name} already exists`,
  //       );
  //     } else {
  //       if (
  //         createVirtualDeviceDto.virtualDeviceGroups == null ||
  //         createVirtualDeviceDto.virtualDeviceGroups.length == 0
  //       ) {
  //         const createVirtualDeviceObj = this.repo.create(createVirtualDeviceDto);
  //         return await this.repo.save(createVirtualDeviceObj);
  //       } else {
  //         const { virtualDeviceGroups, ...createVirtualDeviceWithoutGroups } =
  //           createVirtualDeviceDto;
  //         const createVirtualDeviceObj = this.repo.create(
  //           createVirtualDeviceWithoutGroups,
  //         );
  //         const createdVirtualDevice = await this.repo.save(
  //           createVirtualDeviceObj,
  //         );
  //         const virtualDeviceGroupURL = new URL(
  //           VIRTUAL_DEVICE_GROUP_URL,
  //           this.baseURL,
  //         );
  //         this.logger.debug(
  //           `virtualDeviceGroupURL : ${virtualDeviceGroupURL.href}`,
  //         );
  //         this.httpService.axiosRef.defaults.headers.common['Authorization'] =
  //           getTokenString(token);
  //         const createdVirtualDeviceGroups = [];
  //         for (const virtualDeviceGroup of virtualDeviceGroups) {
  //           virtualDeviceGroup.virtualDeviceId = createdVirtualDevice.id;
  //           this.logger.debug(
  //             `Virtual device group : ${JSON.stringify(virtualDeviceGroup)}`,
  //           );
  //           const virtualDeviceGroupURLResp = await firstValueFrom(
  //             this.httpService.post(
  //               virtualDeviceGroupURL.href,
  //               virtualDeviceGroup,
  //             ),
  //           );
  //           throwErrIfSrvcRespFailure(virtualDeviceGroupURLResp);
  //           createdVirtualDeviceGroups.push(virtualDeviceGroupURLResp.data);
  //         }
  //         createdVirtualDevice.virtualDeviceGroups = createdVirtualDeviceGroups;
  //         return createdVirtualDevice;
  //       }

  //       // const res = this.repo.create(createVirtualDeviceDto)
  //       // result = await this.repo.save(res)
  //       // this.logger.debug(`${fnName} : ${JSON.stringify(result)} created`);
  //       // return result;
  //     }
  //   }

  //   findAll(
  //     searchCriteria: FindVirtualDeviceDto,
  //     // relationsRequired = Relations.NONE,
  //   ) {
  //     const msgTemplate = `findAll() : Input : ${JSON.stringify(searchCriteria)}`;
  //     return this.repo.find({
  //       where: searchCriteria,
  //       // relations: {
  //       //   virtualDeviceGroups: true,
  //       //   /* children: true,
  //       //   parent: true, */
  //       //   device: {
  //       //     // deviceModel: true,
  //       //   },
  //       // },
  //       // order: { id: 'ASC' },
  //     });
  //     /* let relations = this.getRelations(relationsRequired);
  //     return findAll<VirtualDevice>(
  //       this.repo,
  //       msgTemplate,
  //       relations,
  //       searchCriteria,
  //     ); */
  //   }

  //   // findOne(
  //   //   searchCriteria: FindVirtualDeviceDto,
  //   //   relationsRequired: boolean = false,
  //   // ) {
  //   //   let relations = relationsRequired
  //   //     ? this.combinedRelations
  //   //     : this.eagerRelations;
  //   //   return this.repo.findOne({ where: searchCriteria, relations: relations });
  //   // }`

  //   // async findOneById(id: string, relationsRequired: boolean = false) {
  //   //   let relations = relationsRequired
  //   //     ? this.combinedRelations
  //   //     : this.eagerRelations;
  //   //   const found = await this.repo.findOne({ where: { id: id }, /*relations: relations*/ });
  //   //   return found
  //   // }

  //   // Sir updated 
  //   findOneById(id: string, relation: Relations = Relations.MIN) {
  //     let relations = this.getRelations(relation);
  //     return this.repo.findOne({ where: { id: id }, relations: relations });
  //   }



  //   getVirtualDeviceWithChildren(assetId?: string) {
  //     const fnName = 'getVirtualDeviceWithChildren()';
  //     this.logger.debug(fnName);

  //     if (assetId) {
  //       return this.repo.find({
  //         where: {
  //           assetId: assetId,
  //         },
  //         relations: { children: true }
  //       });
  //     }
  //     else {
  //       return this.repo.find({
  //         relations: { children: true }
  //       });
  //     }
  //   }

  //   async update(
  //     id: string,
  //     updateVirtualDeviceDto: UpdateVirtualDeviceDto,
  //     token: string,
  //   ) {
  //     const fnName = 'update()';
  //     this.logger.debug(
  //       `${fnName} : Input : Virtual device id : ${id}, updateVirtualDeviceDto : ${JSON.stringify(
  //         updateVirtualDeviceDto,
  //       )}`,
  //     );
  //     if (updateVirtualDeviceDto.id == null) {
  //       updateVirtualDeviceDto.id = id;
  //     } else if (updateVirtualDeviceDto.id !== id) {
  //       throw new Error(
  //         `updateVirtualDeviceDto.id : ${id} does not match with id : ${updateVirtualDeviceDto.id}`,
  //       );
  //     } else {
  //       if (
  //         updateVirtualDeviceDto.virtualDeviceGroups != null &&
  //         updateVirtualDeviceDto.virtualDeviceGroups.length > 0
  //       ) {
  //         const { virtualDeviceGroups, ...updateVirtualDeviceWithoutGroups } =
  //           updateVirtualDeviceDto;

  //         const result = await this.repo.update(
  //           id,
  //           updateVirtualDeviceWithoutGroups,
  //         );
  //         if (result.affected === 0) {
  //           throw new Error(`${NO_RECORD} : Virtual Device ${id} does not exist`);
  //         }
  //         const updateVirtualDeviceGroupURL = new URL(
  //           UPDATE_VIRTUAL_DEVICE_GROUP_FROM_VIRTUAL_DEVICE_URL,
  //           this.baseURL,
  //         );
  //         updateVirtualDeviceGroupURL.searchParams.append('virtualDeviceId', id);
  //         this.logger.debug(
  //           `updateVirtualDeviceGroupURL : ${updateVirtualDeviceGroupURL.href}`,
  //         );
  //         this.httpService.axiosRef.defaults.headers.common['Authorization'] =
  //           getTokenString(token);
  //         const virtualDeviceGroupURLResp = await firstValueFrom(
  //           this.httpService.patch<VirtualDeviceGroup[]>(
  //             updateVirtualDeviceGroupURL.href,
  //             virtualDeviceGroups,
  //           ),
  //         );
  //         throwErrIfSrvcRespFailure(virtualDeviceGroupURLResp);
  //         return updateVirtualDeviceDto;
  //       } else {
  //         const result = await this.repo.update(id, updateVirtualDeviceDto);
  //         if (result.affected === 0) {
  //           throw new Error(`${NO_RECORD} : Virtual Device ${id} does not exist`);
  //         } else {
  //           return updateVirtualDeviceDto;
  //         }
  //       }
  //     }
  //   }

  //   // attachEntireDevice(virtualDevice: VirtualDevice) {
  //   //   const fnName = 'attachEntireDevice()';
  //   //   this.logger.debug(`${fnName} : Input : ${JSON.stringify(virtualDevice)}`);
  //   //   return this.repo.save(virtualDevice);
  //   // }      

  //   // delete(id: string) {
  //   //   const msgTemplate = 'Delete ' + id;
  //   //   return deleteRec<VirtualDevice>(this.repo, id, msgTemplate);
  //   // }                

  //   // softDelete(id: string) {
  //   //   const msgTemplate = 'Soft delete ' + id;
  //   //   return softDelete<VirtualDevice>(this.repo, id, msgTemplate);
  //   // }   

  //   // restore(id: string) {
  //   //   const msgTemplate = 'Restore ' + id;
  //   //   return restore<VirtualDevice>(this.repo, id, msgTemplate);
  //   // }

  //   async attachDevice(token: string, updatedBy: string, id: string, deviceId: string, clientDeviceId: string, IMEI?: string, validateIMEI?: boolean, phoneNumber?: string) {
  //     const fnName = 'attachDevice()';
  //     const input = `${fnName} Input : Attach VirtualDeviceId : ${id} with Device where deviceId : ${deviceId}, clientDeviceId : ${clientDeviceId}, IMEI : ${IMEI}, validateIMEI : ${validateIMEI}, phoneNumber : ${phoneNumber}`;

  //     this.logger.debug(fnName + KEY_SEPARATOR + input);

  //     let virtualDevice = await this.findOneById(id, Relations.NONE);
  //     this.logger.debug(`${fnName} : Virtual Device is : ${JSON.stringify(virtualDevice)}`);

  //     if (virtualDevice == null) {
  //       this.logger.error(`${fnName} : ${NO_RECORD} : Virtual Device id : ${id} does not exist`);
  //       throw new Error(`${NO_RECORD}: Virtual Device id : ${id} does not exist`);
  //     }
  //     else if (virtualDevice.deviceId != null) {
  //       this.logger.error(`${fnName} : Virtual device id : ${id} already has a deviceId : ${virtualDevice.deviceId} attached`);
  //       throw new Error(`Virtual device id : ${id} already has a device attached`);
  //     }

  //     const device = {
  //       virtualDeviceId: id,
  //       clientDeviceId: clientDeviceId,
  //       IMEI: IMEI,
  //       validateIMEI: validateIMEI,
  //       phoneNumber: phoneNumber
  //     }

  //     // For Device Updation     
  //     const attachDeviceURL = new URL(
  //       ATTACH_DEVICE_URL,  //  ATTACH_DEVICE_URL = `${DEVICE_URL}/attach-virtualDevice`      //logic behind not using DEVICE_URL is in device's update service we've added check updateDTO should not contain deviceModelId and serialNo but here device object will have this both 
  //       this.baseURL
  //     );
  //     attachDeviceURL.searchParams.append('id', deviceId);
  //     this.logger.debug(
  //       `${fnName} : attachDeviceURL : ${attachDeviceURL.href}`
  //     );
  //     this.httpService.axiosRef.defaults.headers.common['Authorization'] = getTokenString(token);
  //     const updateDeviceURLResp = await firstValueFrom(
  //       this.httpService.patch(
  //         attachDeviceURL.href,
  //         device
  //       ),
  //     );
  //     throwErrIfSrvcRespFailure(updateDeviceURLResp);

  //     this.logger.debug(`${fnName} : Attached Device is : ${JSON.stringify(updateDeviceURLResp.data)}`);

  //     virtualDevice.deviceId = deviceId;
  //     virtualDevice.updatedBy = updatedBy;

  //     return await this.update(id, virtualDevice, token);
  //   }



  //   async detachDevice(token: string, updatedBy: string, id: string) {
  //     const fnName = 'detachDevice()';
  //     const input = `${fnName} Input : Detach Device from VirtualDeviceId : ${id}`;

  //     this.logger.debug(fnName + KEY_SEPARATOR + input);

  //     const virtualDevice = await this.findOneById(id, Relations.NONE);

  //     if (virtualDevice == null) {
  //       this.logger.error(`${fnName} : ${NO_RECORD} : Virtual Device id : ${id} does not exist`);
  //       throw new Error(`${NO_RECORD} : Virtual Device id : ${id} does not exist`);
  //     }
  //     else if (virtualDevice.deviceId == null) {
  //       this.logger.error(`${fnName} : Virtual Device id : ${id} is not attached to any device`);
  //       throw new Error(`Virtual Device id : ${id} not attached to any device`);
  //     }
  //     else {
  //       const device = {
  //         virtualDeviceId: null,
  //         clientDeviceId: null

  //         // new added 
  //         // device.IMEI = null;
  //         // device.validateIMEI = false;
  //         // device.phoneNumber = null;
  //       }
  //       const detachDeviceURL = new URL(
  //         DETACH_DEVICE_URL,      //  DETACH_DEVICE_URL = `${DEVICE_URL}/detach-virtualDevice`   
  //         this.baseURL
  //       );
  //       detachDeviceURL.searchParams.append('id', virtualDevice.deviceId);
  //       this.logger.debug(
  //         `${fnName} : detachDeviceURL : ${detachDeviceURL.href}`
  //       );
  //       this.httpService.axiosRef.defaults.headers.common['Authorization'] = getTokenString(token);
  //       const updateDeviceURLResp = await firstValueFrom(
  //         this.httpService.patch(
  //           detachDeviceURL.href,
  //           device,
  //         ),
  //       );
  //       throwErrIfSrvcRespFailure(updateDeviceURLResp);

  //       this.logger.debug(`${fnName} : Detached Device is : ${JSON.stringify(updateDeviceURLResp.data)}`);

  //       // VirtualDevice updation 
  //       virtualDevice.deviceId = null;
  //       virtualDevice.updatedBy = updatedBy;

  //       return await this.update(id, virtualDevice, token);
  //     }
  //   }


  //   // getRelations(relation: Relations) {
  //   //   let relations;
  //   //   switch (relation) {
  //   //     case Relations.NONE:
  //   //       relations = [];
  //   //       break;
  //   //     case Relations.MIN:
  //   //       relations = this.eagerRelations;
  //   //       break;
  //   //     case Relations.ALL:
  //   //       relations = this.combinedRelations;
  //   //       break;
  //   //     default:
  //   //       this.logger.error(`Invalid relation ${relation}`);
  //   //       break;
  //   //   }
  //   //   return relations;
  //   // }
  //   getRelations(relation: Relations) {
  //     let relations;
  //     switch (relation) {
  //       case Relations.NONE:
  //         relations = [];
  //         break;
  //       case Relations.MIN:
  //         relations = this.eagerRelations;
  //         break;
  //       case Relations.ALL:
  //         relations = this.combinedRelations;
  //         break;
  //       default:
  //         this.logger.error(`Invalid relation ${relation}`);
  //         break;
  //     }
  //     return relations;
  //   }
  //   // async attachDevice(id: string, deviceId: string, clientDeviceId: string) {
  //   //   const virtualDevice = await this.findOneById(id);

  //   //   if (virtualDevice == null) {
  //   //     throw new Error('Virtual device not found')
  //   //   }
  //   //   else if (virtualDevice.device != null) {
  //   //     throw new Error('Device already connected')
  //   //   }
  //   //   else {
  //   //     virtualDevice.deviceId = deviceId
  //   //     virtualDevice.updatedBy = id
  //   //   }

  //   //   const device = await this.deviceService.findOneById(deviceId)

  //   //   if (device == null) {
  //   //     throw new Error('Device not found')
  //   //   }
  //   //   else if (device.virtualDevice != null) {
  //   //     throw new Error('Device already connected to a virtual device')
  //   //   }
  //   //   else {
  //   //     device.clientDeviceId = clientDeviceId
  //   //     device.updatedBy = id
  //   //   }
  //   //   const savedVirtualDevice = await this.repo.save(virtualDevice)
  //   //   this.logger.debug(`Saved : ${JSON.stringify(savedVirtualDevice)}`)
  //   // }


  // virtual-device.service.ts


  // async findParentsNeedingAggregation() {
  //   return this.repo.find({ where: { needsAggregation: true } });
  // }

  // Atomic claim via repo.update with a compound where — succeeds only if the
  // flag was still true at the moment of the update. This is what prevents
  // lost updates (telemetry arriving mid-run) and double-processing.
  // async claimForAggregation(parentVirtualDeviceId: string) {
  //   const result = await this.repo.update(
  //     { id: parentVirtualDeviceId, needsAggregation: true },
  //     { needsAggregation: false },
  //   );
  //   return (result.affected ?? 0) > 0;
  // }

  // async markNeedsAggregation(parentVirtualDeviceId: string) {
  //   await this.repo.update({ id: parentVirtualDeviceId }, { needsAggregation: true });
  // }

  // async getChildren(parentVirtualDeviceId: string) {
  //   const parent = await this.repo.findOne({
  //     where: { id: parentVirtualDeviceId },
  //     relations: ['children'],
  //   });
  //   return parent?.children ?? [];
  // }


  async create(createVirtualDeviceDto: CreateVirtualDeviceDto, token: string) {
    const fnName = 'create()'
    const input = `Create object : ${JSON.stringify(createVirtualDeviceDto)}`

    this.logger.debug(fnName + KEY_SEPARATOR + input)

    let result = await this.repo.findOneBy({
      assetId: createVirtualDeviceDto.assetId,
      name: createVirtualDeviceDto.name,
    });
    if (result != null) {
      throw new Error(
        `${DUPLICATE_RECORD} : ${createVirtualDeviceDto.assetId}${KEY_SEPARATOR}${createVirtualDeviceDto.name} already exists`,
      );
    } else {
      if (
        createVirtualDeviceDto.virtualDeviceGroups == null ||
        createVirtualDeviceDto.virtualDeviceGroups.length == 0
      ) {
        const createVirtualDeviceObj = this.repo.create(createVirtualDeviceDto);
        return await this.repo.save(createVirtualDeviceObj);
      } else {
        const { virtualDeviceGroups, ...createVirtualDeviceWithoutGroups } =
          createVirtualDeviceDto;
        const createVirtualDeviceObj = this.repo.create(
          createVirtualDeviceWithoutGroups,
        );
        const createdVirtualDevice = await this.repo.save(
          createVirtualDeviceObj,
        );
        const virtualDeviceGroupURL = new URL(
          VIRTUAL_DEVICE_GROUP_URL,
          this.baseURL,
        );
        this.logger.debug(
          `virtualDeviceGroupURL : ${virtualDeviceGroupURL.href}`,
        );
        this.httpService.axiosRef.defaults.headers.common['Authorization'] =
          getTokenString(token);
        const createdVirtualDeviceGroups = [];
        for (const virtualDeviceGroup of virtualDeviceGroups) {
          virtualDeviceGroup.virtualDeviceId = createdVirtualDevice.id;
          this.logger.debug(
            `Virtual device group : ${JSON.stringify(virtualDeviceGroup)}`,
          );
          const virtualDeviceGroupURLResp = await firstValueFrom(
            this.httpService.post(
              virtualDeviceGroupURL.href,
              virtualDeviceGroup,
            ),
          );
          throwErrIfSrvcRespFailure(virtualDeviceGroupURLResp);
          createdVirtualDeviceGroups.push(virtualDeviceGroupURLResp.data);
        }
        createdVirtualDevice.virtualDeviceGroups = createdVirtualDeviceGroups;
        return createdVirtualDevice;
      }

      // const res = this.repo.create(createVirtualDeviceDto)
      // result = await this.repo.save(res)
      // this.logger.debug(`${fnName} : ${JSON.stringify(result)} created`);
      // return result;
    }
  }

  async findParentsNeedingAggregation(): Promise<VirtualDevice[]> {

    const fnName = this.findParentsNeedingAggregation.name;

    this.logger.debug(`${fnName} : Start`);

    const parents = await this.repo.find({
      where: {
        needsAggregation: true,
      },
    });

    this.logger.debug(
      `${fnName} : ${parents.length} parents found`,
    );

    return parents;

  }


  async getChildren(parentVirtualDeviceId: string) {

    // const treeRepo = this.repo.manager.getTreeRepository(VirtualDevice);

    const parent = await this.repo.findOne({
      // const parent = await treeRepo.findOne({
      where: { id: parentVirtualDeviceId },
    });

    if (!parent) {
      return [];
    }

    const descendants = await this.repo.findDescendants(parent);

    return descendants.filter(vd => vd.id !== parent.id);
  }

  async claimForAggregation(
    parentVirtualDeviceId: string,
  ) {

    const fnName = this.claimForAggregation.name;

    this.logger.debug(
      `${fnName} : ${parentVirtualDeviceId}`,
    );

    const result = await this.repo.update(
      {
        id: parentVirtualDeviceId,
        needsAggregation: true,
      },
      {
        needsAggregation: false,
      },
    );

    return (result.affected ?? 0) > 0;

  }

  async clearAggregationPending(
    parentVirtualDeviceId: string,
  ): Promise<void> {

    const fnName = 'clearAggregationPending()';

    this.logger.debug(
      `${fnName} : ${parentVirtualDeviceId}`,
    );

    await this.repo.update(
      {
        id: parentVirtualDeviceId,
      },
      {
        needsAggregation: false,
      },
    );
  }


  async markNeedsAggregationn(
    parentVirtualDeviceId: string,
  ): Promise<void> {

    const fnName = 'markNeedsAggregation()';

    this.logger.debug(
      `${fnName} : ${parentVirtualDeviceId}`,
    );

    await this.repo.update(
      {
        id: parentVirtualDeviceId,
      },
      {
        needsAggregation: true,
      },
    );

  }


  async findOne(options: any) {
    // return this.repo.findOne(options);
  }

  async find(options: any) {
    return this.repo.find(options);
  }

  private working = 4;
  // async findRecordSetC(recordSetA: any[]) {
  //   const recordSetC = [];

  //   const uniqueItems = _.uniqBy(
  //     recordSetA.map((record) => ({
  //       assetId: record.assetId,
  //       virtualDeviceId: record.virtualDeviceId,
  //     })),
  //     (item) => item.assetId + KEY_SEPARATOR + item.virtualDeviceId,
  //   );

  //   if (uniqueItems.length == 0) {
  //     return [];
  //   }

  //   const virtualDeviceIds = uniqueItems.map((item) => item.virtualDeviceId);

  //   // 1. Fetch all virtual devices
  //   const virtualDevices = await this.repo.find({
  //     where: {
  //       id: In(virtualDeviceIds),
  //     },
  //     relations: {
  //       parent: true,
  //     },
  //   });

  //   // 2. Fetch VD -> Group mapping
  //   const virtualDeviceGroups = await this.virtualDeviceGroupService.find({
  //     virtualDeviceId: In(virtualDeviceIds),
  //   });

  //   const groupIds = _.uniq(
  //     virtualDeviceGroups.map((vdGroup) => vdGroup.groupId),
  //   );

  //   // 3. Fetch Group -> MetricsAttributeAggregation mapping
  //   const groupMetricsAggRecords =
  //     await this.groupMetricsAttributeAggregationService.findAll({
  //       groupId: In(groupIds),
  //     });

  //   // 4. Group VD groups by VD id
  //   const vdGroupMap = _.groupBy(
  //     virtualDeviceGroups,
  //     (vdGroup) => vdGroup.virtualDeviceId,
  //   );

  //   // 5. Group metrics aggregation records by group id
  //   const groupMetricsAggMap = _.groupBy(
  //     groupMetricsAggRecords,
  //     (record) => record.groupId,
  //   );

  //   for (const virtualDevice of virtualDevices) {
  //     const descendants = await this.repo.findDescendants(virtualDevice);

  //     const childrenVDIDs = descendants
  //       .filter((vd: VirtualDevice) => vd.id !== virtualDevice.id)
  //       .map((vd: VirtualDevice) => vd.id);

  //     const vdGroups = vdGroupMap[virtualDevice.id] ?? [];

  //     for (const vdGroup of vdGroups) {
  //       const metricsAggregationRecords =
  //         groupMetricsAggMap[vdGroup.groupId] ?? [];

  //       recordSetC.push({
  //         assetId: virtualDevice.assetId,
  //         virtualDeviceId: virtualDevice.id,
  //         parentVirtualDeviceId:
  //           virtualDevice.parentId ?? virtualDevice.parent?.id ?? null,
  //         childrenVDIDs,
  //         groupId: vdGroup.groupId,
  //         metricsAggregationRecords,
  //       });
  //     }
  //   }
  //   return recordSetC;
  // }

  private may15LastWorking = 4;
  // async findRecordSetC(recordSetA: PeriodTelemetryPayloadAudit[]) {
  //   const uniqueItems = _.uniqBy(
  //     recordSetA.map((record) => ({
  //       assetId: record.assetId,
  //       virtualDeviceId:
  //         record.virtualDeviceId,
  //     })),
  //     (item) =>
  //       item.assetId +
  //       KEY_SEPARATOR +
  //       item.virtualDeviceId,
  //   );

  //   if (uniqueItems.length === 0) {
  //     return [];
  //   }

  //   const virtualDeviceIds = uniqueItems.map(
  //     (item) => item.virtualDeviceId,
  //   );

  //   // Fetch required virtual devices
  //   const virtualDevices =
  //     await this.repo.find({
  //       where: {
  //         id: In(virtualDeviceIds),
  //       },
  //       select: {
  //         id: true,
  //         assetId: true,
  //         parentId: true,
  //       },
  //       relations: {
  //         virtualDeviceGroups: true,
  //       },
  //     });

  //   // Fetch VD Groups
  //   // const virtualDeviceGroups =
  //   //   await this.virtualDeviceGroupService.find({
  //   //     virtualDeviceId: In(
  //   //       virtualDeviceIds,
  //   //     ),
  //   //   });

  //   // const groupIds = _.uniq(
  //   //   virtualDeviceGroups.map(
  //   //     (record) => record.groupId,
  //   //   ),
  //   // );

  //   const groupIds = _.uniq(
  //     virtualDevices.flatMap(
  //       (vd) =>
  //         vd.virtualDeviceGroups?.map(
  //           (group) => group.groupId,
  //         ) ?? [],
  //     ),
  //   );

  //   // Fetch Metrics Aggregations
  //   const metricsAggregationRecords =
  //     await this.groupMetricsAttributeAggregationService.findAll(
  //       {
  //         groupId: In(groupIds),
  //       },
  //     );

  //   // // Maps 
  //   // const vdGroupMap = _.groupBy(
  //   //   virtualDeviceGroups,
  //   //   (record) => record.virtualDeviceId,
  //   // );

  //   // const metricsAggMap = _.groupBy(
  //   //   metricsAggregationRecords,
  //   //   (record) => record.groupId,
  //   // );

  //   // Metrics Aggregation Map

  //   const metricsAggMap = _.groupBy(
  //     metricsAggregationRecords,
  //     (record) => record.groupId,
  //   );

  //   // Prepare Record Set C
  //   const recordSetC = [];

  //   for (const vd of virtualDevices) {
  //     const children =
  //       await this.repo.findDescendants(
  //         vd,
  //       );

  //     const childrenVDIDs = children
  //       .filter(
  //         (child) => child.id !== vd.id,
  //       )
  //       .map((child) => child.id);

  //     const vdGroups = vd.virtualDeviceGroups ?? [];

  //     for (const vdGroup of vdGroups) {
  //       recordSetC.push({
  //         assetId: vd.assetId,

  //         virtualDeviceId: vd.id,

  //         parentVirtualDeviceId: vd.parentId ?? null,

  //         childrenVDIDs,

  //         groupId: vdGroup.groupId,

  //         metricsAggregationRecords:
  //           metricsAggMap[
  //           vdGroup.groupId
  //           ] ?? [],
  //       });
  //     }
  //   }

  //   return recordSetC;
  // }







  private sirShownCorrect = 5;
  async findRecordSetC(
    recordSetA: PeriodTelemetryPayloadAudit[],
  ) {
    const uniqueVDIds = _.uniq(
      recordSetA.map(
        (record) => record.virtualDeviceId,
      ),
    );

    if (!uniqueVDIds.length) {
      return [];
    }

    const childVDs = await this.repo.find({
      where: {
        id: In(uniqueVDIds),
      },
      select: {
        id: true,
        assetId: true,
        parentId: true,
      },
    });

    const parentVDIds = _.uniq(
      childVDs
        .map((vd) => vd.parentId)
        .filter(Boolean),
    );

    if (!parentVDIds.length) {

      this.logger.debug(
        'No parent VDs found for given child VDs',
      );

      return [];
    }

    const parentVDs = await this.repo.find({
      where: {
        id: In(parentVDIds),
      },
      select: {
        id: true,
        assetId: true,
        // parentId: true,
      },
      relations: {
        children: true,
        virtualDeviceGroups: true,
      },
    });

    const groupIds = _.uniq(
      parentVDs.flatMap(
        (parentVD) =>
          parentVD.virtualDeviceGroups?.map(
            (group) => group.groupId,
          ) ?? [],
      ),
    );

    if (!groupIds.length) {

      this.logger.debug(
        'No groups found for parent VDs',
      );

      return [];
    }

    /**
     * Fetch Group -> Aggregation mappings
     * WITH actual MetricsAttributeAggregation relation
     */
    const groupMetricsAggregationRecords =
      await this.groupMetricsAttributeAggregationService.findAll(
        {
          groupId: In(groupIds),
        },
      );

    /**
     * Convert:
     * GroupMetricsAttributeAggregation[]
     * =>
     * MetricsAttributeAggregation[]
     */
    const metricsAggMap = _.groupBy(
      groupMetricsAggregationRecords.map(
        (record) => ({
          groupId: record.groupId,
          metricsAttributeAggregation: record.metricsAttributeAggregation,
        }),
      ),
      (record) => record.groupId,
    );

    const recordSetC = [];

    for (const parentVD of parentVDs) {
      // Direct children under parent
      const childrenVDIDs =
        parentVD.children?.map(
          (child) => child.id,
        ) ?? [];

      const vdGroups =
        parentVD.virtualDeviceGroups ?? [];

      for (const vdGroup of vdGroups) {
        const metricsAggregationRecords =
          (
            metricsAggMap[
            vdGroup.groupId
            ] ?? []
          ).map(
            (record) =>
              record.metricsAttributeAggregation,
          );

        recordSetC.push({
          assetId: parentVD.assetId,
          virtualDeviceId: parentVD.id,
          // parentVirtualDeviceId: parentVD.parentId ?? null,
          childrenVDIDs,
          groupId: vdGroup.groupId,
          metricsAggregationRecords,
        });
      }
    }

    return recordSetC;
  }


  async findParentVirtualDevicess(
    recordSetA: PeriodTelemetryPayloadAudit[],
  ) {
    const uniqueVDIds = _.uniq(
      recordSetA.map(
        (record) => record.virtualDeviceId,
      ),
    );

    if (!uniqueVDIds.length) {
      return [];
    }

    const childVDs = await this.repo.find({
      where: {
        id: In(uniqueVDIds),
      },
      select: {
        id: true,
        assetId: true,
        parentId: true,
      },
    });

    const parentVDIds = _.uniq(
      childVDs
        .map((vd) => vd.parentId)
        .filter(Boolean),
    );

    if (!parentVDIds.length) {

      this.logger.debug(
        'No parent VDs found for given child VDs',
      );

      return [];
    }

    const parentVDs = await this.repo.find({
      where: {
        id: In(parentVDIds),
      },
      select: {
        id: true,
        assetId: true,
      },
      relations: {
        children: true,
        // virtualDeviceGroups: true,
        virtualDeviceGroups: {
          group: {
            groupMetricsAttributeAggregations: {
              metricsAttributeAggregation: true,
            },
          },
        },
      },
    });

    return parentVDs;
  }


  async findParentVirtualDevicesCorrect(
    recordSetA: Record<string, PeriodTelemetryPayloadAudit[]>,
  ) {
    const flattenedRecords = Object.values(recordSetA).flat();

    const uniqueVDIds = _.uniq(
      flattenedRecords.map(
        (record) => record.virtualDeviceId,
      ),
    );

    if (!uniqueVDIds.length) {
      return [];
    }

    const virtualDevices = await this.repo.find({
      where: {
        id: In(uniqueVDIds),
      },
      select: {
        id: true,
        assetId: true,
        parentId: true,
      },
    });

    const parentVDIds = _.uniq(
      virtualDevices
        .map((vd) => vd.parentId)
        .filter(Boolean),
    );

    if (parentVDIds.length == 0) {
      this.logger.debug(
        'No parent VDs found for given child VDs',
      );
      return [];
    }

    return this.repo.find({
      where: {
        id: In(parentVDIds),
      },
      select: {
        id: true,
        assetId: true,
      },
      relations: {
        children: true,
        virtualDeviceGroups: {
          group: {
            groupMetricsAttributeAggregations: {
              metricsAttributeAggregation: true,
            },
          },
        },
      },
    });
  }


  async findParentVirtualDevices(
    periodTMPylds: Record<string, PeriodTelemetryPayloadAudit[]>,
  ) {
    const flattenedRecords = Object.values(periodTMPylds).flat();

    const uniqueVDIds = _.uniq(
      flattenedRecords.map(
        (record) => record.virtualDeviceId,
      ),
    );

    if (uniqueVDIds.length == 0) {
      this.logger.debug(
        'No virtual device IDs found in recordSetA',
      );
      return [];
    }

    const virtualDevices = await this.repo.find({
      where: {
        id: In(uniqueVDIds),
      },
      select: {
        id: true,
        parentId: true,
      },
    });

    const parentVDIds = _.uniq(
      virtualDevices
        .map((vd) => vd.parentId)
        .filter(Boolean),
    );

    if (parentVDIds.length == 0) {
      this.logger.debug(`No parent virtual devices`);
      return [];
    }

    return this.repo.find({
      where: {
        id: In(parentVDIds),
      },
      select: {
        id: true,
        assetId: true,
        children: {
          id: true,
        },
        virtualDeviceGroups: {
          groupId: true,
          group: {
            id: true,
            groupMetricsAttributeAggregations: {
              groupId: true,
              metricsAttributeAggregation: {
                id: true,
                aggregation: true,
                metricsAttributeId: true,
              },
            },
          },
        },
      },
      relations: {
        children: true,
        virtualDeviceGroups: {
          group: {
            groupMetricsAttributeAggregations: {
              metricsAttributeAggregation: true,
            },
          },
        },
      },
    });
  }

  // async findRecordSetC(
  //   recordSetA: PeriodTelemetryPayloadAudit[],
  // ) {

  //   const uniqueItems = _.uniqBy(
  //     recordSetA.map((record) => ({
  //       assetId: record.assetId,
  //       virtualDeviceId:
  //         record.virtualDeviceId,
  //     })),
  //     (item) =>
  //       item.assetId +
  //       KEY_SEPARATOR +
  //       item.virtualDeviceId,
  //   );

  //   if (!uniqueItems.length) {
  //     return [];
  //   }

  //   const virtualDeviceIds = uniqueItems.map(
  //     (item) => item.virtualDeviceId,
  //   );

  //   /**
  //    * Fetch child VDs
  //    */
  //   const virtualDevices =
  //     await this.repo.find({
  //       where: {
  //         id: In(virtualDeviceIds),
  //       },
  //       select: {
  //         id: true,
  //         assetId: true,
  //         parentId: true,
  //       },
  //     });

  //   /**
  //    * Parent VD IDs
  //    */
  //   const parentVDIds = _.uniq(
  //     virtualDevices
  //       .map((vd) => vd.parentId)
  //       .filter(Boolean),
  //   );

  //   if (parentVDIds.length == 0) {
  //     this.logger.debug('No parent VDs found for the given child VDs');
  //     return [];
  //   }

  //   const parentVirtualDevices =
  //     await this.repo.find({
  //       where: {
  //         id: In(parentVDIds),
  //       },
  //       select: {
  //         id: true,
  //         assetId: true,
  //         parentId: true,
  //       },
  //       relations: {
  //         virtualDeviceGroups: true,
  //         children: true,
  //       },
  //     });

  //   /**
  //    * Fetch all group IDs
  //    */
  //   const groupIds = _.uniq(
  //     parentVirtualDevices.flatMap(
  //       (parentVD) =>
  //         parentVD.virtualDeviceGroups?.map(
  //           (group) => group.groupId,
  //         ) ?? [],
  //     ),
  //   );

  //   /**
  //    * Fetch metrics aggregation configs
  //    */
  //   const metricsAggregationRecords =
  //     await this.groupMetricsAttributeAggregationService.findAll(
  //       {
  //         groupId: In(groupIds),
  //       },
  //     );

  //   /**
  //    * Group aggregation configs by groupId
  //    */
  //   const metricsAggMap = _.groupBy(
  //     metricsAggregationRecords,
  //     (record) => record.groupId,
  //   );

  //   /**
  //    * Prepare Record Set C
  //    */
  //   const recordSetC = [];

  //   for (const parentVD of parentVirtualDevices) {

  //     /**
  //      * All child VD IDs under parent
  //      */
  //     const childrenVDIDs =
  //       parentVD.children?.map(
  //         (child) => child.id,
  //       ) ?? [];

  //     /**
  //      * Parent groups
  //      */
  //     const vdGroups =
  //       parentVD.virtualDeviceGroups ?? [];

  //     for (const vdGroup of vdGroups) {

  //       recordSetC.push({

  //         assetId: parentVD.assetId,

  //         /**
  //          * Aggregation target VD
  //          */
  //         virtualDeviceId:
  //           parentVD.id,

  //         /**
  //          * Parent of aggregation node
  //          */
  //         parentVirtualDeviceId:
  //           parentVD.parentId ?? null,

  //         /**
  //          * Child VDs participating
  //          */
  //         childrenVDIDs,

  //         /**
  //          * Aggregation group
  //          */
  //         groupId: vdGroup.groupId,

  //         /**
  //          * Aggregation configs
  //          */
  //         metricsAggregationRecords:
  //           metricsAggMap[
  //           vdGroup.groupId
  //           ] ?? [],
  //       });
  //     }
  //   }

  //   return recordSetC;
  // }







  async findPendingParents(): Promise<VirtualDevice[]> {
    return this.repo.find({
      where: {
        needsAggregation: true,
        // aggregationInProgress: false,
      },
    });
  }


  async claimPendingParents(): Promise<VirtualDevice[]> {
    const parents = await this.findPendingParents();

    if (!parents.length) {
      return [];
    }

    await this.repo.update(
      {
        id: In(parents.map(parent => parent.id)),
      },
      {
        // aggregationInProgress: true,
      },
    );

    return parents;
  }


  async findParentVdForAggr(
    uniqueVDIds: string[]
  ) {

    if (uniqueVDIds.length == 0) {
      this.logger.debug(
        'No virtual device IDs found',
      );
      return [];
    }

    const virtualDevices = await this.repo.find({
      where: {
        id: In(uniqueVDIds),
      },
      select: {
        id: true,
        parentId: true,
      },
    });

    const parentVDIds = _.uniq(
      virtualDevices
        .map((vd) => vd.parentId)
        .filter(Boolean),
    );

    if (parentVDIds.length == 0) {
      this.logger.debug(`No parent virtual devices`);
      return [];
    }

    return this.repo.find({
      where: {
        id: In(parentVDIds),
      },
      select: {
        id: true,
        assetId: true,
        children: {
          id: true,
        },
        virtualDeviceGroups: {
          groupId: true,
          group: {
            id: true,
            groupMetricsAttributeAggregations: {
              groupId: true,
              metricsAttributeAggregation: {
                id: true,
                aggregation: true,
                metricsAttributeId: true,
              },
            },
          },
        },
      },
      relations: {
        children: true,
        virtualDeviceGroups: {
          group: {
            groupMetricsAttributeAggregations: {
              metricsAttributeAggregation: true,
            },
          },
        },
      },
    });
  }

  async findParentVds(virtualDeviceIds: string[]) {
    if (virtualDeviceIds.length == 0) {
      this.logger.debug(
        'No vitualDeviceids found',
      );
      return [];
    }

    const virtualDevices = await this.repo.find({
      where: {
        id: In(virtualDeviceIds),
      },
      select: {
        id: true,
        parentId: true,
      },
    });

    const parentVDIds = _.uniq(
      virtualDevices
        .map((vd) => vd.parentId)
        .filter(Boolean),
    );
    // 
    return parentVDIds;
  }

  async markVdNeedsAggregation(virtualDeviceIds: string[]) {
    if (!virtualDeviceIds.length) {
      this.logger.error(`VirtualDeviceIDs not found`);
      return;
    }

    // const parentIds = (await this.findParentVdForAggr(virtualDeviceIds)).map(vd => vd.id);
    const parentIds = await this.findParentVds(virtualDeviceIds);

    await this.repo.update(
      {
        id: In(parentIds),
      },
      {
        needsAggregation: true,
        aggregationStatus: aggregationStatus.pending
      },
    );
  }

  findChildrenFromCSVParentIDs(csvParentVirtualIDs: string) {
    this.logger.debug(`csvParentVirtualIDs : ${csvParentVirtualIDs}`);
    return this.repo.find({
      where: {
        id: In(csvParentVirtualIDs.split(',')),
      },
      relations: {
        children: true,
      },
    });
  }

  findVirtualDeviceNeedsAggregation() {
    return this.repo.find({
      where: {
        needsAggregation: true,
        aggregationStatus: aggregationStatus.pending,
      },
      select: {
        id: true,
        assetId: true,
        deviceId: true,
        children: {
          id: true,
        },
        virtualDeviceGroups: {
          groupId: true,
          group: {
            id: true,
            groupMetricsAttributeAggregations: {
              groupId: true,
              metricsAttributeAggregation: {
                id: true,
                aggregation: true,
                aggStrategy: true,
                metricsAttributeId: true,
              },
            },
          },
        },
      },
      relations: {
        children: true,
        virtualDeviceGroups: {
          group: {
            groupMetricsAttributeAggregations: {
              metricsAttributeAggregation: true,
            },
          },
        },
      },
    })
  }

  async markAggregationProcessing(
    virtualDeviceId: string,
  ) {
    return this.repo.update(
      {
        id: virtualDeviceId,
        needsAggregation: true,
        aggregationStatus: aggregationStatus.pending,
      },
      {
        aggregationStatus: aggregationStatus.processing,
      },
    );
  }

  async markAggregationPending(
    virtualDeviceId: string,
  ) {
    return this.repo.update(
      {
        id: virtualDeviceId,
      },
      {
        needsAggregation: true,
        aggregationStatus: aggregationStatus.pending,
      },
    );
  }

  async markAggregationCompleted(
    virtualDeviceId: string,
  ) {
    return this.repo.update(
      {
        id: virtualDeviceId,
      },
      {
        needsAggregation: false,
        aggregationStatus: aggregationStatus.completed,
      },
    );
  }







  async markAggregationCompletedd(parentIds: string[]) {
    if (!parentIds.length) {
      return;
    }

    await this.repo.update(
      {
        id: In(parentIds),
      },
      {
        needsAggregation: false,
        // aggregationInProgress: false,
        lastAggregationAt: new Date(),
      },
    );
  }

  async markAggregationFailed(parentIds: string[]) {
    if (!parentIds.length) {
      return;
    }

    await this.repo.update(
      {
        id: In(parentIds),
      },
      {
        // aggregationInProgress: false,
      },
    );
  }


  async findChildren(parentIds: string[]) {
    if (!parentIds.length) {
      return [];
    }

    return this.repo.find({
      where: {
        parentId: In(parentIds),
      },
    });
  }


  async findParentsByChildIds(
    childIds: string[],
  ): Promise<VirtualDevice[]> {
    if (!childIds.length) {
      return [];
    }

    const children = await this.repo.find({
      where: {
        id: In(childIds),
      },
    });

    const parentIds = [
      ...new Set(
        children
          .map(child => child.parentId)
          .filter(Boolean),
      ),
    ];

    if (!parentIds.length) {
      return [];
    }

    return this.repo.find({
      where: {
        id: In(parentIds),
      },
    });
  }










  // private isAggregationCycleInProgress = false;
  // private readonly AGGREGATION_BATCH_SIZE = 50;

  // async runVirtualDeviceGroupAggregationCycle(): Promise<void> {
  //   if (this.isAggregationCycleInProgress) {
  //     this.logger.warn('Previous aggregation cycle still running — skipping this tick');
  //     return;
  //   }
  //   this.isAggregationCycleInProgress = true;
  //   let totalProcessed = 0;

  //   try {
  //     let pendingDevices: VirtualDevice[];
  //     do {
  //       pendingDevices = await this.claimVirtualDevicesPendingAggregation(this.AGGREGATION_BATCH_SIZE);
  //       if (pendingDevices.length === 0) break;

  //       for (const parentDevice of pendingDevices) {
  //         try {
  //           await this.aggregateChildTelemetryForParentDevice(parentDevice.id);
  //           totalProcessed++;
  //         } catch (err) {
  //           this.logger.error(
  //             `Aggregation failed for VD ${parentDevice.id}: ${err.message}`,
  //             err.stack,
  //           );
  //           await this.restoreAggregationPendingFlag(parentDevice.id);
  //         }
  //       }
  //     } while (pendingDevices.length === this.AGGREGATION_BATCH_SIZE);

  //     if (totalProcessed > 0) {
  //       this.logger.debug(`Aggregation cycle done — processed ${totalProcessed} parent VD(s).`);
  //     }
  //   } finally {
  //     this.isAggregationCycleInProgress = false;
  //   }
  // }

  // /** Atomically claims a batch of parent VDs flagged for aggregation, using
  //  * SKIP LOCKED — safe across overlapping cron ticks and multiple app instances. */
  // private async claimVirtualDevicesPendingAggregation(batchSize: number): Promise<VirtualDevice[]> {
  //   return this.dataSource.transaction(async (manager) => {
  //     const repo = manager.getRepository(VirtualDevice);

  //     const pendingDevices = await repo.find({
  //       where: { needsAggregation: true },
  //       order: { id: 'ASC' },
  //       take: batchSize,
  //       lock: { mode: 'pessimistic_write', onLocked: 'skip_locked' },
  //     });

  //     if (pendingDevices.length === 0) return [];

  //     await repo.update(
  //       { id: In(pendingDevices.map((vd) => vd.id)) },
  //       { needsAggregation: false },
  //     );

  //     return pendingDevices;
  //   });
  // }


  // private async restoreAggregationPendingFlag(virtualDeviceId: string): Promise<void> {
  //   await this.repo.update(
  //     { id: virtualDeviceId },
  //     { needsAggregation: true },
  //   );
  // }

  // /** Marks a parent VD as pending aggregation. Call this from your
  //  * ingestion pipeline right after a child inverter's CurrentTelemetryPayload
  //  * is written — ideally passing the same transaction manager as that write. */
  // async flagParentVirtualDeviceForAggregation(
  //   childVirtualDeviceId: string,
  //   manager?: EntityManager,
  // ): Promise<void> {
  //   const repo = manager ? manager.getRepository(VirtualDevice) : this.repo;

  //   const childDevice = await repo.findOne({
  //     where: { id: childVirtualDeviceId },
  //     relations: ['parent'],
  //   });

  //   if (childDevice?.parent?.id) {
  //     await repo.update({ id: childDevice.parent.id }, { needsAggregation: true });
  //   }
  // }

  // /** Aggregates all child VDs' current telemetry into the parent VD,
  //  * per the group aggregation rules configured for that parent. */
  // private async aggregateChildTelemetryForParentDevice(parentDeviceId: string): Promise<void> {
  //   const parentDevice = await this.repo.findOne({
  //     where: { id: parentDeviceId },
  //     relations: ['children'],
  //   });

  //   if (!parentDevice) {
  //     this.logger.warn(`Parent VD ${parentDeviceId} not found — likely deleted, skipping`);
  //     return;
  //   }
  //   if (!parentDevice.children?.length) return;

  //   const childDeviceIds = parentDevice.children.map((c) => c.id);

  //   const groupIds = await this.virtualDeviceGroupService.getGroupIdsForVirtualDevice(parentDeviceId);
  //   if (groupIds.length === 0) return;

  //   const aggregationRules = await this.groupMetricsAttributeAggregationService.getAggregationRulesForGroups(groupIds);
  //   if (aggregationRules.length === 0) return;

  //   const childTelemetryPayloads = await this.current.find({
  //     where: { virtualDeviceId: In(childDeviceIds) },
  //   });
  //   if (childTelemetryPayloads.length === 0) return;

  //   const aggregatedValuesByAttribute = computeGroupAggregations(childTelemetryPayloads, aggregationRules);
  //   if (aggregatedValuesByAttribute.size === 0) return;

  //   await this.saveAggregatedTelemetryForVirtualDevice(parentDeviceId, aggregatedValuesByAttribute);
  // }

  // /** Upserts the parent VD's CurrentTelemetryPayload and appends a
  //  * TelemetryPayload history record, per aggregated metric attribute. */
  // private async saveAggregatedTelemetryForVirtualDevice(
  //   virtualDeviceId: string,
  //   aggregatedValuesByAttribute: Map<string, number>,
  // ): Promise<void> {
  //   await this.dataSource.transaction(async (manager) => {
  //     const currentTelemetryRepo = manager.getRepository(CurrentTelemetryPayload);
  //     const telemetryHistoryRepo = manager.getRepository(TelemetryPayload);
  //     const now = new Date();

  //     for (const [metricsAttributeId, aggregatedValue] of aggregatedValuesByAttribute.entries()) {
  //       const existingPayload = await currentTelemetryRepo.findOne({
  //         where: { virtualDeviceId, metricsAttributeId },
  //       });

  //       if (existingPayload) {
  //         await currentTelemetryRepo.update(
  //           { virtualDeviceId, metricsAttributeId },
  //           { value: aggregatedValue, timestamp: now } as any,
  //         );
  //       } else {
  //         await currentTelemetryRepo.save(
  //           currentTelemetryRepo.create({
  //             virtualDeviceId,
  //             metricsAttributeId,
  //             value: aggregatedValue,
  //             timestamp: now,
  //           } as any),
  //         );
  //       }

  //       await telemetryHistoryRepo.save(
  //         telemetryHistoryRepo.create({
  //           virtualDeviceId,
  //           metricsAttributeId,
  //           value: aggregatedValue,
  //           timestamp: now,
  //         } as any),
  //       );
  //     }
  //   });
  // }

}


