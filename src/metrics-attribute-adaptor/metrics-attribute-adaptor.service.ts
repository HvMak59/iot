import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
// import { CreateMetricsAttributeAdaptorDto } from './dto/create-metrics-attribute-adaptor.dto';
// import { UpdateMetricsAttributeAdaptorDto } from './dto/update-metrics-attribute-adaptor.dto';

import serviceConfig from '../app_config/service.config.json';
import { MetricsAttributeAdaptor } from './entities/metrics-attribute-adaptor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { Response } from 'express';
// import { FindMetricsAttributeAdaptorDto } from './dto/find-metrics-attribute-adaptor.dto';
// import {
//   deleteRec,
//   findAll,
//   restore,
//   softDelete,
// } from 'src/utils/cmnFn.repository';
// import { FindMetricsAttributeAdaptorsFromMultipleIDsDto } from './dto/find-metrics-attribute-adaptors-from-multipleIDs.dto';
// import { winstonServerLogger } from 'src/app_config/serverWinston.config (1)';
import { DUPLICATE_RECORD, KEY_SEPARATOR, NO_RECORD } from 'src/app_config/constants';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { FindMetricsAttributeAdaptorsFromMultipleIDsDto } from './dto/findMetricsAttributeAdaptorsFromMultipleIDsDto.dto';
import { FindMetricsAttributeAdaptorDto } from './dto/findMetricsAttributeAdaptorDto.dto';

@Injectable()
export class MetricsAttributeAdaptorService {
  // private relations = serviceConfig.metricsAttributeAdaptor.relations;
  private relations = []
  private readonly logger = winstonServerLogger(
    MetricsAttributeAdaptorService.name,
  );

  constructor(
    @InjectRepository(MetricsAttributeAdaptor)
    private readonly repo: Repository<MetricsAttributeAdaptor>,
  ) { }
  // async create(createMetricsAttributeAdaptorDto: CreateMetricsAttributeAdaptorDto) {
  //   const fnName = this.create.name;
  //   const input = `Input : Create object : ${JSON.stringify(createMetricsAttributeAdaptorDto)}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   const dataModelAdaptorId = createMetricsAttributeAdaptorDto.dataModelAdaptorId ?? createMetricsAttributeAdaptorDto.dataModelAdaptor.id;
  //   const deviceTypeId = createMetricsAttributeAdaptorDto.deviceTypeId ?? createMetricsAttributeAdaptorDto.deviceType?.id;
  //   const deviceModelId = createMetricsAttributeAdaptorDto.deviceModelId ?? createMetricsAttributeAdaptorDto.deviceModel?.id;
  //   const sourceAttribute = createMetricsAttributeAdaptorDto.sourceAttribute;

  //   const result = await this.repo.findOneBy({
  //     dataModelAdaptorId,
  //     deviceTypeId,
  //     deviceModelId,
  //     sourceAttribute
  //   })

  //   if (result != null) {
  //     this.logger.error(`${fnName}: ${DUPLICATE_RECORD} : MetricsAttributeAdaptor already exists`);
  //     throw new Error(`${DUPLICATE_RECORD} : MetricsAttributeAdaptor already exists`);
  //   }
  //   else {
  //     const createMetricsAttributeAdaptorObj = this.repo.create(createMetricsAttributeAdaptorDto);
  //     this.logger.debug(`${fnName} : ${JSON.stringify(createMetricsAttributeAdaptorObj)} to be created`);
  //     return await this.repo.save(createMetricsAttributeAdaptorObj);
  //   }

  // }

  // findAll(
  //   searchCriteria: FindMetricsAttributeAdaptorDto,
  //   relationsRequired: boolean = false,
  // ) {
  //   const fnName = this.findAll.name;
  //   const input = `Input : Find metricsAttributeAdaptor with searchCriteria : ${JSON.stringify(searchCriteria)}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   const relation = relationsRequired ? this.relations : [];
  //   return this.repo.find({
  //     where: searchCriteria,
  //     relations: relation
  //   })
  // }

  // /* findOne(id: number) {
  //   return `This action returns a #${id} attributeAdaptor`;
  // } */

  // findOne(
  //   searchCriteria: FindMetricsAttributeAdaptorDto,
  //   relationsRequired: boolean = false,
  // ) {
  //   const fnName = this.findOne.name;
  //   const input = `Input : Find metricsAttributeAdaptor with searchCriteria : ${JSON.stringify(searchCriteria)}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   let relations = relationsRequired ? this.relations : [];
  //   return this.repo.findOne({
  //     where: searchCriteria,
  //     relations: relations,
  //   });
  // }
  // findOneById(id: string) {
  //   const fnName = this.findOne.name;
  //   const input = `Input : Find metricsAttributeAdaptor with id : ${id}}`

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   return this.repo.findOneBy({ id: id });
  // }

