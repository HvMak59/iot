import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { winstonServerLogger } from 'app_config/serverWinston.config';
import { In, Repository } from 'typeorm';
// import {
//   deleteRec,
//   findAll,
//   restore,
//   softDelete,
// } from 'utils/cmnFn.repository';
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
// } from 'app_config/constants';
// import { DUPLICATE_RECORD, KEY_SEPARATOR, NO_RECORD } from 'src/app_config/constants';
import { HttpService } from '@nestjs/axios';
// import { getTokenString, throwErrIfSrvcRespFailure } from 'utils/others';
import { firstValueFrom } from 'rxjs';
// import { winstonServerLogger } from 'src/app_config/serverWinston.config (1)';
import { Device } from 'src/device/entities/device.entity';
import { DeviceService } from 'src/device/device.service';
import { ATTACH_DEVICE_URL, DETACH_DEVICE_URL, DEVICE_URL, DUPLICATE_RECORD, KEY_SEPARATOR, NO_RECORD, UPDATE_VIRTUAL_DEVICE_GROUP_FROM_VIRTUAL_DEVICE_URL, VIRTUAL_DEVICE_GROUP_URL, VIRTUAL_DEVICE_URL } from 'src/app_config/constants';
import { getTokenString, throwErrIfSrvcRespFailure } from 'src/utils/others';
import { VirtualDeviceGroup } from 'src/virtual-device-group/entities/virtual-device-group.entity';
import { Response } from 'express';
import { Relations } from 'src/utils/enums';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import { DeviceService } from 'src/device/device.service';
// import { Device } from 'src/device/entities/device.entity';
// import { DeviceModel } from 'src/device-model/entities/device-model.entity';
// import { VirtualDeviceGroup } from 'src/virtual-device-group/entities/virtual-device-group.entity';
// import { Relations } from 'utils/enums';


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
    @InjectRepository(VirtualDevice) private readonly repo: Repository<VirtualDevice>,
    private readonly deviceService: DeviceService,
    private readonly httpService: HttpService,
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

  //   // findChildrenFromCSVParentIDs(csvParentVirtualIDs: string) {
  //   //   this.logger.debug(`csvParentVirtualIDs : ${csvParentVirtualIDs}`);
  //   //   return this.repo.find({
  //   //     where: {
  //   //       id: In(csvParentVirtualIDs.split(',')),
  //   //     },
  //   //     relations: {
  //   //       children: true,
  //   //     },
  //   //   });
  //   // }

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

  async findOne(options: any) {
    return this.repo.findOne(options);
  }

  async find(options: any) {
    return this.repo.find(options);
  }

}

