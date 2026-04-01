import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import {
//   findAll,
//   deleteRec,
//   softDelete,
//   restore,
// } from '../../utils/cmnFn.repository';

// import serviceConfig from '../../app_config/service.config.json';

import { DeviceType } from '../device-type/entities/device-type.entity';
import { CreateDeviceTypeDto } from './dto/create-device-type.dto';
import { UpdateDeviceTypeDto } from './dto/update-device-type.dto';
import { FindDeviceTypeDto } from './dto/find-device-type.dto';
import {
  DUPLICATE_RECORD,
  KEY_SEPARATOR,
  NO_RECORD,
} from 'src/app_config/constants';

@Injectable()
export class DeviceTypeService {
  // private serviceName = serviceConfig.deviceType.serviceName;
  constructor(
    @InjectRepository(DeviceType) private readonly repo: Repository<DeviceType>,
  ) { }

  async create(createDeviceTypeDto: CreateDeviceTypeDto) {
    const result = await this.repo.findOneBy({
      id: createDeviceTypeDto.id,
    });
    if (result) {
      throw new Error(
        `${DUPLICATE_RECORD} ${KEY_SEPARATOR} ${createDeviceTypeDto.id} already exists`,
      ); //.json(org);
    } else {
      const deviceType = this.repo.create(createDeviceTypeDto);
      return await this.repo.save(deviceType);
    }
  }

  // findAll(
  //   searchCriteria: FindDeviceTypeDto,
  //   relationsRequired: boolean = false,
  // ) {
  //   const msgTemplate = 'Find ' + this.serviceName + 's';
  //   let relations = relationsRequired ? serviceConfig.deviceType.relations : [];
  //   return findAll<DeviceType>(
  //     this.repo,
  //     msgTemplate,
  //     relations,
  //     searchCriteria,
  //   );
  // }

  // /* findAllWthRelations() {
  //   const msgTemplate = "Find " + this.serviceName + "s" + " with relations";
  //   return findAll<DeviceType>(this.repo, msgTemplate, serviceConfig.deviceType.relations);
  // } */

  // findOneById(id: string) {
  //   return this.repo.findOne({ where: { id: id } });
  // }

  // async findOneByIdWthRelations(id: string) {
  //   return this.repo.findOne({
  //     where: {
  //       id: id,
  //     },
  //     relations: serviceConfig.deviceType.relations,
  //   });
  // }

  // async update(id: string, updateDeviceTypeDto: UpdateDeviceTypeDto) {
  //   const fnName = 'update()';
  //   const input = `Update Object : ${JSON.stringify(updateDeviceTypeDto)}`;
  //   if (updateDeviceTypeDto.id == null) {
  //     updateDeviceTypeDto.id = id;
  //   } else if (updateDeviceTypeDto.id != id) {
  //     throw new Error(
  //       'DeviceType Id and update DeviceType object ID do not match ',
  //     );
  //   }
  //   const mergedDeviceType = await this.repo.preload(updateDeviceTypeDto);
  //   if (mergedDeviceType == null) {
  //     throw new Error(`${NO_RECORD} : DeviceType id : ${id} not found`);
  //   } else {
  //     return await this.repo.save(mergedDeviceType);
  //   }
  // }

  // delete(id: string) {
  //   const msgTemplate = 'Delete ' + this.serviceName;
  //   return deleteRec<DeviceType>(this.repo, id, msgTemplate);
  // }

  // softDelete(id: string) {
  //   const msgTemplate = 'Soft delete ' + this.serviceName;
  //   return softDelete<DeviceType>(this.repo, id, msgTemplate);
  // }

  // restore(id: string) {
  //   const msgTemplate = 'Restore ' + this.serviceName;
  //   return restore<DeviceType>(this.repo, id, msgTemplate);
  // }
}