  // async findAllWithMetricsAttribute(
  //   inputSearchCriteria: FindMetricsAttributeAdaptorsFromMultipleIDsDto,
  //   //relationsRequired: boolean = false,
  // ) {
  //   const fnName = this.findAllWithMetricsAttribute.name
  //   const searchCriteria = this.getFindMetricsAttributeAdaptor(inputSearchCriteria);

  //   this.logger.debug(`${fnName} : All searchCriteria : ${JSON.stringify(searchCriteria)}`);

  //   let result = await this.findMetricsAttributeAdaptors(searchCriteria);

  //   if (result && result.length > 0) {
  //     this.logger.debug(`Returned all result ${result.length}`);
  //     return result;
  //   }
  //   else if (searchCriteria.deviceModelId != null) {
  //     delete searchCriteria.deviceModelId;
  //     this.logger.debug(
  //       `${fnName} : Removed deviceModelIds searchCriteria : ${JSON.stringify(
  //         searchCriteria,
  //       )}`,
  //     );
  //     result = await this.findMetricsAttributeAdaptors(searchCriteria);
  //     if (result && result.length > 0) {
  //       this.logger.debug(
  //         `Returned Removed deviceModelIds result ${result.length}`,
  //       );
  //       return result;
  //     }
  //   }
  //   if (searchCriteria.deviceTypeId != null) {
  //     delete searchCriteria.deviceTypeId;
  //     this.logger.debug(
  //       `${fnName} : Removed deviceTypeIds searchCriteria : ${JSON.stringify(
  //         searchCriteria,
  //       )}`,
  //     );
  //     result = await this.findMetricsAttributeAdaptors(searchCriteria);
  //   }
  //   return result;
  // }

  // findMetricsAttributeAdaptors(
  //   findMetricsAttributeAdaptor: FindMetricsAttributeAdaptorDto,
  // ) {
  //   const fnName = this.findMetricsAttributeAdaptors.name;

  //   this.logger.debug(`${fnName} : Find MetricsAttributeAdaptors`);

  //   return this.repo.find({
  //     where: findMetricsAttributeAdaptor,
  //     relations: {
  //       deviceTypeMetricsAttribute: {
  //         metricsAttribute: true,
  //       },
  //     },
  //   });
  // }

  // async update(
  //   id: string,
  //   updateMetricsAttributeAdaptorDto: UpdateMetricsAttributeAdaptorDto,
  // ) {
  //   const fnName = this.update.name;
  //   const input = `Input : Id : ${id}, updateMetricsAttributeAdaptorDto : ${JSON.stringify(updateMetricsAttributeAdaptorDto)}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (updateMetricsAttributeAdaptorDto.id == null) {
  //     this.logger.debug(`${fnName} : MetricsAttributeAdaptor Id not found in updateMetricsAttributeAdaptorDto`);
  //     updateMetricsAttributeAdaptorDto.id = id;
  //   }
  //   else if (updateMetricsAttributeAdaptorDto.id != id) {
  //     this.logger.error(`${fnName} : MetricsAttributeAdaptor Id : ${id} and Update MetricsAttributeAdaptor Object Id : ${updateMetricsAttributeAdaptorDto.id} do not match`);
  //     throw new Error(`MetricsAttributeAdaptor Id : ${id} and Update MetricsAttributeAdaptor Object Id : ${updateMetricsAttributeAdaptorDto.id} do not match`);
  //   }
  //   const mergedMetricsAttrAdaptor = await this.repo.preload(updateMetricsAttributeAdaptorDto);
  //   if (mergedMetricsAttrAdaptor == null) {
  //     this.logger.error(`${fnName} : ${NO_RECORD} : MetricsAttributeAdaptor id : ${id} not found`);
  //     throw new Error(`${NO_RECORD} : MetricsAttributeAdaptor id : ${id} not found`);
  //   } else {
  //     this.logger.debug(
  //       `${fnName} : Merged MetricsAttributeAdaptor is : ${JSON.stringify(mergedMetricsAttrAdaptor)}`,
  //     );

  //     return await this.repo.save(mergedMetricsAttrAdaptor);
  //   }
  // }

  // delete(id: string) {
  //   const fnName = this.delete.name;
  //   const input = `Input : MetricsAttributeAdaptor id: ${id} to be deleted`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   return this.repo.delete(id);
  // }

  // async softDelete(id: string, metricsAttrAdaptorToBeDeleted: MetricsAttributeAdaptor) {
  //   const fnName = this.softDelete.name;
  //   const input = `Input : MetricsAttributeAdaptor id : ${id} to be softDeleted`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   await this.repo.save(metricsAttrAdaptorToBeDeleted);
  //   return this.repo.softDelete(id);
  // }

  // async restore(id: string) {
  //   const fnName = this.restore.name;
  //   const input = `Input : MetricsAttributeAdaptor id : ${id} to be restored`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);
  //   const result = await this.repo.restore(id);
  //   if (result.affected === 0) {
  //     this.logger.error(`${fnName} : ${NO_RECORD} : MetricsAttributeAdaptor id : ${id} not found`);
  //     throw new Error(`${NO_RECORD} : MetricsAttributeAdaptor id : ${id} not found`);
  //   }
  //   else {
  //     this.logger.debug(`${fnName} MetricsAttributeAdaptor id : ${id} restored successfully`);
  //     let restored = await this.findOneById(id);
  //     restored.deletedBy = null;
  //     this.repo.save(restored);
  //     return restored;
  //   }
  // }

