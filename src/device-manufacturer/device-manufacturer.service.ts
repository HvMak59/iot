import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
// import {
//   findAll,
//   deleteRec,
//   softDelete,
//   restore,
//   findOne,
// } from '../../utils/cmnFn.repository';

// import serviceConfig from '../../app_config/service.config.json';

import { DeviceManufacturer } from '../device-manufacturer/entities/device-manufacturer.entity';
import { CreateDeviceManufacturerDto } from './dto/create-device-manufacturer.dto';
import { UpdateDeviceManufacturerDto } from './dto/update-device-manufacturer.dto';
import { FindDeviceManufacturerDto } from './dto/find-device-manufacturer.dto';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { DUPLICATE_RECORD, NO_RECORD } from 'src/app_config/constants';

@Injectable()
export class DeviceManufacturerService {
  private readonly logger = winstonServerLogger(DeviceManufacturerService.name);
  constructor(
    @InjectRepository(DeviceManufacturer)
    private readonly repo: Repository<DeviceManufacturer>,
  ) { }

  async create(createDeviceManufacturerDto: CreateDeviceManufacturerDto) {
    const result = await this.repo.findOneBy({
      name: createDeviceManufacturerDto.name,
    });
    if (result != null) {
      throw new Error(
        `${DUPLICATE_RECORD} : Device manufacturer id ${createDeviceManufacturerDto.id} already exists`,
      );
    } else {
      const deviceManufacturer = this.repo.create(createDeviceManufacturerDto);
      return await this.repo.save(deviceManufacturer);
    }
  }

  // findAll(
  //   searchCriteria: FindDeviceManufacturerDto,
  //   relationsRequired: boolean = false,
  // ) {
  //   const fnName = 'findAll()';
  //   let relations = relationsRequired
  //     ? serviceConfig.deviceManufacturer.relations
  //     : [];
  //   return findAll<DeviceManufacturer>(
  //     this.repo,
  //     fnName,
  //     relations,
  //     searchCriteria,
  //   );
  // }

  // findAllWthRelations() {
  //   const fnName = 'findAllWthRelations()';
  //   return findAll<DeviceManufacturer>(
  //     this.repo,
  //     fnName,
  //     serviceConfig.deviceType.relations,
  //   );
  // }

  // async findOneById(id: string) {
  //   const fnName = 'findOneById()';
  //   return findOne<DeviceManufacturer>(this.repo, id, fnName, 'asset-type');
  // }

  // async findOneByIdWthRelations(id: string) {
  //   const fnName = 'findOneByIdWthRelations()';
  //   return findOne<DeviceManufacturer>(
  //     this.repo,
  //     id,
  //     fnName,
  //     'asset-type',
  //     'asset',
  //   );
  // }

  // async update(
  //   id: string,
  //   updateDeviceManufacturerDto: UpdateDeviceManufacturerDto,
  // ) {
  //   if (updateDeviceManufacturerDto.id == null) {
  //     updateDeviceManufacturerDto.id = id;
  //   } else if (updateDeviceManufacturerDto.id != id) {
  //     throw new Error(
  //       `Input id ${id} and Update Device Manufacturer id ${updateDeviceManufacturerDto.id} are not same`,
  //     );
  //   }
  //   const mergedDeviceManufacturer = await this.repo.preload(
  //     updateDeviceManufacturerDto,
  //   );
  //   if (mergedDeviceManufacturer == null) {
  //     throw new Error(`Device Manufacturer id ${id} not found`);
  //   } else {
  //     return await this.repo.save(mergedDeviceManufacturer);
  //   }
  // }

  // delete(id: string) {
  //   const fnName = 'delete()';
  //   return deleteRec<DeviceManufacturer>(this.repo, id, fnName);
  // }

  // softDelete(id: string) {
  //   const fnName = 'softDelete()';
  //   return softDelete<DeviceManufacturer>(this.repo, id, fnName);
  // }

  // restore(id: string) {
  //   const fnName = 'restore()';
  //   return restore<DeviceManufacturer>(this.repo, id, fnName);
  // }
}