  // getFindMetricsAttributeAdaptor(
  //   searchCriteria: FindMetricsAttributeAdaptorsFromMultipleIDsDto,
  // ): FindMetricsAttributeAdaptorDto {
  //   const fnName = this.getFindMetricsAttributeAdaptor.name;

  //   this.logger.debug(fnName);

  //   const findMetricsAttributeAdaptorDto: FindMetricsAttributeAdaptorDto = {};

  //   findMetricsAttributeAdaptorDto.dataModelAdaptorId = searchCriteria.dataModelAdaptorId;

  //   searchCriteria.csvDeviceTypeIds == null ? null :
  //     (findMetricsAttributeAdaptorDto.deviceTypeId = In(
  //       searchCriteria.csvDeviceTypeIds.split(','),
  //     ));
  //   /* searchCriteria.csvDeviceManufacturerIds == null
  //     ? null
  //     : (findMetricsAttributeAdaptorDto.deviceManufacturerId = In(
  //         searchCriteria.csvDeviceManufacturerIds.split(','),
  //       )); */

  //   searchCriteria.csvDeviceModelIds == null ? null :
  //     (findMetricsAttributeAdaptorDto.deviceModelId = In(
  //       searchCriteria.csvDeviceModelIds.split(','),
  //     ));
  //   return findMetricsAttributeAdaptorDto;
  // }



  async findAllWithMetricsAttribute(
    inputSearchCriteria: FindMetricsAttributeAdaptorsFromMultipleIDsDto,
    //relationsRequired: boolean = false,
  ) {
    const fnName = this.findAllWithMetricsAttribute.name
    const searchCriteria = this.getFindMetricsAttributeAdaptor(inputSearchCriteria);

    this.logger.debug(`${fnName} : All searchCriteria : ${JSON.stringify(searchCriteria)}`);

    let result = await this.findMetricsAttributeAdaptors(searchCriteria);

    if (result && result.length > 0) {
      this.logger.debug(`Returned all result ${result.length}`);
      return result;
    }
    else if (searchCriteria.deviceModelId != null) {
      delete searchCriteria.deviceModelId;
      this.logger.debug(
        `${fnName} : Removed deviceModelIds searchCriteria : ${JSON.stringify(
          searchCriteria,
        )}`,
      );
      result = await this.findMetricsAttributeAdaptors(searchCriteria);
      if (result && result.length > 0) {
        this.logger.debug(
          `Returned Removed deviceModelIds result ${result.length}`,
        );
        return result;
      }
    }
    if (searchCriteria.deviceTypeId != null) {
      delete searchCriteria.deviceTypeId;
      this.logger.debug(
        `${fnName} : Removed deviceTypeIds searchCriteria : ${JSON.stringify(
          searchCriteria,
        )}`,
      );
      result = await this.findMetricsAttributeAdaptors(searchCriteria);
    }
    return result;
  }



  findMetricsAttributeAdaptors(
    findMetricsAttributeAdaptor: FindMetricsAttributeAdaptorDto,
  ) {
    const fnName = this.findMetricsAttributeAdaptors.name;

    this.logger.debug(`${fnName} : Find MetricsAttributeAdaptors`);

    return this.repo.find({
      where: findMetricsAttributeAdaptor,
      relations: {
        deviceTypeMetricsAttribute: {
          metricsAttribute: true,
        },
      },
    });
  }


  getFindMetricsAttributeAdaptor(
    searchCriteria: FindMetricsAttributeAdaptorsFromMultipleIDsDto,
  ): FindMetricsAttributeAdaptorDto {
    const fnName = this.getFindMetricsAttributeAdaptor.name;

    this.logger.debug(fnName);

    const findMetricsAttributeAdaptorDto: FindMetricsAttributeAdaptorDto = {};

    findMetricsAttributeAdaptorDto.dataModelAdaptorId = searchCriteria.dataModelAdaptorId;

    searchCriteria.csvDeviceTypeIds == null ? null :
      (findMetricsAttributeAdaptorDto.deviceTypeId = In(
        searchCriteria.csvDeviceTypeIds.split(','),
      ));
    /* searchCriteria.csvDeviceManufacturerIds == null
      ? null
      : (findMetricsAttributeAdaptorDto.deviceManufacturerId = In(
          searchCriteria.csvDeviceManufacturerIds.split(','),
        )); */

    searchCriteria.csvDeviceModelIds == null ? null :
      (findMetricsAttributeAdaptorDto.deviceModelId = In(
        searchCriteria.csvDeviceModelIds.split(','),
      ));
    return findMetricsAttributeAdaptorDto;
  }
}
